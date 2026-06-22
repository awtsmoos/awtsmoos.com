/* B"H
Recorder: WebCodecs only. The canvas is sampled into VideoFrame,
encoded by VideoEncoder, muxed by webm-muxer, then downloaded as WebM.
*/
import { dom, setStatus } from './dom.js';
import { drawStage } from './stage.js';
import { downloadBlob } from './download.js';
import { startWebCodecsWebmRecorder } from './webcodecs/webmRecorder.js';

export async function toggleRecording(state) {
  return state.recording ? stopRecording(state) : startRecording(state);
}

async function startRecording(state) {
  cleanup(state, '', true);
  state.recording = true;
  dom.recordButton.textContent = 'Stop Recording';
  try {
    state.webCodecsRecorder = await startWebCodecsWebmRecorder({
      canvas: dom.stage,
      fps: state.fps || 30,
      bitrate: Math.max(900000, state.width * state.height * 2),
      drawFrame: () => drawStage(state),
      onStatus: setStatus
    });
  } catch (e) {
    cleanup(state, `WebCodecs recording failed: ${e.message}`);
  }
}

async function stopRecording(state) {
  if (!state.webCodecsRecorder) return cleanup(state, 'No active WebCodecs recorder.');
  state.recording = false;
  dom.recordButton.textContent = 'Encoding...';
  setStatus('Finalizing WebCodecs VP9 WebM...');
  try {
    const result = await state.webCodecsRecorder.stop();
    downloadBlob(result.blob, `BH-Nesher-Studio-WebCodecs-${Date.now()}.webm`);
    cleanup(state, `WebCodecs WebM downloaded: ${result.frames} frames, ${result.codec}.`);
  } catch (e) {
    cleanup(state, `WebCodecs finalize failed: ${e.message}`);
  }
}

function cleanup(state, message, quiet = false) {
  state.recording = false;
  state.webCodecsRecorder = null;
  dom.recordButton.textContent = 'Start Recording';
  if (!quiet) setStatus(message);
}
