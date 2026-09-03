"use strict";

const API = "/api";
const FAVORITES_KEY = "spotdata-favorites-v1";
const PLAYLISTS_KEY = "spotdata-playlists-v1";
const ACTIVE_PLAYLIST_KEY = "spotdata-active-playlist-v1";
const DATA = { top5: [], moods: {}, recs: [], recRefs: [] };
const EXPLANATIONS = { track: null, profile: null, playlist: null };
const TRACKS = new Map();
const ARTWORK = new Map();
const ARTWORK_PENDING = new Set();
const ARTWORK_FETCHING = new Set();

let playing = false;
let currentTrack = null;
let spotifyIframeApi = null;
let spotifyController = null;
let searchTimer = null;
let searchSequence = 0;
let playlistSearchTimer = null;
let playlistSearchSequence = 0;
let playlistRecommendationSequence = 0;
let profileRecommendationSequence = 0;
let similarRecommendationSequence = 0;
let genreBrowseSequence = 0;
let artworkTimer = null;
let toastTimer = null;
let favorites = loadFavorites();
let userPlaylists = loadUserPlaylists();
let activePlaylistId = localStorage.getItem(ACTIVE_PLAYLIST_KEY);

window.onSpotifyIframeApiReady = IFrameAPI => {
  spotifyIframeApi = IFrameAPI;
  if (currentTrack && !spotifyController) createSpotifyPlayer(currentTrack);
};

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

function loadUserPlaylists() {
  try {
    const saved = JSON.parse(localStorage.getItem(PLAYLISTS_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter(item => item?.id && item?.name && /^[A-Za-z0-9-]+$/.test(String(item.id))).map(item => ({
      id: String(item.id),
      name: String(item.name).slice(0, 50),
      tracks: Array.isArray(item.tracks)
        ? item.tracks.filter(track => track?.track_id).map(compactTrack)
        : [],
    }));
  } catch {
    return [];
  }
}

function saveUserPlaylists() {
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(userPlaylists));
  if (activePlaylistId) localStorage.setItem(ACTIVE_PLAYLIST_KEY, activePlaylistId);
  else localStorage.removeItem(ACTIVE_PLAYLIST_KEY);
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

function coverHue(trackId = "") {
  return [...trackId].reduce((value, char) => (value * 31 + char.charCodeAt(0)) % 360, 0);
}

function coverMarkup(track) {
  return `<div class="track-cover" data-cover-id="${escapeHtml(track.track_id)}" style="--cover-hue:${coverHue(track.track_id)}"><span>♫</span><img alt="" loading="lazy" hidden></div>`;
}

function applyArtwork(trackId, url) {
  document.querySelectorAll(`[data-cover-id="${trackId}"]`).forEach(cover => {
    const image = cover.querySelector("img");
    const fallback = cover.querySelector("span");
    if (!image || !fallback) return;
    if (url) {
      image.src = url;
      image.hidden = false;
      fallback.hidden = true;
    } else {
      image.hidden = true;
      fallback.hidden = false;
    }
  });
}

function queueArtwork(tracks) {
  tracks.forEach(track => {
    if (!track?.track_id) return;
    if (ARTWORK.has(track.track_id)) applyArtwork(track.track_id, ARTWORK.get(track.track_id));
    else if (!ARTWORK_FETCHING.has(track.track_id)) ARTWORK_PENDING.add(track.track_id);
  });
  clearTimeout(artworkTimer);
  artworkTimer = setTimeout(flushArtworkQueue, 40);
}

async function flushArtworkQueue() {
  const ids = [...ARTWORK_PENDING].slice(0, 30);
  ids.forEach(id => {
    ARTWORK_PENDING.delete(id);
    ARTWORK_FETCHING.add(id);
  });
  if (!ids.length) return;
  let cursor = 0;
  const worker = async () => {
    while (cursor < ids.length) {
      const id = ids[cursor++];
      let artworkUrl = null;
      try {
        const spotifyUrl = `https://open.spotify.com/track/${id}`;
        const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`);
        if (response.ok) artworkUrl = (await response.json()).thumbnail_url || null;
      } catch { /* mantém a capa visual de fallback */ }
      ARTWORK.set(id, artworkUrl);
      applyArtwork(id, artworkUrl);
    }
  };
  try {
    await Promise.all(Array.from({ length: Math.min(6, ids.length) }, worker));
  } finally {
    ids.forEach(id => ARTWORK_FETCHING.delete(id));
    if (ARTWORK_PENDING.size) artworkTimer = setTimeout(flushArtworkQueue, 40);
  }
}

function trackRow(track, index, showSimilarity = false, context = "catalog") {
  TRACKS.set(track.track_id, track);
  const explicit = track.is_explicit ? '<span class="explicit-tag">E</span>' : "";
  const score = showSimilarity && track.similarity !== undefined
    ? `<span class="similarity-score">${(Number(track.similarity) * 100).toFixed(1)}% similar</span>`
    : `<span class="track-pop">${Number(track.popularity || 0)}</span>`;
  const isFavorite = favorites.has(track.track_id);

  return `<div class="track-row" data-track-id="${escapeHtml(track.track_id)}">
    <span class="track-num"><span class="track-num-text">${index}</span><span class="track-play-icon">▶</span></span>
    ${coverMarkup(track)}
    <div class="track-info">
      <div class="track-name">${escapeHtml(track.track_name)}${explicit}</div>
      <div class="track-artist">${escapeHtml(track.artists).replaceAll(";", " · ")}</div>
    </div>
    <span class="mood-badge ${moodClass(track.mood)}">${escapeHtml(track.mood || "—")}</span>
    ${score}
    <span class="track-actions">
      ${context === "playlist"
        ? `<button type="button" class="track-action playlist-action" data-action="remove-playlist" data-track-id="${escapeHtml(track.track_id)}" title="Retirar da playlist" aria-label="Retirar da playlist">−</button>`
        : `<button type="button" class="track-action playlist-action" data-action="add-playlist" data-track-id="${escapeHtml(track.track_id)}" title="Adicionar à playlist ativa" aria-label="Adicionar à playlist ativa">＋</button>`}
      <button type="button" class="track-action similar-action" data-action="similar" data-track-id="${escapeHtml(track.track_id)}" title="Encontrar parecidas" aria-label="Encontrar músicas parecidas">⌕</button>
      <button type="button" class="track-action ${isFavorite ? "favorite" : ""}" data-action="favorite" data-track-id="${escapeHtml(track.track_id)}" title="Favoritar" aria-label="Favoritar música">${isFavorite ? "♥" : "♡"}</button>
    </span>
  </div>`;
}

function renderList(elementId, tracks, showSimilarity = false, emptyMessage = "Nenhuma música encontrada.", context = "catalog") {
  registerTracks(tracks);
  const element = document.getElementById(elementId);
  element.innerHTML = tracks.length
    ? tracks.map((track, index) => trackRow(track, index + 1, showSimilarity, context)).join("")
    : `<div class="empty-state">${escapeHtml(emptyMessage)}</div>`;
  queueArtwork(tracks);
}

function loading(elementId, message = "Carregando dados da API…") {
  document.getElementById(elementId).innerHTML = `<div aria-label="${escapeHtml(message)}">
    <div class="skeleton-row"></div><div class="skeleton-row"></div><div class="skeleton-row"></div>
  </div>`;
}

function showError(elementId, error) {
  document.getElementById(elementId).innerHTML = `<div class="empty-state" style="color:#ff8c8c">${escapeHtml(error.message)}</div>`;
}

function setExplanation(context, explanation = null) {
  EXPLANATIONS[context] = explanation;
  const button = document.getElementById(`explain-${context}-btn`);
  if (button) button.disabled = !explanation?.recommendations?.length;
}

function vectorBar(value, y, color, center, scale) {
  const width = Math.abs(value) * scale;
  const x = value < 0 ? center - width : center;
  return `<rect x="${x.toFixed(2)}" y="${y}" width="${width.toFixed(2)}" height="8" rx="3" fill="${color}"/>`;
}

function vectorChart(explanation, recommendation) {
  const source = explanation.source_vector;
  const candidate = recommendation.vector;
  const maxAbs = Math.max(1, ...source.map(Math.abs), ...candidate.map(Math.abs));
  const center = 430;
  const scale = 220 / maxAbs;
  const rows = explanation.features.map((feature, index) => {
    const y = 36 + index * 34;
    return `<text x="8" y="${y + 12}" fill="#b3b3b3" font-size="11">${escapeHtml(feature.label)}</text>
      <line x1="210" y1="${y + 10}" x2="650" y2="${y + 10}" stroke="#333" stroke-width="1"/>
      ${vectorBar(source[index], y + 1, "#1db954", center, scale)}
      ${vectorBar(candidate[index], y + 12, "#7b9ef4", center, scale)}
      <text x="666" y="${y + 9}" fill="#1db954" font-size="10">${source[index].toFixed(2)}</text>
      <text x="716" y="${y + 20}" fill="#9fb6ff" font-size="10">${candidate[index].toFixed(2)}</text>`;
  }).join("");
  return `<svg class="vector-chart" viewBox="0 0 760 315" role="img" aria-label="Comparação dos vetores normalizados">
    <text x="210" y="16" fill="#6a6a6a" font-size="10">-${maxAbs.toFixed(1)}</text>
    <text x="426" y="16" fill="#6a6a6a" font-size="10">0</text>
    <text x="630" y="16" fill="#6a6a6a" font-size="10">+${maxAbs.toFixed(1)}</text>
    <line x1="${center}" y1="23" x2="${center}" y2="304" stroke="#777" stroke-width="1"/>
    ${rows}
  </svg>`;
}

function angleChart(similarity) {
  const safeSimilarity = Math.max(-1, Math.min(1, similarity));
  const angle = Math.acos(safeSimilarity);
  const degrees = angle * 180 / Math.PI;
  const originX = 160;
  const originY = 175;
  const radius = 112;
  const candidateX = originX + radius * Math.cos(angle);
  const candidateY = originY - radius * Math.sin(angle);
  return `<svg class="angle-chart" viewBox="0 0 320 225" role="img" aria-label="Ângulo equivalente entre os vetores">
    <defs>
      <marker id="vector-arrow-source" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#1db954"/></marker>
      <marker id="vector-arrow-candidate" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#7b9ef4"/></marker>
    </defs>
    <circle cx="${originX}" cy="${originY}" r="3" fill="#fff"/>
    <line x1="${originX}" y1="${originY}" x2="${originX + radius}" y2="${originY}" stroke="#1db954" stroke-width="5" marker-end="url(#vector-arrow-source)"/>
    <line x1="${originX}" y1="${originY}" x2="${candidateX.toFixed(2)}" y2="${candidateY.toFixed(2)}" stroke="#7b9ef4" stroke-width="5" marker-end="url(#vector-arrow-candidate)"/>
    <path d="M ${originX + 43} ${originY} A 43 43 0 ${degrees > 180 ? 1 : 0} 0 ${(originX + 43 * Math.cos(angle)).toFixed(2)} ${(originY - 43 * Math.sin(angle)).toFixed(2)}" fill="none" stroke="#fff" stroke-dasharray="3 3"/>
    <text x="12" y="22" fill="#fff" font-size="14" font-weight="700">θ = ${degrees.toFixed(1)}°</text>
    <text x="12" y="43" fill="#1db954" font-size="13">cos(θ) = ${(similarity * 100).toFixed(2)}%</text>
    <text x="205" y="202" fill="#1db954" font-size="10">vetor-base</text>
    <text x="${Math.max(8, Math.min(235, candidateX - 25)).toFixed(2)}" y="${Math.max(62, candidateY - 10).toFixed(2)}" fill="#9fb6ff" font-size="10">recomendada</text>
  </svg>`;
}

function renderRecommendationExplanation(context, recommendationIndex = 0) {
  const explanation = EXPLANATIONS[context];
  if (!explanation?.recommendations?.length) return;
  const recommendation = explanation.recommendations[recommendationIndex] || explanation.recommendations[0];
  const sourceCount = explanation.source_count;
  const contextLabels = {
    track: ["Recomendação por música", "O vetor-base é a própria música escolhida."],
    profile: ["Recomendação pelo seu perfil", `O vetor-base é a média de ${sourceCount} favorita${sourceCount === 1 ? "" : "s"}.`],
    playlist: ["Recomendação para a playlist", `O vetor-base é a média das ${sourceCount} música${sourceCount === 1 ? "" : "s"} da playlist.`],
  };
  document.getElementById("explanation-title").textContent = contextLabels[context][0];
  document.getElementById("explanation-subtitle").textContent = contextLabels[context][1];

  const options = explanation.recommendations.map((track, index) =>
    `<option value="${index}" ${index === recommendationIndex ? "selected" : ""}>${index + 1}. ${escapeHtml(track.track_name)} — ${escapeHtml(track.artists.split(";")[0])}</option>`
  ).join("");
  const sourceNames = explanation.source_tracks.slice(0, 6).map(track => escapeHtml(track.track_name)).join(" · ");
  const remainingSources = Math.max(0, explanation.source_tracks.length - 6);
  const sourceFormula = sourceCount === 1
    ? "vetor-base[j] = valor padronizado da música de referência"
    : `vetor-base[j] = soma[j] ÷ ${sourceCount}`;
  const rows = explanation.features.map((feature, index) => `<tr>
    <td>${escapeHtml(feature.label)}</td>
    <td>${explanation.component_sums[index].toFixed(4)}</td>
    <td>${explanation.source_vector[index].toFixed(4)}</td>
    <td>${recommendation.vector[index].toFixed(4)}</td>
    <td>${recommendation.component_products[index].toFixed(4)}</td>
  </tr>`).join("");

  document.getElementById("explanation-content").innerHTML = `
    <div class="explanation-intro">
      <div class="explanation-step"><div class="explanation-step-number">1</div><strong>Padronização</strong><p>Cada atributo vira um z-score: quantos desvios-padrão está acima ou abaixo da média do catálogo.</p></div>
      <div class="explanation-step"><div class="explanation-step-number">2</div><strong>Vetor-base</strong><p>${sourceCount === 1 ? "Usamos os oito atributos da música escolhida." : `Somamos cada atributo das ${sourceCount} músicas e dividimos por ${sourceCount}.`}</p></div>
      <div class="explanation-step"><div class="explanation-step-number">3</div><strong>Cosseno</strong><p>Comparamos a direção do vetor-base com cada música. Quanto menor o ângulo, maior a similaridade.</p></div>
    </div>
    <div class="formula-box">z = (valor − média do catálogo) ÷ desvio-padrão<br>${sourceFormula}<br>cos(θ) = (vetor-base · música) ÷ (||vetor-base|| × ||música||)</div>
    <div class="explanation-note"><strong>Origem do vetor:</strong> ${sourceNames}${remainingSources ? ` · e mais ${remainingSources}` : ""}.</div>
    <label for="explanation-recommendation" style="font-size:12px;color:var(--text2)">Compare o vetor-base com uma recomendação:</label>
    <select class="explanation-selector" id="explanation-recommendation" onchange="renderRecommendationExplanation('${context}',Number(this.value))">${options}</select>
    <div class="explanation-grid">
      <div class="explanation-panel">
        <div class="explanation-panel-title">Vetores padronizados por atributo</div>
        <div class="explanation-panel-sub">Valores positivos estão acima da média do catálogo; negativos, abaixo. A escala se ajusta ao maior valor exibido.</div>
        ${vectorChart(explanation, recommendation)}
        <div class="chart-legend"><span class="source">Vetor-base</span><span class="candidate">${escapeHtml(recommendation.track_name)}</span></div>
      </div>
      <div class="explanation-panel">
        <div class="explanation-panel-title">Ângulo equivalente</div>
        <div class="explanation-panel-sub">Representação bidimensional do ângulo calculado entre os vetores de oito dimensões.</div>
        ${angleChart(recommendation.similarity)}
      </div>
    </div>
    <div class="calculation-summary">
      <div class="calculation-stat"><span>Produto escalar</span><strong>${recommendation.dot_product.toFixed(4)}</strong></div>
      <div class="calculation-stat"><span>Norma da base</span><strong>${recommendation.source_norm.toFixed(4)}</strong></div>
      <div class="calculation-stat"><span>Norma da música</span><strong>${recommendation.candidate_norm.toFixed(4)}</strong></div>
      <div class="calculation-stat"><span>Similaridade</span><strong>${(recommendation.similarity * 100).toFixed(2)}%</strong></div>
    </div>
    <div class="formula-box">cos(θ) = ${recommendation.dot_product.toFixed(4)} ÷ (${recommendation.source_norm.toFixed(4)} × ${recommendation.candidate_norm.toFixed(4)}) = ${recommendation.similarity.toFixed(4)}</div>
    <div class="explanation-panel-title" style="margin:18px 0 8px">Cálculo componente a componente</div>
    <div class="explanation-table-wrap"><table class="explanation-table">
      <thead><tr><th>Atributo</th><th>Soma na origem</th><th>Vetor-base (média)</th><th>Recomendada</th><th>Produto</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <p class="explanation-note">A soma da última coluna é o produto escalar. O ranking considera a similaridade com precisão total; a interface arredonda os valores apenas para facilitar a leitura. Depois, o sistema limita o resultado a uma música por artista e usa popularidade somente como desempate.</p>`;
}

function openRecommendationExplanation(context) {
  if (!EXPLANATIONS[context]?.recommendations?.length) {
    showToast("Gere as recomendações primeiro");
    return;
  }
  renderRecommendationExplanation(context);
  document.getElementById("recommendation-explanation-dialog").showModal();
}

function closeRecommendationExplanation() {
  document.getElementById("recommendation-explanation-dialog").close();
}

function setApiStatus(message, error = false) {
  const status = document.getElementById("api-status");
  status.textContent = message;
  status.classList.toggle("error", error);
}

function goTo(id, element) {
  document.querySelectorAll(".section").forEach(section => section.classList.remove("active"));
  document.getElementById(`sec-${id}`).classList.add("active");
  document.querySelectorAll(".nav-item, .mobile-nav-item").forEach(item => item.classList.remove("active"));
  if (element) element.classList.add("active");
  document.querySelectorAll(`.nav-item[onclick^="goTo('${id}'"]`).forEach(item => item.classList.add("active"));
  document.querySelectorAll(`.mobile-nav-item[onclick*="'${id}'"]`).forEach(item => item.classList.add("active"));
  if (id === "profile") renderFavorites();
  if (id === "playlist") renderPlaylistManager();
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

function getActivePlaylist() {
  return userPlaylists.find(playlist => playlist.id === activePlaylistId) || null;
}

function renderPlaylistManager(refreshRecommendations = true) {
  if (!getActivePlaylist() && userPlaylists.length) activePlaylistId = userPlaylists[0].id;
  const active = getActivePlaylist();
  document.getElementById("playlist-count").textContent = userPlaylists.length;
  document.getElementById("playlist-tabs").innerHTML = userPlaylists.map(playlist => `
    <button class="playlist-tab ${playlist.id === activePlaylistId ? "active" : ""}" onclick="selectPlaylist('${escapeHtml(playlist.id)}')">
      <span class="playlist-tab-name">${escapeHtml(playlist.name)}</span>
      <span class="playlist-tab-count">${playlist.tracks.length} música${playlist.tracks.length === 1 ? "" : "s"}</span>
    </button>`).join("");

  document.getElementById("playlist-empty").hidden = Boolean(active);
  document.getElementById("playlist-workspace").hidden = !active;
  if (!active) return;

  registerTracks(active.tracks);
  document.getElementById("active-playlist-name").textContent = active.name;
  document.getElementById("active-playlist-meta").textContent = `${active.tracks.length} música${active.tracks.length === 1 ? "" : "s"} · salva neste navegador`;
  renderPlaylistCover(active);
  renderList(
    "user-playlist-tracks",
    active.tracks,
    false,
    "Esta playlist ainda está vazia. Busque músicas abaixo para começar.",
    "playlist",
  );
  if (refreshRecommendations) loadPlaylistRecommendations();
}

function renderPlaylistCover(playlist) {
  const cover = document.querySelector(".playlist-cover-large");
  const tracks = playlist.tracks.slice(0, 4);
  if (!tracks.length) {
    cover.innerHTML = "♫";
    return;
  }
  const sizeClass = tracks.length === 1 ? "one" : (tracks.length === 2 ? "two" : "");
  cover.innerHTML = `<div class="playlist-cover-grid ${sizeClass}">${tracks.map(track => `
    <div class="playlist-cover-piece" data-cover-id="${escapeHtml(track.track_id)}" style="--cover-hue:${coverHue(track.track_id)}"><span>♫</span><img alt="" hidden></div>`).join("")}</div>`;
  queueArtwork(tracks);
}

function selectPlaylist(playlistId) {
  activePlaylistId = playlistId;
  saveUserPlaylists();
  document.getElementById("playlist-search-input").value = "";
  document.getElementById("playlist-search-results").innerHTML = "";
  renderPlaylistManager();
}

function openPlaylistDialog() {
  const dialog = document.getElementById("playlist-dialog");
  document.getElementById("new-playlist-name").value = "";
  dialog.showModal();
  setTimeout(() => document.getElementById("new-playlist-name").focus(), 0);
}

function closePlaylistDialog() {
  document.getElementById("playlist-dialog").close();
}

function createPlaylist(event) {
  event.preventDefault();
  if (userPlaylists.length >= 20) {
    showToast("Limite de 20 playlists atingido");
    return;
  }
  const input = document.getElementById("new-playlist-name");
  const name = input.value.trim();
  if (!name) return;
  const id = globalThis.crypto?.randomUUID?.() || `playlist-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  userPlaylists.push({ id, name, tracks: [] });
  activePlaylistId = id;
  saveUserPlaylists();
  document.getElementById("playlist-dialog").close();
  renderPlaylistManager();
  showToast(`Playlist “${name}” criada`);
}

function renameActivePlaylist() {
  const active = getActivePlaylist();
  if (!active) return;
  const name = prompt("Novo nome da playlist:", active.name)?.trim();
  if (!name) return;
  active.name = name.slice(0, 50);
  saveUserPlaylists();
  renderPlaylistManager(false);
}

function deleteActivePlaylist() {
  const active = getActivePlaylist();
  if (!active || !confirm(`Excluir a playlist “${active.name}”?`)) return;
  userPlaylists = userPlaylists.filter(playlist => playlist.id !== active.id);
  activePlaylistId = userPlaylists[0]?.id || null;
  saveUserPlaylists();
  renderPlaylistManager();
  showToast("Playlist excluída");
}

function addTrackToPlaylist(track) {
  const active = getActivePlaylist();
  if (!active) {
    goTo("playlist", document.querySelectorAll(".nav-item")[2]);
    showToast("Crie uma playlist antes de adicionar músicas");
    openPlaylistDialog();
    return;
  }
  if (active.tracks.some(item => item.track_id === track.track_id)) {
    showToast("Essa música já está na playlist");
    return;
  }
  if (active.tracks.length >= 100) {
    showToast("Esta playlist atingiu o limite de 100 músicas");
    return;
  }
  active.tracks.push(compactTrack(track));
  saveUserPlaylists();
  renderPlaylistManager();
  showToast(`Adicionada a “${active.name}”`);
}

function removeTrackFromPlaylist(trackId) {
  const active = getActivePlaylist();
  if (!active) return;
  active.tracks = active.tracks.filter(track => track.track_id !== trackId);
  saveUserPlaylists();
  renderPlaylistManager();
  showToast("Música retirada da playlist");
}

async function loadPlaylistRecommendations() {
  const active = getActivePlaylist();
  const element = document.getElementById("playlist-recommendations");
  const sequence = ++playlistRecommendationSequence;
  if (!active?.tracks.length) {
    setExplanation("playlist");
    element.innerHTML = '<div class="empty-state">Adicione ao menos uma música para gerar recomendações.</div>';
    return;
  }
  setExplanation("playlist");
  loading("playlist-recommendations", "Calculando recomendações da playlist…");
  try {
    const result = await apiFetch("/recommendations/playlist", {
      method: "POST",
      body: JSON.stringify({ track_ids: active.tracks.map(track => track.track_id) }),
    });
    if (sequence !== playlistRecommendationSequence || active.id !== activePlaylistId) return;
    renderList("playlist-recommendations", result.recommendations, true, "Nenhuma recomendação encontrada.");
    setExplanation("playlist", result.explanation);
  } catch (error) {
    if (sequence === playlistRecommendationSequence) showError("playlist-recommendations", error);
  }
}

function handlePlaylistSearch(query) {
  clearTimeout(playlistSearchTimer);
  const normalized = query.trim();
  if (!normalized) {
    document.getElementById("playlist-search-results").innerHTML = "";
    return;
  }
  if (normalized.length < 2) return;
  playlistSearchTimer = setTimeout(() => runPlaylistSearch(normalized), 250);
}

async function runPlaylistSearch(query) {
  const sequence = ++playlistSearchSequence;
  loading("playlist-search-results", "Buscando músicas…");
  try {
    const tracks = await apiFetch(`/tracks/search?q=${encodeURIComponent(query)}&limit=10`);
    if (sequence !== playlistSearchSequence) return;
    renderList("playlist-search-results", tracks, false, `Nenhum resultado para “${query}”.`);
  } catch (error) {
    if (sequence === playlistSearchSequence) showError("playlist-search-results", error);
  }
}

async function loadGenreSuggestions(genre) {
  const active = getActivePlaylist();
  if (!active) return;
  loading("playlist-search-results", `Buscando sugestões de ${genre}…`);
  try {
    const tracks = await apiFetch(`/playlist?genre=${encodeURIComponent(genre)}&n=10`);
    renderList("playlist-search-results", tracks, false, `Nenhuma música de ${genre} encontrada.`);
  } catch (error) {
    showError("playlist-search-results", error);
  }
}

async function browseGenre(genre, element = null) {
  const genres = {
    pop: { label: "Pop", icon: "🎵", color: "#5267d8", dark: "#202952" },
    samba: { label: "Samba", icon: "🥁", color: "#c97818", dark: "#4d2800" },
    sertanejo: { label: "Sertanejo", icon: "🤠", color: "#9f5d29", dark: "#3f210a" },
  };
  const selected = genres[genre];
  if (!selected) return;

  const sequence = ++genreBrowseSequence;
  goTo("genre", element);
  document.getElementById("genre-title").textContent = selected.label;
  document.getElementById("genre-icon").textContent = selected.icon;
  document.getElementById("genre-meta").textContent = `Músicas de ${selected.label} em destaque no catálogo do SpotData`;
  const hero = document.getElementById("genre-hero");
  hero.style.setProperty("--genre-color", selected.color);
  hero.style.setProperty("--genre-color-dark", selected.dark);
  loading("genre-list", `Buscando músicas de ${selected.label}…`);

  try {
    const tracks = await apiFetch(`/playlist?genre=${encodeURIComponent(genre)}&n=30`);
    if (sequence !== genreBrowseSequence) return;
    renderList("genre-list", tracks, false, `Nenhuma música de ${selected.label} encontrada.`);
  } catch (error) {
    if (sequence === genreBrowseSequence) showError("genre-list", error);
  }
}

function playActivePlaylist() {
  const first = getActivePlaylist()?.tracks[0];
  if (first) nowPlay(first);
  else showToast("Adicione uma música à playlist primeiro");
}

async function loadSimilar(track) {
  if (!track) return;
  const sequence = ++similarRecommendationSequence;
  const discoverNav = document.querySelectorAll(".nav-item")[1];
  goTo("discover", discoverNav);
  document.getElementById("ref-name").textContent = track.track_name;
  document.getElementById("ref-artist").textContent = `${track.artists.replaceAll(";", " · ")} · ${track.genre_main || ""} · ${track.mood || ""}`;
  document.getElementById("ref-card").querySelector('[style*="28px"]').textContent = track.popularity;
  const referenceCover = document.getElementById("ref-cover");
  referenceCover.dataset.coverId = track.track_id;
  referenceCover.style.setProperty("--cover-hue", coverHue(track.track_id));
  referenceCover.innerHTML = '<span>♫</span><img alt="" hidden>';
  queueArtwork([track]);
  setExplanation("track");
  loading("rec-list", "Calculando similaridade no Python…");
  try {
    const result = await apiFetch(`/tracks/${encodeURIComponent(track.track_id)}/recommendations?n=12`);
    if (sequence !== similarRecommendationSequence) return;
    DATA.recs = registerTracks(result.recommendations);
    renderList("rec-list", result.recommendations, true);
    setExplanation("track", result.explanation);
  } catch (error) {
    if (sequence === similarRecommendationSequence) showError("rec-list", error);
  }
}

function loadRecs(index, element) {
  document.querySelectorAll("#recommendation-seeds .filter-btn").forEach(button => button.classList.remove("active"));
  if (element) element.classList.add("active");
  loadSimilar(DATA.top5[index]);
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
  const wasFavorite = favorites.has(track.track_id);
  if (wasFavorite) favorites.delete(track.track_id);
  else favorites.set(track.track_id, compactTrack(track));
  saveFavorites();
  updateFavoriteUi();
  profileRecommendationSequence += 1;
  setExplanation("profile");
  showToast(wasFavorite ? "Removida das favoritas" : "Adicionada às favoritas");
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
  goTo("profile", document.querySelectorAll(".nav-item")[3]);
  const sequence = ++profileRecommendationSequence;
  const ids = [...favorites.keys()];
  if (!ids.length) {
    setExplanation("profile");
    document.getElementById("profile-rec-list").innerHTML = '<div class="empty-state">Selecione ao menos uma favorita.</div>';
    return;
  }
  setExplanation("profile");
  loading("profile-rec-list", "Recalculando seu perfil no Python…");
  try {
    const result = await apiFetch("/recommendations/profile", {
      method: "POST",
      body: JSON.stringify({ favorite_track_ids: ids, n: 20, exclude_explicit: false }),
    });
    if (sequence !== profileRecommendationSequence) return;
    renderList("profile-rec-list", result.recommendations, true);
    setExplanation("profile", result.explanation);
  } catch (error) {
    if (sequence === profileRecommendationSequence) showError("profile-rec-list", error);
  }
}

function clearFavorites() {
  favorites.clear();
  saveFavorites();
  updateFavoriteUi();
  profileRecommendationSequence += 1;
  setExplanation("profile");
  document.getElementById("profile-rec-list").innerHTML = '<div class="empty-state">Selecione favoritas para começar.</div>';
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 1800);
}

function setPlayButton(isPlaying) {
  playing = isPlaying;
  document.getElementById("np-play-btn").innerHTML = playing
    ? '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
    : '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
}

function spotifyUri(track) {
  return `spotify:track:${track.track_id}`;
}

function createSpotifyPlayer(track) {
  if (!spotifyIframeApi || spotifyController) return;
  const element = document.getElementById("spotify-embed");
  spotifyIframeApi.createController(element, {
    width: "100%",
    height: 152,
    uri: spotifyUri(track),
    theme: "dark",
  }, controller => {
    spotifyController = controller;
    controller.addListener("playback_update", event => setPlayButton(!event.data.isPaused));
    controller.addListener("playback_started", () => setPlayButton(true));
    controller.play();
  });
}

function loadSpotifyTrack(track) {
  document.getElementById("spotify-player-panel").classList.add("visible");
  if (!spotifyController) {
    createSpotifyPlayer(track);
    const requestedId = track.track_id;
    setTimeout(() => {
      if (!spotifyController && currentTrack?.track_id === requestedId) {
        document.getElementById("spotify-embed").innerHTML = '<div class="embed-loading">O player não carregou. Verifique a internet ou use “Abrir no Spotify”.</div>';
      }
    }, 6000);
    return;
  }
  const load = spotifyController.loadEntity || spotifyController.loadUri;
  load.call(spotifyController, spotifyUri(track));
  spotifyController.play();
}

function nowPlay(track) {
  if (!track?.track_id) return;
  currentTrack = track;
  const artist = track.artists.split(";")[0];
  document.getElementById("np-name").textContent = track.track_name;
  document.getElementById("np-artist").innerHTML = `<span>${escapeHtml(artist)}</span><span class="np-source" style="background:var(--bg4);color:var(--green);font-size:9px;padding:1px 5px;border-radius:3px;font-weight:600;margin-left:6px">SPOTIFY</span>`;
  const cover = document.getElementById("np-cover");
  cover.style.background = `linear-gradient(145deg,hsl(${coverHue(track.track_id)} 55% 48%),hsl(${(coverHue(track.track_id) + 45) % 360} 50% 20%))`;
  cover.style.color = "white";
  cover.dataset.coverId = track.track_id;
  cover.innerHTML = '<span>♫</span><img alt="" hidden>';
  queueArtwork([track]);
  const spotifyLink = document.getElementById("spotify-link");
  spotifyLink.href = `https://open.spotify.com/track/${encodeURIComponent(track.track_id)}`;
  spotifyLink.classList.add("visible");
  document.querySelectorAll("[data-track-id]").forEach(row => row.classList.toggle("selected", row.dataset.trackId === track.track_id));
  setPlayButton(false);
  loadSpotifyTrack(track);
}

function togglePlay() {
  if (!currentTrack) {
    showToast("Selecione uma música primeiro");
    return;
  }
  document.getElementById("spotify-player-panel").classList.add("visible");
  if (!spotifyController) {
    createSpotifyPlayer(currentTrack);
    return;
  }
  spotifyController.togglePlay();
}

function closeSpotifyPlayer() {
  document.getElementById("spotify-player-panel").classList.remove("visible");
  if (spotifyController && playing) spotifyController.pause();
  setPlayButton(false);
}

function playAdjacent(offset) {
  const rows = [...document.querySelectorAll(".section.active .track-row")];
  const ids = [...new Set(rows.map(row => row.dataset.trackId))];
  if (!ids.length) return;
  const currentIndex = currentTrack ? ids.indexOf(currentTrack.track_id) : -1;
  const baseIndex = currentIndex >= 0 ? currentIndex : (offset > 0 ? -1 : 0);
  const nextIndex = (baseIndex + offset + ids.length) % ids.length;
  const track = TRACKS.get(ids[nextIndex]);
  if (track) nowPlay(track);
}

document.addEventListener("click", event => {
  const action = event.target.closest("[data-action]");
  if (action) {
    event.stopPropagation();
    const track = TRACKS.get(action.dataset.trackId);
    if (action.dataset.action === "favorite") toggleFavorite(track);
    if (action.dataset.action === "similar") loadSimilar(track);
    if (action.dataset.action === "add-playlist" && track) addTrackToPlaylist(track);
    if (action.dataset.action === "remove-playlist") removeTrackFromPlaylist(action.dataset.trackId);
    return;
  }
  const row = event.target.closest("[data-track-id]");
  if (row) {
    const track = TRACKS.get(row.dataset.trackId);
    if (track) nowPlay(track);
  }
});

async function bootstrap() {
  updateFavoriteUi();
  renderPlaylistManager(false);
  loading("top5-list");
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
    renderTop5();
    renderMoods();
    document.querySelectorAll("#recommendation-seeds .filter-btn").forEach((button, index) => {
      if (top[index]) button.textContent = `${top[index].track_name} · ${top[index].artists.split(";")[0]}`;
    });
    document.getElementById("hero-play").addEventListener("click", () => nowPlay(top[0]));
    await loadSimilar(top[0]);
    goTo("home", document.querySelectorAll(".nav-item")[0]);
    setApiStatus("API conectada · dados reais");
  } catch (error) {
    setApiStatus("Falha ao conectar à API", true);
    showError("top5-list", error);
  }
}

bootstrap();
