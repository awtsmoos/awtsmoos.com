/* B"H */
import { createState } from './modules/state.js';
import { dom, setStatus, setStreamHealth, setProviderUi } from './modules/dom.js';
import { makeWebcamSource, makeMonitorSource, makeDisplaySource, makeCanvasSource, makeIframeSource, makeBrowserSource } from './modules/sources.js';
import { addSource } from './modules/graph/sceneGraph.js';
import { bindDragging, drawStage, refreshSources, resizeStage } from './modules/stage.js';
import { bindScenes } from './modules/scenes.js';
import { duplicateSelected, moveSelected, removeSelected } from './modules/layers.js';
import { toggleRecording } from './modules/recorder.js';
import { createYoutubeHlsMpegTsStreamer as createGenericHlsStreamer } from './modules/youtube/hlsMpegTsStreamer.js';
import { STREAM_PROVIDERS, getProvider, formatSummary } from './modules/providers/streamProviders.js';
import { createBin, addAsset } from './modules/nle/bin.js';
import { createTimeline, addClip } from './modules/nle/timeline.js';
import { createExportPlan } from './modules/nle/exportPlan.js';
import { renderNle } from './modules/nle/renderNle.js';
const state = createState(); let hlsStream = null, hlsFrameTimer = null, hlsHealthTimer = null, hlsPumping = false;
const tunnelBase = new URLSearchParams(location.search).get('tunnelBase') || undefined;
boot();
function boot() { ensureNleState(); resizeStage(state); bindDragging(state); bindScenes(state); refreshSources(state); setupProviders(); renderNle(state, dom); setStreamHealth(); bindUi(); }
function ensureNleState() { state.bin ||= createBin(); state.timeline ||= createTimeline(); state.exportPlan ||= createExportPlan(state); }
function setupProviders() { dom.streamProvider.innerHTML = STREAM_PROVIDERS.map(p => `<option value="${p.id}">${p.name}</option>`).join(''); dom.streamProvider.value = state.providerId; updateProviderUi(); }
function bindUi() { dom.applySize.addEventListener('click', applySize); dom.addCanvas.addEventListener('click', () => add(makeCanvasSource())); dom.addIframe.addEventListener('click', () => add(makeIframeSource(dom.iframeUrl.value.trim()))); dom.addBrowser.addEventListener('click', () => add(makeBrowserSource(dom.iframeUrl.value.trim()))); dom.addWebcam.addEventListener('click', async () => guardedAdd(makeWebcamSource, 'Webcam')); dom.addMonitor.addEventListener('click', async () => guardedAdd(makeMonitorSource, 'Monitor capture')); dom.addDisplay.addEventListener('click', async () => guardedAdd(makeDisplaySource, 'Tab/window capture')); dom.layerUp.addEventListener('click', () => layerAction(() => moveSelected(state, 1), 'Layer moved up.')); dom.layerDown.addEventListener('click', () => layerAction(() => moveSelected(state, -1), 'Layer moved down.')); dom.duplicateSource.addEventListener('click', () => layerAction(() => duplicateSelected(state), 'Source duplicated.')); dom.removeSource.addEventListener('click', () => layerAction(() => removeSelected(state), 'Source removed.')); dom.recordButton.addEventListener('click', () => toggleRecording(state)); dom.fmp4StreamButton.addEventListener('click', toggleGenericHlsStream); dom.streamProvider.addEventListener('change', () => { state.providerId = dom.streamProvider.value; updateProviderUi(); }); dom.addBinAsset.addEventListener('click', addGeneratedAsset); dom.addTimelineClip.addEventListener('click', addGeneratedClip); dom.prepareExport.addEventListener('click', prepareExport); }
function applySize() { state.width = +dom.canvasWidth.value; state.height = +dom.canvasHeight.value; state.fps = +dom.fps.value; state.exportPlan = createExportPlan(state); resizeStage(state); renderNle(state, dom); setStatus(`Stage resized to ${state.width}×${state.height} @ ${state.fps}fps.`); }
async function guardedAdd(factory, label) { try { add(await factory()); } catch (e) { setStatus(`${label} blocked or unavailable: ${e.message}`); } }
function add(source) { addSource(state, source); refreshSources(state); drawStage(state); setStatus(`${source.name} added to the scene graph.`); }
function layerAction(action, okMessage) { const ok = action(); refreshSources(state); drawStage(state); setStatus(ok ? okMessage : 'Choose a source first, or the action is unavailable.'); }
function updateProviderUi() { setProviderUi(getProvider(state.providerId), formatSummary()); }
function addGeneratedAsset() { const asset = addAsset(state.bin, { name:`Generated scene ${state.bin.assets.length + 1}`, kind:'generated' }); renderNle(state, dom); setStatus(`${asset.name} added to media bin.`); }
function addGeneratedClip() { const clip = addClip(state.timeline, { name:`Timeline clip ${Date.now().toString().slice(-4)}` }); renderNle(state, dom); setStatus(`${clip.name} added to timeline.`); }
function prepareExport() { state.exportPlan = createExportPlan(state); renderNle(state, dom); setStatus('WebCodecs export plan prepared; mux/export implementation remains format-gated.'); }
async function toggleGenericHlsStream() { try { if (hlsStream) return stopGenericHlsStream(); setStatus('Starting generic H.264 + AAC MPEG-TS HLS encoder...'); setStreamHealth({ state:'Starting' }); hlsStream = await createGenericHlsStreamer({ canvas:dom.stage, fps:state.fps || 30, bitrate:Math.max(900000, state.width * state.height * 2), targetDuration:2, tunnelBase, drawFrame:() => drawStage(state), onStatus:setStatus }); dom.fmp4StreamButton.textContent = 'Stop Generic HLS'; hlsFrameTimer = setInterval(pumpHlsFrame, Math.max(16, Math.round(1000 / (state.fps || 30)))); hlsHealthTimer = setInterval(updateStreamHealth, 500); await pumpHlsFrame(); updateStreamHealth(); setStatus(`Generic HLS running for ${getProvider(state.providerId).name}; session ${hlsStream.sessionId}.`); } catch (e) { cleanupStreamTimers(); hlsStream = null; dom.fmp4StreamButton.textContent = 'Start Generic HLS'; setStreamHealth({ state:'Failed', errors:1 }); setStatus(`Generic HLS failed: ${e.message}`); } }
async function stopGenericHlsStream() { cleanupStreamTimers(); setStreamHealth(readHealth('Stopping')); const stopped = await hlsStream.stop(); hlsStream = null; dom.fmp4StreamButton.textContent = 'Start Generic HLS'; setStreamHealth({ state:'Stopped', session:stopped.sessionId, frames:stopped.frames, segments:stopped.segments, uploaded:stopped.uploaded, errors:stopped.errors?.length || 0 }); setStatus(`Generic HLS stopped: ${stopped.frames} frames, ${stopped.segments} segments, ${stopped.uploaded} bytes.`); }
async function pumpHlsFrame() { if (!hlsStream || hlsPumping) return; hlsPumping = true; try { await hlsStream.addFrame(); } catch (e) { hlsStream.state.errors.push(e.message); setStatus(`HLS frame skipped: ${e.message}`); } hlsPumping = false; }
function updateStreamHealth() { setStreamHealth(readHealth('Running')); }
function readHealth(streamState) { const s = hlsStream?.state; return { state:streamState, session:hlsStream?.sessionId, frames:s?.frameIndex, segments:s?.segments?.length, uploaded:s?.uploaded, errors:s?.errors?.length }; }
function cleanupStreamTimers() { clearInterval(hlsFrameTimer); clearInterval(hlsHealthTimer); hlsFrameTimer = null; hlsHealthTimer = null; }
setInterval(() => drawStage(state), 1000 / 30);
