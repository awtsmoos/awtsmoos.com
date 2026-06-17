/* B"H */
import { AudioState } from '../audio.js';
import { recordingState } from './state.js';
import { downloadBlob } from './download.js';
import { finalizeVideoAudio } from './videoFinalize.js';

export function startMediaRecorder(mode) {
    const stream = AudioState.mediaStreamDestination.stream;
    const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
    recordingState.mediaRecorder = new MediaRecorder(stream, { mimeType });
    recordingState.audioChunks = [];
    recordingState.mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordingState.audioChunks.push(e.data); };
    recordingState.mediaRecorder.onstop = () => {
        if (mode === 'audio') downloadBlob(new Blob(recordingState.audioChunks, { type: mimeType }), `BH-Audio-${Date.now()}.webm`);
        if (mode === 'video') finalizeVideoAudio(recordingState.audioChunks);
    };
    recordingState.mediaRecorder.start(250);
}

export function stopMediaRecorder() { recordingState.mediaRecorder?.stop(); }
