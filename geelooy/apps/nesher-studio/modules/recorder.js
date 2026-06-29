/* B"H
Recorder bridge: manual WebCodecs only. No browser recorder. No surrender.
Profiles tune speed and quality while every file remains born from explicit encoders.
*/
import { dom, setStatus } from './dom.js';
import { drawStage } from './stage.js';
import { downloadBlob } from './download.js';
import { bitrateForProfile, getRecordingProfile, profileSummary } from './recording/manualRecordingProfile.js';
import { describeAudioSources } from './recording/sourceAudio.js';
import { startWebCodecsWebmRecorder } from './webcodecs/webmRecorder.js';

export async function toggleRecording(state) {
  return state.recording ? stopRecording(state) : startRecording(state);
}

async function startRecording(state) {
  cleanup(state, '', true);
  state.recording = true;
  dom.recordButton.textContent = 'Stop Recording';
  const profile = getRecordingProfile(dom.recordingProfile?.value);
  try {
    state.activeRecorder = await startWebCodecsWebmRecorder(recordingConfig(state, profile));
    state.recordingProfile = profile.id;
    setStatus(`Manual WebCodecs recording: ${profileSummary(profile)}; audio path: ${describeAudioSources(state.sources)}.`);
  } catch (e) {
    cleanup(state, `Manual WebCodecs recording failed: ${e.message}`);
  }
}

async function stopRecording(state) {
  const recorder = state.activeRecorder;
  if (!recorder) return cleanup(state, 'No active manual recorder.');
  state.recording = false;
  dom.recordButton.textContent = 'Finalizing...';
  setStatus('Finalizing manual WebCodecs WebM...');
  try {
    const result = await recorder.stop();
    downloadBlob(result.blob, `BH-Nesher-Studio-Manual-WebCodecs-${Date.now()}.webm`);
    cleanup(state, statusForResult(result));
  } catch (e) {
    cleanup(state, `Manual WebCodecs finalize failed: ${e.message}`);
  }
}

function recordingConfig(state, profile) {
  return {
    canvas:dom.stage,
    fps:state.fps || 30,
    bitrate:bitrateForProfile(state, profile),
    profileId:profile.id,
    drawFrame:() => drawStage(state),
    sources:state.sources,
    onStatus:setStatus
  };
}

function statusForResult(result) {
  const audio = result.audioActive ? `, Opus ${result.audioFrames} audio frames` : ', no muxed audio';
  const drops = result.droppedFrames ? `, ${result.droppedFrames} dropped for speed` : '';
  return `Manual WebCodecs WebM ready: ${result.encodedFrames || result.frames} encoded video frames${drops}${audio}. Link added to Recordings shelf.`;
}

function cleanup(state, message, quiet = false) {
  state.recording = false;
  state.activeRecorder = null;
  state.webCodecsRecorder = null;
  dom.recordButton.textContent = 'Start Recording';
  if (!quiet) setStatus(message);
}
