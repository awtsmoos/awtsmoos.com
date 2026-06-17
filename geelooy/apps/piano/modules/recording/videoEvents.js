/* B"H */
import { AudioState } from '../audio.js';
import { scrollState } from '../ui.js';
import { recordingState } from './state.js';

export function logVideoKeyDown(noteName, coords = { x: 0, y: 0 }) {
    if (!recordingState.isVideoRecording || !recordingState.videoWorker || recordingState.videoKeyDownMap.has(noteName)) return;
    const startTime = AudioState.context.currentTime;
    recordingState.videoKeyDownMap.set(noteName, { startTime, x: coords.x || 0, y: coords.y || 0 });
    recordingState.videoWorker.postMessage({ type: 'KEY_DOWN', payload: { note: noteName, time: startTime - recordingState.videoStartTime, x: coords.x || 0, y: coords.y || 0 } });
}

export function logVideoKeyUp(noteName, explicitStopTime) {
    if (!recordingState.isVideoRecording || !recordingState.videoWorker || !recordingState.videoKeyDownMap.has(noteName)) return;
    const down = recordingState.videoKeyDownMap.get(noteName), stopTime = explicitStopTime || AudioState.context.currentTime;
    recordingState.videoWorker.postMessage({ type: 'ADD_KEY_EVENT', payload: { note: noteName, start: down.startTime - recordingState.videoStartTime, end: Math.max(stopTime - recordingState.videoStartTime, down.startTime - recordingState.videoStartTime + 0.016), x: down.x, y: down.y } });
    recordingState.videoKeyDownMap.delete(noteName);
}

export function sendFrameStateToWorker() {
    if (!recordingState.isVideoRecording || !recordingState.videoWorker) return;
    recordingState.videoWorker.postMessage({ type: 'UPDATE_SCROLL', payload: { time: AudioState.context.currentTime - recordingState.videoStartTime, scrollX: scrollState.x, scrollX2: scrollState.x2 || 0 } });
}
