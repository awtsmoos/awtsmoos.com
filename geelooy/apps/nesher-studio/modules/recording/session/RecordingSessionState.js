/* B"H
 * Recording session state: boolean dust becomes named phases, yet old callers still see `state.recording`.
 * The Awtsmoos gives every instant a name so the broken red button can confess its path.
 */
export const RECORDING_PHASE = { IDLE:'idle', STARTING:'starting', RECORDING:'recording', STOPPING:'stopping', FAILED:'failed' };

export function createRecordingSessionState() {
  return { phase:RECORDING_PHASE.IDLE, startedAt:0, elapsedMs:0, frames:0, encodedFrames:0, droppedFrames:0, errors:[], lastMessage:'Manual recorder idle.', timer:null };
}

export function ensureRecordingSession(state) {
  state.recordingSession ||= createRecordingSessionState();
  return state.recordingSession;
}

export function beginRecordingStart(state, message = 'Preparing manual WebCodecs recorder...') {
  const s = ensureRecordingSession(state);
  Object.assign(s, { phase:RECORDING_PHASE.STARTING, startedAt:Date.now(), elapsedMs:0, frames:0, encodedFrames:0, droppedFrames:0, errors:[], lastMessage:message });
  state.recording = false; state.activeRecorder = null; return s;
}

export function markRecordingActive(state, recorder, message = 'Recording.') {
  const s = ensureRecordingSession(state);
  Object.assign(s, { phase:RECORDING_PHASE.RECORDING, startedAt:s.startedAt || Date.now(), lastMessage:message });
  state.recording = true; state.activeRecorder = recorder; return refreshRecordingSession(state);
}

export function markRecordingStopping(state, message = 'Finalizing recording...') {
  const s = ensureRecordingSession(state);
  s.phase = RECORDING_PHASE.STOPPING; s.lastMessage = message; state.recording = false; return refreshRecordingSession(state);
}

export function finishRecordingSession(state, message = 'Recording complete.') {
  const s = refreshRecordingSession(state);
  s.phase = RECORDING_PHASE.IDLE; s.lastMessage = message; clearRecordingTimer(state); state.recording = false; state.activeRecorder = null; return s;
}

export function failRecordingSession(state, error, prefix = 'Recording failed') {
  const s = refreshRecordingSession(state), text = error?.message || String(error || 'unknown error');
  s.phase = RECORDING_PHASE.FAILED; s.errors = [...(s.errors || []), text]; s.lastMessage = `${prefix}: ${text}`; clearRecordingTimer(state); state.recording = false; state.activeRecorder = null; return s;
}

export function refreshRecordingSession(state) {
  const s = ensureRecordingSession(state), recorder = state.activeRecorder;
  if (s.startedAt) s.elapsedMs = Math.max(0, Date.now() - s.startedAt);
  s.frames = Number(recorder?.frames ?? s.frames ?? 0);
  s.encodedFrames = Number(recorder?.encodedFrames ?? s.encodedFrames ?? 0);
  s.droppedFrames = Number(recorder?.droppedFrames ?? s.droppedFrames ?? 0);
  if (recorder?.errors?.length) s.errors = [...new Set([...(s.errors || []), ...recorder.errors])];
  return s;
}

export function clearRecordingTimer(state) { if (state.recordingSession?.timer) clearInterval(state.recordingSession.timer); if (state.recordingSession) state.recordingSession.timer = null; }
export function recordingBusy(state) { return [RECORDING_PHASE.STARTING, RECORDING_PHASE.STOPPING].includes(ensureRecordingSession(state).phase); }
export function recordingCanStop(state) { return ensureRecordingSession(state).phase === RECORDING_PHASE.RECORDING || !!state.recording; }
