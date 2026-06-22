/* B"H */
import { createState } from './modules/state.js';
import { dom, setStatus } from './modules/dom.js';
import { makeWebcamSource, makeMonitorSource, makeDisplaySource, makeCanvasSource, makeIframeSource, makeBrowserSource } from './modules/sources.js';
import { addSource } from './modules/graph/sceneGraph.js';
import { bindDragging, drawStage, refreshSources, resizeStage } from './modules/stage.js';
import { bindScenes } from './modules/scenes.js';
import { duplicateSelected, moveSelected, removeSelected } from './modules/layers.js';
import { toggleRecording } from './modules/recorder.js';
import { createYoutubeHlsMpegTsStreamer } from './modules/youtube/hlsMpegTsStreamer.js';

const state = createState();
let hlsStream = null;
let hlsFrameTimer = null;
let hlsPumping = false;
const urlParams = new URLSearchParams(location.search);
const tunnelBase = urlParams.get('tunnelBase') || undefined;
resizeStage(state); bindDragging(state); bindScenes(state); refreshSources(state);

dom.applySize.addEventListener('click', () => { state.width = +dom.canvasWidth.value; state.height = +dom.canvasHeight.value; state.fps = +dom.fps.value; resizeStage(state); setStatus(`Stage resized to ${state.width}×${state.height} @ ${state.fps}fps.`); });
dom.addCanvas.addEventListener('click', () => add(makeCanvasSource()));
dom.addIframe.addEventListener('click', () => add(makeIframeSource(dom.iframeUrl.value.trim())));
dom.addBrowser.addEventListener('click', () => add(makeBrowserSource(dom.iframeUrl.value.trim())));
dom.addWebcam.addEventListener('click', async () => guardedAdd(makeWebcamSource, 'Webcam'));
dom.addMonitor.addEventListener('click', async () => guardedAdd(makeMonitorSource, 'Monitor capture'));
dom.addDisplay.addEventListener('click', async () => guardedAdd(makeDisplaySource, 'Tab/window capture'));
dom.layerUp.addEventListener('click', () => layerAction(() => moveSelected(state, 1), 'Layer moved up.'));
dom.layerDown.addEventListener('click', () => layerAction(() => moveSelected(state, -1), 'Layer moved down.'));
dom.duplicateSource.addEventListener('click', () => layerAction(() => duplicateSelected(state), 'Source duplicated. Stream sources cannot be duplicated; add another capture instead.'));
dom.removeSource.addEventListener('click', () => layerAction(() => removeSelected(state), 'Source removed.'));
dom.recordButton.addEventListener('click', () => toggleRecording(state));
dom.fmp4StreamButton.addEventListener('click', toggleYoutubeHlsStream);

async function guardedAdd(factory, label) { try { add(await factory()); } catch (e) { setStatus(`${label} blocked or unavailable: ${e.message}`); } }
function add(source) { addSource(state, source); refreshSources(state); drawStage(state); setStatus(`${source.name} added to the scene graph.`); }
function layerAction(action, okMessage) { const ok = action(); refreshSources(state); drawStage(state); setStatus(ok ? okMessage : 'Choose a source first, or the action is not available for that source.'); }

async function toggleYoutubeHlsStream() {
  try {
    if (hlsStream) {
      clearInterval(hlsFrameTimer); hlsFrameTimer = null;
      const stopped = await hlsStream.stop();
      hlsStream = null; dom.fmp4StreamButton.textContent = 'Start YouTube HLS';
      setStatus(`YouTube HLS stopped: ${stopped.frames} frames, ${stopped.segments} segment(s), ${stopped.uploaded} uploaded bytes.`);
      return;
    }
    setStatus('Starting H.264 MPEG-TS HLS encoder...');
    hlsStream = await createYoutubeHlsMpegTsStreamer({ canvas:dom.stage, fps:state.fps || 30, bitrate:Math.max(900000, state.width * state.height * 2), targetDuration:2, tunnelBase, drawFrame:() => drawStage(state), onStatus:setStatus });
    dom.fmp4StreamButton.textContent = 'Stop YouTube HLS';
    hlsFrameTimer = setInterval(pumpHlsFrame, Math.max(16, Math.round(1000 / (state.fps || 30))));
    await pumpHlsFrame();
    setStatus(`YouTube-shaped HLS stream running. Session ${hlsStream.sessionId}.`);
  } catch (e) {
    clearInterval(hlsFrameTimer); hlsFrameTimer = null; hlsStream = null; dom.fmp4StreamButton.textContent = 'Start YouTube HLS'; setStatus(`YouTube HLS failed: ${e.message}`);
  }
}
async function pumpHlsFrame() {
  if (!hlsStream || hlsPumping) return;
  hlsPumping = true;
  try { await hlsStream.addFrame(); } catch (e) { setStatus(`HLS frame skipped: ${e.message}`); }
  hlsPumping = false;
}
setInterval(() => drawStage(state), 1000 / 30);
