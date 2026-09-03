"""API HTTP do SpotData e servidor do frontend.

Execute na pasta ``ricardo`` com::

    python -m uvicorn api:app --reload
"""

from __future__ import annotations

import json
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from spotify.dados import get_df, load_data
from spotify.playlist import build_playlist
from spotify.recomendador import (
    explain_recommendations,
    get_user_profile_recommendations,
    recommend_from_tracks,
    recommend_similar,
    search_track,
)
from spotify.top5 import get_top5


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset_clean.csv"
FRONTEND_PATH = BASE_DIR / "frontend_spotify.html"
JAVASCRIPT_PATH = BASE_DIR / "frontend_spotify.js"


def dataframe_records(frame):
    """Converte um DataFrame em tipos JSON nativos, preservando UTF-8."""
    return json.loads(frame.to_json(orient="records", force_ascii=False))


def track_index(track_id: str) -> int:
    df = get_df()
    matches = df.index[df["track_id"] == track_id]
    if len(matches) == 0:
        raise HTTPException(status_code=404, detail="Música não encontrada.")
    return int(matches[0])


def track_record(index: int) -> dict:
    columns = [
        "track_id",
        "track_name",
        "artists",
        "popularity",
        "mood",
        "genre_main",
        "duration_min",
        "is_explicit",
    ]
    return dataframe_records(get_df().loc[[index], columns])[0]


@asynccontextmanager
async def lifespan(_: FastAPI):
    load_data(DATASET_PATH)
    yield


app = FastAPI(
    title="SpotData API",
    description="Catálogo e recomendações musicais por similaridade de cossenos.",
    version="1.0.0",
    lifespan=lifespan,
)


class ProfileRequest(BaseModel):
    favorite_track_ids: list[str] = Field(min_length=1, max_length=100)
    n: int = Field(default=10, ge=1, le=50)
    exclude_explicit: bool = False


class PlaylistRecommendationRequest(BaseModel):
    track_ids: list[str] = Field(min_length=1, max_length=100)
    exclude_explicit: bool = False


@app.get("/", include_in_schema=False)
def frontend():
    return FileResponse(FRONTEND_PATH)


@app.get("/frontend_spotify.js", include_in_schema=False)
def frontend_javascript():
    return FileResponse(JAVASCRIPT_PATH, media_type="text/javascript")


@app.get("/api/health")
def health():
    return {"status": "ok", "tracks": len(get_df())}


@app.get("/api/stats")
def stats():
    df = get_df()
    return {
        "tracks": len(df),
        "genres": int(df["track_genre"].nunique()),
        "moods": {key: int(value) for key, value in df["mood"].value_counts().items()},
        "genre_counts": {
            genre: int((df["genre_main"] == genre).sum())
            for genre in ("pop", "samba", "sertanejo")
        },
    }


@app.get("/api/top")
def top_tracks(
    genre: str | None = None,
    exclude_explicit: bool = False,
):
    return dataframe_records(get_top5(exclude_explicit, genre))


@app.get("/api/playlist")
def playlist(
    genre: str | None = None,
    mood: str | None = None,
    n: int = Query(default=20, ge=1, le=100),
    exclude_explicit: bool = False,
):
    selected_mood = None if mood in (None, "", "todos") else mood
    result = build_playlist(genre, selected_mood, n, exclude_explicit)
    return dataframe_records(result)


@app.get("/api/tracks/search")
def search_tracks(
    q: str = Query(min_length=2, max_length=100),
    limit: int = Query(default=20, ge=1, le=50),
):
    return dataframe_records(search_track(q, limit))


@app.get("/api/tracks/{track_id}/recommendations")
def track_recommendations(
    track_id: str,
    n: int = Query(default=10, ge=1, le=50),
    exclude_explicit: bool = False,
    same_mood: bool = False,
):
    index = track_index(track_id)
    recommendations = recommend_similar(index, n, exclude_explicit, same_mood)
    return {
        "reference": track_record(index),
        "recommendations": dataframe_records(recommendations),
        "explanation": explain_recommendations([index], recommendations),
    }


@app.post("/api/recommendations/profile")
def profile_recommendations(payload: ProfileRequest):
    unique_ids = list(dict.fromkeys(payload.favorite_track_ids))
    indices = [track_index(track_id) for track_id in unique_ids]
    try:
        recommendations = get_user_profile_recommendations(
            indices, payload.n, payload.exclude_explicit
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    return {
        "favorite_count": len(indices),
        "recommendations": dataframe_records(recommendations),
        "explanation": explain_recommendations(indices, recommendations),
    }


@app.post("/api/recommendations/playlist")
def playlist_recommendations(payload: PlaylistRecommendationRequest):
    """Recomenda cinco músicas pelo vetor médio das faixas da playlist."""
    unique_ids = list(dict.fromkeys(payload.track_ids))
    indices = [track_index(track_id) for track_id in unique_ids]
    try:
        recommendations = recommend_from_tracks(
            indices, n=5, exclude_explicit=payload.exclude_explicit
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    return {
        "playlist_track_count": len(indices),
        "recommendations": dataframe_records(recommendations),
        "explanation": explain_recommendations(indices, recommendations),
    }
