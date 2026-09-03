"""Módulos 2 e 4 — recomendação por faixa, perfil e playlists."""
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from .dados import FEATURES_SCALED, get_df, get_matrix


RESULT_COLUMNS = [
    'track_id', 'track_name', 'artists', 'similarity', 'popularity',
    'mood', 'genre_main', 'duration_min', 'is_explicit'
]

FEATURE_LABELS = {
    'danceability_scaled': 'Dançabilidade',
    'energy_scaled': 'Energia',
    'speechiness_scaled': 'Fala',
    'acousticness_scaled': 'Acústica',
    'instrumentalness_scaled': 'Instrumentalidade',
    'liveness_scaled': 'Ao vivo',
    'valence_scaled': 'Valência',
    'tempo_scaled': 'Andamento',
}


def _rounded_vector(vector):
    """Converte um vetor NumPy em números JSON seguros e legíveis."""
    return [round(float(value), 6) for value in vector]


def explain_recommendations(source_indices, recommendations):
    """Expõe os mesmos vetores e operações usados pela similaridade de cossenos."""
    df = get_df()
    matrix = get_matrix()
    source_indices = list(dict.fromkeys(source_indices))
    source_matrix = matrix[source_indices]
    source_vector = source_matrix.mean(axis=0)
    source_norm = float(np.linalg.norm(source_vector))
    track_index_by_id = pd.Series(df.index, index=df['track_id']).to_dict()

    explained_recommendations = []
    for row in recommendations.itertuples(index=False):
        candidate_index = track_index_by_id[row.track_id]
        candidate_vector = matrix[candidate_index]
        candidate_norm = float(np.linalg.norm(candidate_vector))
        dot_product = float(np.dot(source_vector, candidate_vector))
        denominator = source_norm * candidate_norm
        similarity = dot_product / denominator if denominator else 0.0
        explained_recommendations.append({
            'track_id': row.track_id,
            'track_name': row.track_name,
            'artists': row.artists,
            'vector': _rounded_vector(candidate_vector),
            'component_products': _rounded_vector(source_vector * candidate_vector),
            'dot_product': round(dot_product, 6),
            'source_norm': round(source_norm, 6),
            'candidate_norm': round(candidate_norm, 6),
            'denominator': round(denominator, 6),
            'similarity': round(similarity, 6),
        })

    source_tracks = df.loc[source_indices, ['track_id', 'track_name', 'artists']]
    return {
        'features': [
            {'key': column.removesuffix('_scaled'), 'label': FEATURE_LABELS[column]}
            for column in FEATURES_SCALED
        ],
        'normalization': 'z-score',
        'source_count': len(source_indices),
        'source_tracks': source_tracks.to_dict(orient='records'),
        'component_sums': _rounded_vector(source_matrix.sum(axis=0)),
        'source_vector': _rounded_vector(source_vector),
        'recommendations': explained_recommendations,
    }


def search_track(query, limit=20):
    """
    Busca uma música pelo nome ou artista.

    Parâmetros:
        query (str): nome da música ou artista

    Retorna:
        DataFrame com até 8 resultados encontrados
    """
    df = get_df()
    query = query.strip()
    if len(query) < 2:
        return pd.DataFrame(columns=[
            'index', 'track_id', 'track_name', 'artists', 'popularity',
            'mood', 'genre_main', 'duration_min', 'is_explicit'
        ])
    mask = (
        df['track_name'].str.contains(query, case=False, regex=False, na=False) |
        df['artists'].str.contains(query, case=False, regex=False, na=False)
    )
    results = df.loc[mask, [
        'track_id', 'track_name', 'artists', 'popularity',
        'mood', 'genre_main', 'duration_min', 'is_explicit'
    ]].head(limit)
    return results.reset_index()


def _select_diverse(df, similarities, excluded_indices, n, exclude_explicit):
    """Ordena com precisão total e limita o resultado a uma faixa por artista."""
    candidates = df.copy()
    candidates['_similarity_raw'] = similarities
    candidates = candidates[~candidates.index.isin(excluded_indices)]

    if exclude_explicit:
        candidates = candidates[~candidates['is_explicit']]

    candidates = candidates.sort_values(
        ['_similarity_raw', 'popularity'], ascending=[False, False]
    )

    seen_artists = set()
    selected_indices = []
    for index, row in candidates.iterrows():
        artist = row['artists'].split(';')[0].strip().casefold()
        if artist not in seen_artists:
            seen_artists.add(artist)
            selected_indices.append(index)
        if len(selected_indices) >= n:
            break

    if not selected_indices:
        return pd.DataFrame(columns=RESULT_COLUMNS)

    result = candidates.loc[selected_indices].copy()
    result['similarity'] = result['_similarity_raw'].round(4)
    result = result[RESULT_COLUMNS].reset_index(drop=True)
    result.index = result.index + 1
    return result


def recommend_similar(track_index, n=10, exclude_explicit=False, same_mood=False):
    """
    Retorna as N músicas mais similares a uma música de referência.
    Usa cosine similarity nas features de áudio normalizadas.

    Parâmetros:
        track_index (int): índice da música no DataFrame
        n (int): número de recomendações
        exclude_explicit (bool): remove conteúdo explícito
        same_mood (bool): restringe ao mesmo quadrante emocional

    Retorna:
        DataFrame com as músicas recomendadas e score de similaridade
    """
    df = get_df()
    matrix = get_matrix()

    if track_index not in df.index:
        raise ValueError(f"Índice de faixa inválido: {track_index}")
    if n < 1:
        raise ValueError("O número de recomendações deve ser positivo.")

    query_vec = matrix[track_index].reshape(1, -1)
    sims = cosine_similarity(query_vec, matrix)[0]

    candidate_df = df
    if same_mood:
        ref_mood = df.loc[track_index, 'mood']
        candidate_df = df[df['mood'] == ref_mood]
        candidate_sims = sims[candidate_df.index]
        full_sims = pd.Series(candidate_sims, index=candidate_df.index)
    else:
        full_sims = sims

    return _select_diverse(
        candidate_df, full_sims, [track_index], n, exclude_explicit
    )


def recommend_from_tracks(track_indices, n=10, exclude_explicit=False):
    """
    Recomenda a partir do vetor médio de um conjunto de músicas.

    Parâmetros:
        track_indices (list): índices das músicas que formam o perfil
        n (int): número de recomendações
        exclude_explicit (bool): remove conteúdo explícito

    Retorna:
        DataFrame com músicas compatíveis com o perfil do usuário
    """
    df = get_df()
    matrix = get_matrix()

    track_indices = list(dict.fromkeys(track_indices))
    if not track_indices:
        raise ValueError("Selecione ao menos uma música.")
    invalid = [index for index in track_indices if index not in df.index]
    if invalid:
        raise ValueError(f"Índices de faixas inválidos: {invalid}")
    if n < 1:
        raise ValueError("O número de recomendações deve ser positivo.")

    group_vector = matrix[track_indices].mean(axis=0).reshape(1, -1)
    sims = cosine_similarity(group_vector, matrix)[0]

    return _select_diverse(
        df, sims, track_indices, n, exclude_explicit
    )


def get_user_profile_recommendations(favorite_tracks_indices, n=10, exclude_explicit=False):
    """Mantém a API do perfil e reutiliza o recomendador por conjunto."""
    return recommend_from_tracks(favorite_tracks_indices, n, exclude_explicit)


if __name__ == '__main__':
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    from spotify.dados import load_data
    load_data('dataset_clean.csv')

    print("\n🔍 Buscando 'Sam Smith':")
    results = search_track("Sam Smith")
    print(results[['track_name', 'artists', 'popularity', 'mood']].to_string())

    ref_idx = results.iloc[0]['index']
    print(f"\n🎯 Músicas similares a: '{results.iloc[0]['track_name']}'")
    recs = recommend_similar(ref_idx, n=5)
    for i, row in recs.iterrows():
        print(f"  {i}. sim={row['similarity']:.3f} | [{row['popularity']}] {row['track_name'][:35]}")
