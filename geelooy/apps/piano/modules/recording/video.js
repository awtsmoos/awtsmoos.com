/* B"H */
import { AudioState } from '../audio.js';
import { elements } from '../ui.js';
import { recordingState } from './state.js';
import { startMediaRecorder, stopMediaRecorder } from './media.js';
import { createVideoWorker } from './videoWorker.js';
import { makeVideoConfig } from './videoConfig.js';
import { logVideoKeyUp } from './videoEvents.js';

export async function toggleVideoRecording() {
    const btn = elements.recordVideoButton;
    if (recordingState.isVideoRecording) return stopVideo(btn);
    recordingState.videoKeyDownMap.clear();
    const worker = createVideoWorker();
    startMediaRecorder('video');
    recordingState.videoStartTime = AudioState.context.currentTime;
    worker.postMessage({ type: 'INITIALIZE_RENDERER', payload: makeVideoConfig() });
    recordingState.isVideoRecording = true;
    btn.textContent = 'STOP Video';
}

function stopVideo(btn) {
    const stopTime = AudioState.context.currentTime;
    recordingState.videoKeyDownMap.forEach((_down, noteName) => logVideoKeyUp(noteName, stopTime));
    recordingState.videoKeyDownMap.clear();
    stopMediaRecorder();
    recordingState.isVideoRecording = false;
    btn.textContent = 'Processing...';
}
