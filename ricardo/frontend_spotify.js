"use strict";

const API = "/api";
const FAVORITES_KEY = "spotdata-favorites-v1";
const DATA = { top5: [], moods: {}, podcasts: [], recs: [], recRefs: [] };
const TRACKS = new Map();

let curGenre = "pop";
let curMood = "todos";
let playing = false;
let searchTimer = null;
let searchSequence = 0;
let favorites = loadFavorites();

function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return new Map(saved.filter(track => track.track_id).map(track => [track.track_id, track]));
  } catch {
    return new Map();
  }
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites.values()]));
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  if (!response.ok) {
    let message = `Erro HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body.detail || message;
    } catch { /* resposta sem JSON */ }
    throw new Error(message);
  }
  return response.json();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function registerTracks(tracks) {
  tracks.forEach(track => TRACKS.set(track.track_id, track));
  return tracks;
}

function compactTrack(track) {
  return {
    track_id: track.track_id,
    track_name: track.track_name,
    artists: track.artists,
    popularity: track.popularity,
    mood: track.mood,
    genre_main: track.genre_main,
    duration_min: track.duration_min,
    is_explicit: Boolean(track.is_explicit),
  };
}

function moodClass(mood = "") {
  if (mood.includes("🟡")) return "mood-a";
  if (mood.includes("🔴")) return "mood-i";
  if (mood.includes("🔵")) return "mood-t";
  return "mood-r";
}

function trackRow(track, index, showSimilarity = false) {
  TRACKS.set(track.track_id, track);
  const explicit = track.is_explicit ? '<span class="explicit-tag">E</span>' : "";
  const score = showSimilarity && track.similarity !== undefined
    ? `<span style="font-size:12px;color:var(--text3)">sim ${Number(track.similarity).toFixed(3)}</span>`
    : `<span class="track-pop">${Number(track.popularity || 0)}</span>`;
  const isFavorite = favorites.has(track.track_id);

  return `<div class="track-row" data-track-id="${escapeHtml(track.track_id)}">
    <span class="track-num">${index}</span>
    <div class="track-info">
      <div class="track-name">${escapeHtml(track.track_name)}${explicit}</div>
      <div class="track-artist">${escapeHtml(track.artists).replaceAll(";", " · ")}</div>
    </div>
    <span class="mood-badge ${moodClass(track.mood)}">${escapeHtml(track.mood || "—")}</span>
    ${score}
    <span class="track-actions">
      <button class="track-action" data-action="similar" data-track-id="${escapeHtml(track.track_id)}" title="Encontrar parecidas">⌕</button>
      <button class="track-action ${isFavorite ? "favorite" : ""}" data-action="favorite" data-track-id="${escapeHtml(track.track_id)}" title="Favoritar">${isFavorite ? "♥" : "♡"}</button>
    </span>
  </div>`;
}

function renderList(elementId, tracks, showSimilarity = false, emptyMessage = "Nenhuma música encontrada.") {
  registerTracks(tracks);
  const element = document.getElementById(elementId);
  element.innerHTML = tracks.length
    ? tracks.map((track, index) => trackRow(track, index + 1, showSimilarity)).join("")
    : `<div class="empty-state">${escapeHtml(emptyMessage)}</div>`;
}

function loading(elementId, message = "Carregando dados da API…") {
  document.getElementById(elementId).innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function showError(elementId, error) {
  document.getElementById(elementId).innerHTML = `<div class="empty-state" style="color:#ff8c8c">${escapeHtml(error.message)}</div>`;
}

function setApiStatus(message, error = false) {
  const status = document.getElementById("api-status");
  status.textContent = message;
  status.classList.toggle("error", error);
}

function goTo(id, element) {
  document.querySelectorAll(".section").forEach(section => section.classList.remove("active"));
  document.getElementById(`sec-${id}`).classList.add("active");
  document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
  if (element) element.classList.add("active");
  if (id === "profile") renderFavorites();
}

function renderTop5() {
  renderList("top5-list", DATA.top5);
}

function renderMoods() {
  const total = Object.values(DATA.moods).reduce((sum, count) => sum + count, 0);
  const config = [
    { key: "Animado 🟡", color: "#f4c20d", label: "Animado" },
    { key: "Intenso 🔴", color: "#ff6b6b", label: "Intenso" },
    { key: "Triste 🔵", color: "#5ba3f5", label: "Triste" },
    { key: "Relaxado 🟢", color: "#4caf7d", label: "Relaxado" },
  ];
  document.getElementById("mood-grid").innerHTML = config.map(item => {
    const count = DATA.moods[item.key] || 0;
    const percent = total ? (count / total * 100).toFixed(1) : "0.0";
    return `<div class="mood-card"><div>
      <div class="mood-label">${item.label}</div>
      <div class="mood-count">${count.toLocaleString("pt-BR")} músicas · ${percent}%</div>
      <div class="mood-bar-wrap"><div class="mood-bar" style="width:${percent}%;background:${item.color}"></div></div>
    </div></div>`;
  }).join("");
}

async function renderPlaylist() {
  const hideExplicit = document.getElementById("chk-explicit").checked;
  const params = new URLSearchParams({
    genre: curGenre,
    mood: curMood,
    n: "20",
    exclude_explicit: String(hideExplicit),
  });
  loading("playlist-list");
  try {
    const tracks = await apiFetch(`/playlist?${params}`);
    renderList("playlist-list", tracks, false, "Nenhuma música encontrada com esses filtros.");
  } catch (error) {
    showError("playlist-list", error);
  }
}

function setGenre(genre, element) {
  curGenre = genre;
  document.querySelectorAll("#genre-filters .filter-btn").forEach(button => button.classList.remove("active"));
  if (element) element.classList.add("active");
  else {
    document.querySelectorAll("#genre-filters .filter-btn").forEach(button => {
      if (button.textContent.toLowerCase().includes(genre)) button.classList.add("active");
    });
  }
  renderPlaylist();
}

function setMood(mood, element) {
  curMood = mood;
  document.querySelectorAll("#mood-filters .filter-btn").forEach(button => button.classList.remove("active"));
  if (element) element.classList.add("active");
  renderPlaylist();
}

function setPill(element, genre) {
  document.querySelectorAll(".pill").forEach(pill => pill.classList.remove("active"));
  element.classList.add("active");
  if (genre !== "todos") {
    setGenre(genre);
    goTo("playlist", document.querySelectorAll(".nav-item")[2]);
  }
}

async function loadSimilar(track) {
  if (!track) return;
  const discoverNav = document.querySelectorAll(".nav-item")[1];
  goTo("discover", discoverNav);
  document.getElementById("ref-name").textContent = track.track_name;
  document.getElementById("ref-artist").textContent = `${track.artists.replaceAll(";", " · ")} · ${track.genre_main || ""} · ${track.mood || ""}`;
  document.getElementById("ref-card").querySelector('[style*="28px"]').textContent = track.popularity;
  loading("rec-list", "Calculando similaridade no Python…");
  try {
    const result = await apiFetch(`/tracks/${encodeURIComponent(track.track_id)}/recommendations?n=12`);
    DATA.recs = registerTracks(result.recommendations);
    renderList("rec-list", result.recommendations, true);
  } catch (error) {
    showError("rec-list", error);
  }
}

function loadRecs(index, element) {
  document.querySelectorAll("#recommendation-seeds .filter-btn").forEach(button => button.classList.remove("active"));
  if (element) element.classList.add("active");
  loadSimilar(DATA.top5[index]);
}

async function loadPodcasts() {
  try {
    DATA.podcasts = registerTracks(await apiFetch("/podcasts?n=20"));
    const icons = ["🎧", "🎚️", "🎛️", "🔊", "🎶", "🎵"];
    const element = document.getElementById("pod-list");
    element.innerHTML = DATA.podcasts.map((track, index) => `
      <div class="pod-row" data-track-id="${escapeHtml(track.track_id)}">
        <div class="pod-cover">${icons[index % icons.length]}</div>
        <div><div class="pod-name">${escapeHtml(track.track_name)}</div>
        <div class="pod-meta">${escapeHtml(track.artists)} · ${escapeHtml(track.track_genre)}</div></div>
        <div class="pod-dur">${Number(track.duration_min).toFixed(0)} min</div>
      </div>`).join("");
  } catch (error) {
    showError("pod-list", error);
  }
}

function handleSearch(query) {
  clearTimeout(searchTimer);
  const normalized = query.trim();
  if (!normalized) {
    goTo("home", document.querySelectorAll(".nav-item")[0]);
    return;
  }
  document.querySelectorAll(".section").forEach(section => section.classList.remove("active"));
  document.getElementById("sec-busca").classList.add("active");
  if (normalized.length < 2) {
    document.getElementById("search-sub").textContent = "Digite ao menos dois caracteres.";
    document.getElementById("search-list").innerHTML = "";
    return;
  }
  searchTimer = setTimeout(() => runSearch(normalized), 250);
}

async function runSearch(query) {
  const currentSequence = ++searchSequence;
  loading("search-list", "Pesquisando no catálogo completo…");
  try {
    const tracks = await apiFetch(`/tracks/search?q=${encodeURIComponent(query)}&limit=30`);
    if (currentSequence !== searchSequence) return;
    document.getElementById("search-sub").textContent = `${tracks.length} resultado${tracks.length === 1 ? "" : "s"} para “${query}”`;
    renderList("search-list", tracks);
  } catch (error) {
    if (currentSequence === searchSequence) showError("search-list", error);
  }
}

function clearSearch() {
  document.getElementById("searchInput").value = "";
  goTo("home", document.querySelectorAll(".nav-item")[0]);
}

function toggleFavorite(track) {
  if (!track) return;
  if (favorites.has(track.track_id)) favorites.delete(track.track_id);
  else favorites.set(track.track_id, compactTrack(track));
  saveFavorites();
  updateFavoriteUi();
  document.getElementById("profile-rec-list").innerHTML = '<div class="empty-state">Perfil alterado. Recalcule as recomendações.</div>';
}

function updateFavoriteUi() {
  const count = favorites.size;
  document.getElementById("favorite-count").textContent = count;
  document.getElementById("profile-summary").textContent = count
    ? `${count} música${count === 1 ? "" : "s"} no seu perfil`
    : "Nenhuma favorita selecionada";
  document.querySelectorAll('[data-action="favorite"]').forEach(button => {
    const selected = favorites.has(button.dataset.trackId);
    button.classList.toggle("favorite", selected);
    button.textContent = selected ? "♥" : "♡";
  });
  renderFavorites();
}

function renderFavorites() {
  renderList("favorite-list", [...favorites.values()], false, "Use o coração ao lado de uma música para favoritar.");
}

async function generateProfileRecommendations() {
  goTo("profile", document.querySelectorAll(".nav-item")[4]);
  const ids = [...favorites.keys()];
  if (!ids.length) {
    document.getElementById("profile-rec-list").innerHTML = '<div class="empty-state">Selecione ao menos uma favorita.</div>';
    return;
  }
  loading("profile-rec-list", "Recalculando seu perfil no Python…");
  try {
    const result = await apiFetch("/recommendations/profile", {
      method: "POST",
      body: JSON.stringify({ favorite_track_ids: ids, n: 20, exclude_explicit: false }),
    });
    renderList("profile-rec-list", result.recommendations, true);
  } catch (error) {
    showError("profile-rec-list", error);
  }
}

function clearFavorites() {
  favorites.clear();
  saveFavorites();
  updateFavoriteUi();
  document.getElementById("profile-rec-list").innerHTML = '<div class="empty-state">Selecione favoritas para começar.</div>';
}

function nowPlay(name, artist) {
  document.getElementById("np-name").textContent = name;
  document.getElementById("np-artist").innerHTML = `<span>${escapeHtml(artist)}</span><span style="background:var(--bg4);color:var(--text3);font-size:9px;padding:1px 5px;border-radius:3px;font-weight:600;margin-left:6px">CATÁLOGO</span>`;
  playing = true;
  document.getElementById("np-play-btn").innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
}

function togglePlay() {
  playing = !playing;
  document.getElementById("np-play-btn").innerHTML = playing
    ? '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
    : '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
}

document.addEventListener("click", event => {
  const action = event.target.closest("[data-action]");
  if (action) {
    event.stopPropagation();
    const track = TRACKS.get(action.dataset.trackId);
    if (action.dataset.action === "favorite") toggleFavorite(track);
    if (action.dataset.action === "similar") loadSimilar(track);
    return;
  }
  const row = event.target.closest("[data-track-id]");
  if (row) {
    const track = TRACKS.get(row.dataset.trackId);
    if (track) nowPlay(track.track_name, track.artists.split(";")[0]);
  }
});

async function bootstrap() {
  updateFavoriteUi();
  loading("top5-list");
  loading("playlist-list");
  try {
    const [stats, top] = await Promise.all([apiFetch("/stats"), apiFetch("/top")]);
    DATA.top5 = registerTracks(top);
    DATA.moods = stats.moods;
    document.getElementById("stats-tracks").textContent = stats.tracks.toLocaleString("pt-BR");
    document.getElementById("stats-genres").textContent = stats.genres;
    document.getElementById("hero-tracks").textContent = stats.tracks.toLocaleString("pt-BR");
    document.getElementById("hero-genres").textContent = stats.genres;
    document.getElementById("mood-subtitle").textContent = `Distribuição por valência × energia — ${stats.tracks.toLocaleString("pt-BR")} músicas`;
    document.getElementById("count-pop").textContent = `${stats.genre_counts.pop.toLocaleString("pt-BR")} faixas`;
    document.getElementById("count-samba").textContent = `${stats.genre_counts.samba.toLocaleString("pt-BR")} faixas`;
    document.getElementById("count-sertanejo").textContent = `${stats.genre_counts.sertanejo.toLocaleString("pt-BR")} faixas`;
    document.getElementById("count-podcasts").textContent = `${stats.podcasts.toLocaleString("pt-BR")} faixas sinalizadas`;
    document.getElementById("podcast-subtitle").textContent = `Faixas com mais de 20 minutos · ${stats.podcasts.toLocaleString("pt-BR")} sinalizadas no catálogo`;
    renderTop5();
    renderMoods();
    document.querySelectorAll("#recommendation-seeds .filter-btn").forEach((button, index) => {
      if (top[index]) button.textContent = `${top[index].track_name} · ${top[index].artists.split(";")[0]}`;
    });
    document.getElementById("hero-play").addEventListener("click", () => nowPlay(top[0].track_name, top[0].artists.split(";")[0]));
    await Promise.all([renderPlaylist(), loadPodcasts(), loadSimilar(top[0])]);
    goTo("home", document.querySelectorAll(".nav-item")[0]);
    setApiStatus("API conectada · dados reais");
  } catch (error) {
    setApiStatus("Falha ao conectar à API", true);
    showError("top5-list", error);
  }
}

bootstrap();
