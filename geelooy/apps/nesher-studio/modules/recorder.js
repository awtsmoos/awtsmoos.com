/* B"H
Recorder bridge: the UI asks for a WebM, and the hidden paths of video plus audio are handed
into the WebCodecs vessel. If no audio exists, the truth is spoken instead of hidden.
*/
import { dom, setStatus } from './dom.js';
import { drawStage } from './stage.js';
import { downloadBlob } from './download.js';
import { describeAudioSources } from './recording/sourceAudio.js';
import { startWebCodecsWebmRecorder } from './webcodecs/webmRecorder.js';

export async function toggleRecording(state) {
  return state.recording ? stopRecording(state) : startRecording(state);
}

async function startRecording(state) {
  cleanup(state, '', true);
  state.recording = true;
  dom.recordButton.textContent = 'Stop Recording';
  const audioSummary = describeAudioSources(state.sources);
  try {
    state.webCodecsRecorder = await startWebCodecsWebmRecorder({
      canvas:dom.stage,
      fps:state.fps || 30,
      bitrate:Math.max(900000, state.width * state.height * 2),
      drawFrame:() => drawStage(state),
      sources:state.sources,
      onStatus:setStatus
    });
    setStatus(`Recording WebCodecs WebM; audio path: ${audioSummary}.`);
  } catch (e) {
    cleanup(state, `WebCodecs recording failed: ${e.message}`);
  }
}

async function stopRecording(state) {
  if (!state.webCodecsRecorder) return cleanup(state, 'No active WebCodecs recorder.');
  state.recording = false;
  dom.recordButton.textContent = 'Encoding...';
  setStatus('Finalizing WebCodecs VP9 WebM with optional Opus audio...');
  try {
    const result = await state.webCodecsRecorder.stop();
    downloadBlob(result.blob, `BH-Nesher-Studio-WebCodecs-${Date.now()}.webm`);
    const audio = result.audioActive ? `, ${result.audioFrames} audio frames, ${result.audioCodec}` : ', no muxed audio';
    cleanup(state, `WebCodecs WebM downloaded: ${result.frames} video frames${audio}.`);
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
