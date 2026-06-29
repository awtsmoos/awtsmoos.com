/* B"H
Nesher Studio boot: source garden, crop chamber, layer ladder, and manual WebCodecs flame.
*/
import { createState } from './modules/state.js';
import { dom, setStatus, setStreamHealth, setProviderUi } from './modules/dom.js';
import { makeWebcamSource, makeMonitorSource, makeDisplaySource, makeCanvasSource, makeIframeSource, makeBrowserSource, makeImageFileSource, makeVideoFileSource, makeAudioFileSource } from './modules/sources.js';
import { addSource } from './modules/graph/sceneGraph.js';
import { bindDragging, drawStage, refreshSources, resizeStage } from './modules/stage.js';
import { bindScenes } from './modules/scenes.js';
import { duplicateSelected, moveSelected, moveSelectedTop, moveSelectedBottom, removeSelected } from './modules/layers.js';
import { bindCropControls } from './modules/inspector.js';
import { toggleRecording } from './modules/recorder.js';
import { bindSizeControls } from './modules/recording/sizeControls.js';
import { DEFAULT_PROFILE_ID, profileOptionsHtml } from './modules/recording/manualRecordingProfile.js';
import { createYoutubeHlsMpegTsStreamer as createGenericHlsStreamer } from './modules/youtube/hlsMpegTsStreamer.js';
import { STREAM_PROVIDERS, getProvider, formatSummary } from './modules/providers/streamProviders.js';
import { createBin, addAsset, selectAsset, selectedAsset } from './modules/nle/bin.js';
import { createTimeline, addClip, selectClip } from './modules/nle/timeline.js';
import { createExportPlan, probeWebCodecsExport } from './modules/nle/exportPlan.js';
import { exportTimelinePreviewMp4 } from './modules/nle/browserExport.js';
import { renderNle } from './modules/nle/renderNle.js';
const state = createState(); let hlsStream = null, hlsFrameTimer = null, hlsHealthTimer = null, hlsPumping = false; const tunnelBase = new URLSearchParams(location.search).get('tunnelBase') || undefined; boot();
function boot() { ensureNleState(); resizeStage(state); bindDragging(state); bindScenes(state); refreshSources(state); setupRecordingProfiles(); setupProviders(); bindCanvasSizing(); bindCropControls(state, changed); renderNle(state, dom); setStreamHealth(); bindUi(); }
function ensureNleState() { state.bin ||= createBin(); state.timeline ||= createTimeline(); state.exportPlan ||= createExportPlan(state); }
function setupRecordingProfiles() { dom.recordingProfile.innerHTML = profileOptionsHtml(); dom.recordingProfile.value = state.recordingProfile || DEFAULT_PROFILE_ID; }
function bindCanvasSizing() { bindSizeControls({ dom, state, resizeStage, createExportPlan, renderNle, setStatus }); }
function setupProviders() { dom.streamProvider.innerHTML = STREAM_PROVIDERS.map(p => `<option value="${p.id}">${p.name}</option>`).join(''); dom.streamProvider.value = state.providerId; updateProviderUi(); }
function bindUi() {
  dom.addCanvas.onclick = () => add(makeCanvasSource()); dom.addIframe.onclick = () => add(makeIframeSource(dom.iframeUrl.value.trim())); dom.addBrowser.onclick = () => add(makeBrowserSource(dom.iframeUrl.value.trim()));
  dom.addWebcam.onclick = () => guardedAdd(() => makeWebcamSource('both'), 'Webcam'); dom.addWebcamVideo.onclick = () => guardedAdd(() => makeWebcamSource('video'), 'Webcam video'); dom.addMic.onclick = () => guardedAdd(() => makeWebcamSource('audio'), 'Mic audio');
  dom.addMonitor.onclick = () => guardedAdd(() => makeMonitorSource('both'), 'Monitor'); dom.addDisplay.onclick = () => guardedAdd(() => makeDisplaySource('both'), 'Display'); dom.addDisplayVideo.onclick = () => guardedAdd(() => makeDisplaySource('video'), 'Display video'); dom.addDisplayAudio.onclick = () => guardedAdd(() => makeDisplaySource('audio'), 'Display audio');
  dom.addImage.onclick = () => dom.imageFile.click(); dom.addVideoFile.onclick = () => dom.videoFile.click(); dom.addAudioFile.onclick = () => dom.audioFile.click(); dom.imageFile.onchange = () => addFile(dom.imageFile, makeImageFileSource); dom.videoFile.onchange = () => addFile(dom.videoFile, makeVideoFileSource); dom.audioFile.onchange = () => addFile(dom.audioFile, makeAudioFileSource);
  dom.layerTop.onclick = () => layerAction(() => moveSelectedTop(state), 'Source moved to top.'); dom.layerUp.onclick = () => layerAction(() => moveSelected(state, 1), 'Layer moved up.'); dom.layerDown.onclick = () => layerAction(() => moveSelected(state, -1), 'Layer moved down.'); dom.layerBottom.onclick = () => layerAction(() => moveSelectedBottom(state), 'Source moved to bottom.'); dom.duplicateSource.onclick = () => layerAction(() => duplicateSelected(state), 'Source duplicated.'); dom.removeSource.onclick = () => layerAction(() => removeSelected(state), 'Source removed.');
  dom.recordButton.onclick = () => toggleRecording(state); dom.fmp4StreamButton.onclick = toggleGenericHlsStream; dom.streamProvider.onchange = () => { state.providerId = dom.streamProvider.value; updateProviderUi(); };
  dom.addBinAsset.onclick = addGeneratedAsset; dom.addTimelineClip.onclick = addSelectedClip; dom.prepareExport.onclick = runExportProbe; dom.nleBin.onclick = selectBinFromEvent; dom.nleTimeline.onclick = selectClipFromEvent;
}
async function addFile(input, factory) { const file = input.files?.[0]; if (!file) return; try { add(await factory(file)); input.value = ''; } catch (e) { setStatus(`File source failed: ${e.message}`); } }
async function guardedAdd(factory, label) { try { add(await factory()); } catch (e) { setStatus(`${label} blocked or unavailable: ${e.message}`); } }
function add(source) { addSource(state, source); changed(`${source.name} added.`); }
function changed(message) { refreshSources(state); drawStage(state); setStatus(message); }
function layerAction(action, okMessage) { const ok = action(); changed(ok ? okMessage : 'Choose a source first, or the action is unavailable.'); }
function updateProviderUi() { setProviderUi(getProvider(state.providerId), formatSummary()); }
function addGeneratedAsset() { const asset = addAsset(state.bin, { name:`Generated scene ${state.bin.assets.length + 1}`, kind:'generated', duration:6 }); renderNle(state, dom); setStatus(`${asset.name} selected in media bin.`); }
function addSelectedClip() { const asset = selectedAsset(state.bin); if (!asset) return setStatus('No asset selected.'); const clip = addClip(state.timeline, { assetId:asset.id, name:asset.name, duration:Math.min(8, asset.duration || 4) }); renderNle(state, dom); setStatus(`${clip.name} placed at ${clip.start}s on timeline.`); }
function selectBinFromEvent(event) { const id = event.target.closest('[data-asset-id]')?.dataset.assetId; if (!id) return; const asset = selectAsset(state.bin, id); renderNle(state, dom); setStatus(`${asset.name} selected.`); }
function selectClipFromEvent(event) { const id = event.target.closest('[data-clip-id]')?.dataset.clipId; if (!id) return; selectClip(state.timeline, id); renderNle(state, dom); setStatus(`Timeline clip selected: ${id}.`); }
async function runExportProbe() { state.exportPlan = createExportPlan(state); setStatus('Probing WebCodecs and rendering a short in-memory MP4 preview...'); const probe = await probeWebCodecsExport(state.exportPlan); const mp4 = await exportTimelinePreviewMp4({ width:320, height:180, fps:15, seconds:1 }); renderNle(state, dom); setStatus(`Export preview OK: ${mp4.bytes.length} byte MP4, ${mp4.frames} frames. Probe: video ${probe.video ? 'supported' : 'limited'}, audio ${probe.audio ? 'supported' : 'limited'}.`); }
async function toggleGenericHlsStream() { try { if (hlsStream) return stopGenericHlsStream(); setStatus('Starting generic H.264 + AAC MPEG-TS HLS encoder...'); setStreamHealth({ state:'Starting' }); hlsStream = await createGenericHlsStreamer({ canvas:dom.stage, fps:state.fps || 30, bitrate:Math.max(900000, state.width * state.height * 2), targetDuration:2, tunnelBase, drawFrame:() => drawStage(state), onStatus:setStatus }); dom.fmp4StreamButton.textContent = 'Stop Generic HLS'; hlsFrameTimer = setInterval(pumpHlsFrame, Math.max(16, Math.round(1000 / (state.fps || 30)))); hlsHealthTimer = setInterval(updateStreamHealth, 500); await pumpHlsFrame(); updateStreamHealth(); setStatus(`Generic HLS running for ${getProvider(state.providerId).name}; session ${hlsStream.sessionId}.`); } catch (e) { cleanupStreamTimers(); hlsStream = null; dom.fmp4StreamButton.textContent = 'Start Generic HLS'; setStreamHealth({ state:'Failed', errors:1 }); setStatus(`Generic HLS failed: ${e.message}`); } }
async function stopGenericHlsStream() { cleanupStreamTimers(); setStreamHealth(readHealth('Stopping')); const stopped = await hlsStream.stop(); hlsStream = null; dom.fmp4StreamButton.textContent = 'Start Generic HLS'; setStreamHealth({ state:'Stopped', session:stopped.sessionId, frames:stopped.frames, segments:stopped.segments, uploaded:stopped.uploaded, errors:stopped.errors?.length || 0 }); setStatus(`Generic HLS stopped: ${stopped.frames} frames, ${stopped.segments} segments, ${stopped.uploaded} bytes.`); }
async function pumpHlsFrame() { if (!hlsStream || hlsPumping) return; hlsPumping = true; try { await hlsStream.addFrame(); } catch (e) { hlsStream.state.errors.push(e.message); setStatus(`HLS frame skipped: ${e.message}`); } hlsPumping = false; }
function updateStreamHealth() { setStreamHealth(readHealth('Running')); }
function readHealth(streamState) { const s = hlsStream?.state; return { state:streamState, session:hlsStream?.sessionId, frames:s?.frameIndex, segments:s?.segments?.length, uploaded:s?.uploaded, errors:s?.errors?.length }; }
function cleanupStreamTimers() { clearInterval(hlsFrameTimer); clearInterval(hlsHealthTimer); hlsFrameTimer = null; hlsHealthTimer = null; }
setInterval(() => drawStage(state), 1000 / 30);
