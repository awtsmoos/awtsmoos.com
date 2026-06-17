/* B"H */
import { elements } from '../ui.js';
import { recordingState, setVideoWorker } from './state.js';
import { downloadBlob } from './download.js';

export function createVideoWorker() {
    const cacheKey = Date.now();
    const worker = new Worker(`./synth-video-worker.js?bh=${cacheKey}`);
    worker.onmessage = event => handleWorkerMessage(worker, event.data);
    setVideoWorker(worker);
    return worker;
}

function handleWorkerMessage(worker, data) {
    const { type, payload } = data;
    const progress = elements.videoProgress;
    if (type === 'STATUS_UPDATE') progress.textContent = payload.message;
    else if (type === 'PROGRESS_UPDATE') progress.textContent = `Processing: ${payload.percent}%`;
    else if (type === 'VIDEO_COMPLETE') {
        progress.textContent = 'Complete! Downloading...';
        downloadBlob(payload.blob, `BH-Video-${Date.now()}.mp4`);
        worker.terminate();
        setVideoWorker(null);
        elements.recordVideoButton.textContent = 'Record 🎥';
        progress.textContent = '';
    } else if (type === 'FATAL_ERROR') {
        progress.textContent = payload.message;
        recordingState.isVideoRecording = false;
    }
}
