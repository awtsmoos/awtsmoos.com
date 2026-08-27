import assert from 'node:assert/strict';
import { beginRecordingStart, createRecordingSessionState, failRecordingSession, finishRecordingSession, markRecordingActive, markRecordingStopping, recordingBusy, recordingCanStop } from '../modules/recording/session/RecordingSessionState.js';

const state = { recording:false, activeRecorder:null, recordingSession:createRecordingSessionState() };
beginRecordingStart(state, 'prepare');
assert.equal(state.recordingSession.phase, 'starting');
assert.equal(recordingBusy(state), true);
assert.equal(state.recording, false);

markRecordingActive(state, { frames:3, errors:[] }, 'live');
assert.equal(state.recordingSession.phase, 'recording');
assert.equal(recordingCanStop(state), true);
assert.equal(state.recordingSession.frames, 3);

markRecordingStopping(state, 'stop');
assert.equal(state.recordingSession.phase, 'stopping');
assert.equal(recordingBusy(state), true);

finishRecordingSession(state, 'done');
assert.equal(state.recordingSession.phase, 'idle');
assert.equal(state.activeRecorder, null);

failRecordingSession(state, new Error('boom'), 'failed');
assert.equal(state.recordingSession.phase, 'failed');
assert.match(state.recordingSession.lastMessage, /boom/);
console.log('B"H recording state machine smoke passed');
