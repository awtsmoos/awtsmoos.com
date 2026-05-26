//B"H

const SETTINGS_KEY = "awtsmoos.audio.settings.v1";
const DEFAULTS = { voice: "orbit", format: "mp3" };
const VOICES = ["orbit", "breeze", "cove", "ember", "juniper", "maple", "sol", "spruce", "vale"];
const FORMATS = ["mp3", "aac", "wav", "opus"];
const STREAM_START_BYTES = 24 * 1024;

export function mountAwtsmoosAudioOffer({ shell, aiHandler, conversationId = null, messageId = null } = {}) {
  if (!shell || !conversationId || shell.querySelector?.(":scope > .awtsmoos-audio-offer")) return null;
  const root = document.createElement("section");
  root.className = "awtsmoos-audio-offer";
  root.__awtsmoosAudio = makeAudioState();
  root.innerHTML = `
    <div class="audio-offer-head"><strong>Awtsmoos Audio</strong><span>Listen to the final answer</span></div>
    <div class="audio-offer-actions">
      <button type="button" data-audio-action="play">▶ Stream + play MP3</button>
      <button type="button" data-audio-action="download">⬇ Download</button>
      <button type="button" data-audio-action="settings" aria-expanded="false">⚙ Audio settings</button>
    </div>
    <div class="audio-settings" hidden>
      <label>Voice <select data-audio-setting="voice"></select></label>
      <label>Download format <select data-audio-setting="format"></select></label>
    </div>
    <div class="audio-player-wrap" hidden>
      <audio preload="auto"></audio>
      <div class="awtsmoos-player" data-player-state="idle">
        <button type="button" class="player-play" data-audio-action="toggle" disabled>▶</button>
        <div class="player-meter" role="slider" aria-label="Audio position" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>
        <span class="player-time">0:00 / live</span>
      </div>
    </div>
    <p class="audio-status" aria-live="polite"></p>
  `;
  const settings = loadAudioSettings();
  hydrateSelect(root.querySelector('[data-audio-setting="voice"]'), VOICES, settings.voice);
  hydrateSelect(root.querySelector('[data-audio-setting="format"]'), FORMATS, settings.format);
  bindPlayer(root);
  root.addEventListener("change", () => saveFromRoot(root));
  root.addEventListener("click", event => handleAudioClick(event, { root, aiHandler, conversationId, messageId }));
  shell.append(root);
  return root;
}

function makeAudioState() {
  return { signature: "", mode: "idle", chunks: [], bytes: 0, mime: "audio/mpeg", objectUrl: "", done: false, promise: null, controller: null, startedAt: 0 };
}

async function handleAudioClick(event, context) {
  const action = event.target?.closest?.("[data-audio-action]")?.dataset?.audioAction;
  if (!action) return;
  event.preventDefault();
  if (action === "settings") return toggleSettings(context.root, event.target.closest("button"));
  if (action === "toggle") return togglePlayback(context.root);
  const settings = saveFromRoot(context.root);
  if (action === "play") return synthesizeForPlay(context, settings);
  if (action === "download") return synthesizeForDownload(context, settings);
}

async function synthesizeForPlay({ root, aiHandler, conversationId, messageId }, settings) {
  const status = statusNode(root);
  const playButton = root.querySelector(".player-play");
  const generateButton = root.querySelector('[data-audio-action="play"]');
  const signature = audioSignature({ conversationId, messageId, voice: settings.voice, format: "mp3" });
  try {
    if (root.__awtsmoosAudio?.signature === signature && root.__awtsmoosAudio.mode !== "idle") {
      status.textContent = root.__awtsmoosAudio.done ? "Reusing completed streamed MP3." : "Stream already running.";
      playButton.disabled = false;
      await root.querySelector("audio")?.play?.().catch(() => undefined);
      return;
    }
    resetAudioState(root);
    setBusy(root, true, { allowDownload: true });
    status.textContent = "Opening streaming MP3…";
    const service = await aiHandler?.getActiveService?.();
    const streamed = await tryStreamToPlayer(root, service, { message_id: messageId, conversation_id: conversationId, voice: settings.voice, format: "mp3", signature });
    if (streamed) return;
    status.textContent = "Streaming unavailable; using fast MP3 blob fallback…";
    const result = await service?.getAwtsmoosAudio?.({ message_id: messageId, conversation_id: conversationId, voice: settings.voice, format: "mp3", download: false });
    await loadBlobPlayer(root, result, signature);
  } catch (error) {
    playButton.disabled = true;
    status.textContent = `Audio failed: ${error?.message || error}`;
  } finally {
    setBusy(root, false);
    generateButton.disabled = false;
  }
}

async function tryStreamToPlayer(root, service, options) {
  if (!supportsMp3MediaSource() || typeof service?.getAwtsmoosAudioStream !== "function") return false;
  const audio = root.querySelector("audio");
  const wrap = root.querySelector(".audio-player-wrap");
  const status = statusNode(root);
  const playButton = root.querySelector(".player-play");
  let mediaSource = null;
  try {
    const result = await service.getAwtsmoosAudioStream(options);
    const reader = result?.response?.body?.getReader?.();
    if (!reader) return false;
    const state = root.__awtsmoosAudio = makeAudioState();
    state.mode = "streaming";
    state.signature = options.signature;
    state.mime = "audio/mpeg";
    state.startedAt = Date.now();
    mediaSource = new MediaSource();
    state.objectUrl = URL.createObjectURL(mediaSource);
    revokeCurrentAudio(audio);
    audio.src = state.objectUrl;
    audio.dataset.objectUrl = state.objectUrl;
    wrap.hidden = false;
    status.textContent = "Streaming audio bytes…";
    const sourceBuffer = await openSourceBuffer(mediaSource, "audio/mpeg");
    let started = false;
    state.promise = (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value?.byteLength) continue;
        state.chunks.push(value.slice ? value.slice() : new Uint8Array(value));
        state.bytes += value.byteLength;
        await appendBuffer(sourceBuffer, value);
        syncPlayer(root, { live: true });
        status.textContent = `Streaming MP3… ${formatSize(state.bytes)} received${estimateLiveTime(audio)}`;
        if (!started && state.bytes >= STREAM_START_BYTES) {
          started = true;
          playButton.disabled = false;
          await audio.play().catch(() => undefined);
        }
      }
      state.done = true;
      if (mediaSource.readyState === "open") mediaSource.endOfStream();
      playButton.disabled = false;
      if (!started) await audio.play().catch(() => undefined);
      syncPlayer(root);
      status.textContent = `Stream complete${formatSize(state.bytes)}. Ready to download instantly.`;
      return state;
    })();
    state.promise.catch(error => { status.textContent = `Stream failed: ${error?.message || error}`; });
    return true;
  } catch (error) {
    try { if (mediaSource?.readyState === "open") mediaSource.endOfStream("decode"); } catch {}
    status.textContent = `Progressive playback unavailable: ${error?.message || error}`;
    return false;
  }
}

async function loadBlobPlayer(root, result, signature = "") {
  if (!result?.objectUrl && !result?.url) throw new Error("No audio URL returned.");
  const status = statusNode(root);
  const wrap = root.querySelector(".audio-player-wrap");
  const audio = root.querySelector("audio");
  const playButton = root.querySelector(".player-play");
  resetAudioState(root);
  root.__awtsmoosAudio.signature = signature;
  root.__awtsmoosAudio.mode = "blob";
  root.__awtsmoosAudio.done = true;
  root.__awtsmoosAudio.bytes = result.size || 0;
  root.__awtsmoosAudio.objectUrl = result.objectUrl || result.url;
  revokeCurrentAudio(audio);
  audio.src = result.objectUrl || result.url;
  audio.dataset.objectUrl = result.objectUrl || result.url;
  audio.dataset.mime = result.mime || "audio/mpeg";
  wrap.hidden = false;
  playButton.disabled = true;
  updateStatusSize(status, result);
  audio.load();
  await waitForPlayable(audio, 12000);
  playButton.disabled = false;
  await audio.play();
  status.textContent = `Playing MP3${formatSize(result.size)}.`;
}

async function synthesizeForDownload({ root, aiHandler, conversationId, messageId }, settings) {
  const status = statusNode(root);
  const streamSignature = audioSignature({ conversationId, messageId, voice: settings.voice, format: "mp3" });
  try {
    const state = root.__awtsmoosAudio;
    if (settings.format === "mp3" && state?.signature === streamSignature && state.mode === "streaming") {
      setBusy(root, true, { allowPlay: true });
      status.textContent = state.done ? "Downloading existing streamed MP3…" : "Waiting for current stream to finish, then downloading existing MP3…";
      await state.promise;
      downloadStreamedState(state, "mp3");
      status.textContent = "Downloaded existing streamed MP3.";
      return;
    }
    setBusy(root, true);
    status.textContent = "Preparing download…";
    const service = await aiHandler?.getActiveService?.();
    await service?.getAwtsmoosAudio?.({ message_id: messageId, conversation_id: conversationId, voice: settings.voice, format: settings.format, download: true });
    status.textContent = `Downloaded ${settings.format.toUpperCase()} audio.`;
  } catch (error) {
    status.textContent = `Download failed: ${error?.message || error}`;
  } finally {
    setBusy(root, false);
  }
}

function downloadStreamedState(state, format = "mp3") {
  const blob = new Blob(state.chunks, { type: state.mime || "audio/mpeg" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = `BH_awtsmoosAudio_${Date.now()}.${format}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(href), 30000);
}

function bindPlayer(root) {
  const audio = root.querySelector("audio");
  const meter = root.querySelector(".player-meter");
  audio.addEventListener("loadedmetadata", () => syncPlayer(root));
  audio.addEventListener("timeupdate", () => syncPlayer(root));
  audio.addEventListener("durationchange", () => syncPlayer(root));
  audio.addEventListener("progress", () => syncPlayer(root, { live: root.__awtsmoosAudio?.mode === "streaming" && !root.__awtsmoosAudio?.done }));
  audio.addEventListener("play", () => setPlayerState(root, "playing"));
  audio.addEventListener("pause", () => setPlayerState(root, "paused"));
  audio.addEventListener("ended", () => setPlayerState(root, "ended"));
  audio.addEventListener("error", () => { root.querySelector(".audio-status").textContent = mediaError(audio); });
  meter.addEventListener("click", event => {
    const duration = Number(audio.duration || 0);
    if (!duration) return;
    const rect = meter.getBoundingClientRect();
    audio.currentTime = Math.max(0, Math.min(duration, ((event.clientX - rect.left) / rect.width) * duration));
  });
}

async function togglePlayback(root) {
  const audio = root.querySelector("audio");
  if (!audio.src) return;
  if (audio.paused) await audio.play().catch(error => { statusNode(root).textContent = `Playback blocked: ${error?.message || error}`; });
  else audio.pause();
}

function syncPlayer(root, { live = false } = {}) {
  const audio = root.querySelector("audio");
  const meter = root.querySelector(".player-meter");
  const fill = meter.querySelector("span");
  const time = root.querySelector(".player-time");
  const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
  const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
  const pct = duration ? Math.max(0, Math.min(100, (current / duration) * 100)) : live ? 100 : 0;
  fill.style.width = `${pct}%`;
  meter.setAttribute("aria-valuenow", String(Math.round(pct)));
  const liveSuffix = live || (root.__awtsmoosAudio?.mode === "streaming" && !root.__awtsmoosAudio?.done) ? "live" : formatTime(duration);
  time.textContent = `${formatTime(current)} / ${liveSuffix}`;
  root.querySelector(".player-play").textContent = audio.paused ? "▶" : "❚❚";
}

function setPlayerState(root, state) {
  root.querySelector(".awtsmoos-player").dataset.playerState = state;
  syncPlayer(root, { live: root.__awtsmoosAudio?.mode === "streaming" && !root.__awtsmoosAudio?.done });
}

function waitForPlayable(audio, timeoutMs = 12000) {
  if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Browser could not decode the generated audio.")), timeoutMs);
    const done = () => { cleanup(); resolve(); };
    const fail = () => { cleanup(); reject(new Error(mediaError(audio))); };
    const cleanup = () => {
      clearTimeout(timer);
      audio.removeEventListener("canplay", done);
      audio.removeEventListener("loadeddata", done);
      audio.removeEventListener("error", fail);
    };
    audio.addEventListener("canplay", done, { once: true });
    audio.addEventListener("loadeddata", done, { once: true });
    audio.addEventListener("error", fail, { once: true });
  });
}

function supportsMp3MediaSource() {
  return typeof MediaSource !== "undefined" && MediaSource.isTypeSupported?.("audio/mpeg");
}

function openSourceBuffer(mediaSource, mime) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("MediaSource did not open.")), 8000);
    mediaSource.addEventListener("sourceopen", () => {
      clearTimeout(timer);
      try { resolve(mediaSource.addSourceBuffer(mime)); }
      catch (error) { reject(error); }
    }, { once: true });
  });
}

function appendBuffer(sourceBuffer, chunk) {
  return new Promise((resolve, reject) => {
    const done = () => { cleanup(); resolve(); };
    const fail = () => { cleanup(); reject(new Error("Audio stream append failed.")); };
    const cleanup = () => {
      sourceBuffer.removeEventListener("updateend", done);
      sourceBuffer.removeEventListener("error", fail);
    };
    sourceBuffer.addEventListener("updateend", done, { once: true });
    sourceBuffer.addEventListener("error", fail, { once: true });
    try { sourceBuffer.appendBuffer(chunk); }
    catch (error) { cleanup(); reject(error); }
  });
}

function setBusy(root, busy, options = {}) {
  root.classList.toggle("is-audio-busy", Boolean(busy));
  root.querySelectorAll('[data-audio-action="play"], [data-audio-action="download"]').forEach(button => {
    const action = button.dataset.audioAction;
    button.disabled = Boolean(busy && !options[`allow${capitalize(action)}`]);
  });
}

function resetAudioState(root) {
  const audio = root.querySelector("audio");
  const old = root.__awtsmoosAudio;
  try { old?.controller?.abort?.(); } catch {}
  revokeCurrentAudio(audio);
  root.__awtsmoosAudio = makeAudioState();
  syncPlayer(root);
}

function revokeCurrentAudio(audio) {
  if (audio?.dataset?.objectUrl?.startsWith?.("blob:")) URL.revokeObjectURL(audio.dataset.objectUrl);
  audio?.removeAttribute?.("src");
  try { audio?.load?.(); } catch {}
}

function audioSignature({ conversationId, messageId, voice, format }) {
  return [conversationId || "", messageId || "", voice || "", format || ""].join("::");
}

function estimateLiveTime(audio) {
  const duration = Number(audio.duration || 0);
  return Number.isFinite(duration) && duration > 0 ? ` · ${formatTime(duration)} loaded` : "";
}

function updateStatusSize(status, result = {}) { status.textContent = `Audio fetched${formatSize(result.size)}. Preparing player…`; }
function mediaError(audio) { const code = audio?.error?.code; return ({ 1: "Audio loading was aborted.", 2: "Network error while loading audio.", 3: "Browser could not decode this audio.", 4: "Audio format is not supported." })[code] || "Audio playback error."; }
function formatTime(seconds) { seconds = Math.max(0, Math.floor(Number(seconds) || 0)); const mins = Math.floor(seconds / 60); const secs = String(seconds % 60).padStart(2, "0"); return `${mins}:${secs}`; }
function formatSize(size) { return size ? ` (${(size / 1024 / 1024).toFixed(2)} MB)` : ""; }
function capitalize(text = "") { return text.slice(0, 1).toUpperCase() + text.slice(1); }
function toggleSettings(root, button) { const panel = root.querySelector(".audio-settings"); panel.hidden = !panel.hidden; button?.setAttribute("aria-expanded", panel.hidden ? "false" : "true"); }
function hydrateSelect(select, values, selected) { if (!select) return; select.innerHTML = values.map(value => `<option value="${escapeAttr(value)}">${escapeText(value.toUpperCase())}</option>`).join(""); select.value = values.includes(selected) ? selected : values[0]; }
function saveFromRoot(root) { const settings = { voice: root.querySelector('[data-audio-setting="voice"]')?.value || DEFAULTS.voice, format: root.querySelector('[data-audio-setting="format"]')?.value || DEFAULTS.format }; try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {} return settings; }
function loadAudioSettings() { try { return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") || {}) }; } catch { return { ...DEFAULTS }; } }
function statusNode(root) { return root.querySelector(".audio-status"); }
function escapeText(text) { return String(text || "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
function escapeAttr(text) { return escapeText(text).replace(/"/g, "&quot;"); }
