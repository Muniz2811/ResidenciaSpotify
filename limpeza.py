"""Limpa e valida o dataset de faixas do Spotify.

Por padrão, lê ``Dataset/dataset.csv`` e grava
``Dataset/dataset_cleaned.csv``, sempre em relação à pasta deste script.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_INPUT = BASE_DIR / "Dataset" / "dataset.csv"
DEFAULT_OUTPUT = BASE_DIR / "Dataset" / "dataset_cleaned.csv"

TEXT_COLUMNS = ["track_id", "artists", "album_name", "track_name", "track_genre"]
NUMERIC_COLUMNS = [
    "popularity",
    "duration_ms",
    "danceability",
    "energy",
    "key",
    "loudness",
    "mode",
    "speechiness",
    "acousticness",
    "instrumentalness",
    "liveness",
    "valence",
    "tempo",
    "time_signature",
]
REQUIRED_COLUMNS = TEXT_COLUMNS + NUMERIC_COLUMNS + ["explicit"]

BOUNDED_COLUMNS = {
    "popularity": (0, 100),
    "duration_ms": (0, None),
    "danceability": (0, 1),
    "energy": (0, 1),
    "key": (0, 11),
    "mode": (0, 1),
    "speechiness": (0, 1),
    "acousticness": (0, 1),
    "instrumentalness": (0, 1),
    "liveness": (0, 1),
    "valence": (0, 1),
    "tempo": (0, None),
    "time_signature": (0, 7),
}


def parse_explicit(series: pd.Series) -> pd.Series:
    """Converte valores booleanos usuais para inteiros 0/1."""
    mapping = {
        True: 1,
        False: 0,
        1: 1,
        0: 0,
        "true": 1,
        "false": 0,
        "1": 1,
        "0": 0,
    }
    normalized = series.map(
        lambda value: value.strip().lower() if isinstance(value, str) else value
    )
    converted = normalized.map(mapping)
    invalid = series[converted.isna()].drop_duplicates().tolist()
    if invalid:
        raise ValueError(f"Valores inválidos na coluna 'explicit': {invalid}")
    return converted.astype("int8")


def validate_schema(df: pd.DataFrame) -> None:
    """Valida a presença das colunas esperadas."""
    missing = sorted(set(REQUIRED_COLUMNS) - set(df.columns))
    if missing:
        raise ValueError(f"Colunas obrigatórias ausentes: {missing}")


def validate_ranges(df: pd.DataFrame) -> None:
    """Rejeita valores fora dos domínios documentados das variáveis."""
    errors: list[str] = []
    for column, (minimum, maximum) in BOUNDED_COLUMNS.items():
        invalid = df[column] < minimum
        if maximum is not None:
            invalid |= df[column] > maximum
        if invalid.any():
            errors.append(f"{column}: {int(invalid.sum())} valor(es) fora da faixa")

    if errors:
        raise ValueError("Dados numéricos inválidos: " + "; ".join(errors))


def clean_dataset(input_path: Path, output_path: Path) -> pd.DataFrame:
    """Carrega, limpa, valida e salva o dataset."""
    print(f"Carregando os dados de '{input_path}'...")
    df = pd.read_csv(input_path, encoding="utf-8", low_memory=False)
    original_rows, original_columns = df.shape
    print(f"Tamanho original: {original_rows} linhas e {original_columns} colunas")

    index_columns = [column for column in df.columns if column.startswith("Unnamed:")]
    if index_columns:
        df = df.drop(columns=index_columns)
        print(f"Coluna(s) de índice removida(s): {', '.join(index_columns)}")

    validate_schema(df)

    # Espaços vazios também representam ausência de texto.
    for column in TEXT_COLUMNS:
        df[column] = df[column].replace(r"^\s*$", pd.NA, regex=True)

    missing_rows = df[TEXT_COLUMNS].isna().any(axis=1)
    removed_missing = int(missing_rows.sum())
    df = df.loc[~missing_rows].copy()

    for column in NUMERIC_COLUMNS:
        df[column] = pd.to_numeric(df[column], errors="raise")
    if df[NUMERIC_COLUMNS].isna().any().any():
        null_counts = df[NUMERIC_COLUMNS].isna().sum()
        null_counts = null_counts[null_counts > 0].to_dict()
        raise ValueError(f"Valores nulos em colunas numéricas: {null_counts}")

    df["explicit"] = parse_explicit(df["explicit"])
    validate_ranges(df)

    # O mesmo track_id pode estar corretamente associado a vários gêneros.
    # Portanto, removemos somente linhas idênticas após retirar o índice exportado.
    before_duplicates = len(df)
    df = df.drop_duplicates().reset_index(drop=True)
    removed_duplicates = before_duplicates - len(df)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False, encoding="utf-8")

    print(f"Linhas com campos textuais obrigatórios ausentes: {removed_missing}")
    print(f"Duplicatas idênticas removidas: {removed_duplicates}")
    print(f"Arquivo limpo salvo em '{output_path}'.")
    print(f"Tamanho final: {df.shape[0]} linhas e {df.shape[1]} colunas")
    return df


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input",
        type=Path,
        default=DEFAULT_INPUT,
        help=f"CSV de entrada (padrão: {DEFAULT_INPUT})",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"CSV de saída (padrão: {DEFAULT_OUTPUT})",
    )
    return parser


def main() -> None:
    args = build_parser().parse_args()
    clean_dataset(args.input.resolve(), args.output.resolve())


if __name__ == "__main__":
    main()
