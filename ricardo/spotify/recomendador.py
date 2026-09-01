"""
Módulos 2 e 5 — Recomendador por similaridade e por perfil do usuário.
"""
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from .dados import get_df, get_matrix


RESULT_COLUMNS = [
    'track_id', 'track_name', 'artists', 'similarity', 'popularity',
    'mood', 'genre_main', 'duration_min', 'is_explicit'
]


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


def get_user_profile_recommendations(favorite_tracks_indices, n=10, exclude_explicit=False):
    """
    Recomendações baseadas no perfil do usuário (média das músicas favoritas).
    Estilo 'Sua Biblioteca' do Spotify.

    Parâmetros:
        favorite_tracks_indices (list): lista de índices das músicas favoritas
        n (int): número de recomendações
        exclude_explicit (bool): remove conteúdo explícito

    Retorna:
        DataFrame com músicas compatíveis com o perfil do usuário
    """
    df = get_df()
    matrix = get_matrix()

    favorite_tracks_indices = list(dict.fromkeys(favorite_tracks_indices))
    if not favorite_tracks_indices:
        raise ValueError("Selecione ao menos uma música favorita.")
    invalid = [index for index in favorite_tracks_indices if index not in df.index]
    if invalid:
        raise ValueError(f"Índices de faixas inválidos: {invalid}")
    if n < 1:
        raise ValueError("O número de recomendações deve ser positivo.")

    user_vector = matrix[favorite_tracks_indices].mean(axis=0).reshape(1, -1)
    sims = cosine_similarity(user_vector, matrix)[0]

    return _select_diverse(
        df, sims, favorite_tracks_indices, n, exclude_explicit
    )


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
