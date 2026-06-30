/* B"H
Recorder bridge: manual WebCodecs only. No browser recorder. No surrender.
Profiles tune speed and quality while every file remains born from explicit encoders.
*/
import { dom, setStatus } from './dom.js';
import { drawStage } from './stage.js';
import { downloadBlob } from './download.js';
import { bitrateForProfile, getRecordingProfile, profileSummary } from './recording/manualRecordingProfile.js';
import { describeAudioSources } from './recording/sourceAudio.js';
import { beginRecordingStart, clearRecordingTimer, failRecordingSession, finishRecordingSession, markRecordingActive, markRecordingStopping, recordingBusy, recordingCanStop } from './recording/session/RecordingSessionState.js';
import { updateRecordingUi } from './recording/session/RecordingUi.js';
import { startWebCodecsWebmRecorder } from './webcodecs/webmRecorder.js';

export async function toggleRecording(state) {
  if (recordingBusy(state)) return statusOnly(state, 'Recording command already in progress.');
  return recordingCanStop(state) ? stopRecording(state) : startRecording(state);
}

async function startRecording(state) {
  const profile = getRecordingProfile(dom.recordingProfile?.value);
  beginRecordingStart(state, `Preparing ${profile.label} manual recorder...`);
  pulse(state); startPulseTimer(state); setStatus(`Starting manual WebCodecs recording: ${profileSummary(profile)}.`);
  try {
    const recorder = await startWebCodecsWebmRecorder(recordingConfig(state, profile));
    state.recordingProfile = profile.id;
    markRecordingActive(state, recorder, `Recording ${profileSummary(profile)}; audio path: ${describeAudioSources(state.sources)}.`);
    pulse(state); setStatus(state.recordingSession.lastMessage);
  } catch (error) {
    failRecordingSession(state, error, 'Manual WebCodecs recording failed');
    pulse(state); setStatus(state.recordingSession.lastMessage);
  }
}

async function stopRecording(state) {
  const recorder = state.activeRecorder;
  if (!recorder) return cleanupWithoutRecorder(state);
  markRecordingStopping(state, 'Finalizing manual WebCodecs WebM...');
  pulse(state); setStatus(state.recordingSession.lastMessage);
  try {
    const result = await recorder.stop();
    downloadBlob(result.blob, `BH-Nesher-Studio-Manual-WebCodecs-${Date.now()}.webm`);
    finishRecordingSession(state, statusForResult(result));
    pulse(state); setStatus(state.recordingSession.lastMessage);
  } catch (error) {
    failRecordingSession(state, error, 'Manual WebCodecs finalize failed');
    pulse(state); setStatus(state.recordingSession.lastMessage);
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
    onStatus:message => { setStatus(message); updateRecordingUi(dom, state, message); }
  };
}

function startPulseTimer(state) {
  clearRecordingTimer(state);
  state.recordingSession.timer = setInterval(() => pulse(state), 500);
}

function pulse(state) { updateRecordingUi(dom, state); }
function statusOnly(state, message) { setStatus(message); updateRecordingUi(dom, state, message); }
function cleanupWithoutRecorder(state) { finishRecordingSession(state, 'No active manual recorder.'); statusOnly(state, state.recordingSession.lastMessage); }

function statusForResult(result) {
  const audio = result.audioActive ? `, Opus ${result.audioFrames} audio frames` : ', no muxed audio';
  const drops = result.droppedFrames ? `, ${result.droppedFrames} dropped for speed` : '';
  return `Manual WebCodecs WebM ready: ${result.encodedFrames || result.frames} encoded video frames${drops}${audio}. Link added to Recordings shelf.`;
}
