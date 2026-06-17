/* B"H */
import { AudioState } from '../audio.js';
import { elements } from '../ui.js';
import { recordingState } from './state.js';

export function finalizeVideoAudio(chunks) {
    if (!chunks.length) { elements.videoProgress.textContent = 'No audio chunks captured.'; return; }
    const blob = new Blob(chunks, { type: chunks[0].type });
    const reader = new FileReader();
    reader.onload = async e => {
        elements.videoProgress.textContent = 'Decoding Audio...';
        const buffer = await AudioState.context.decodeAudioData(e.target.result);
        const shim = { sampleRate: buffer.sampleRate, length: buffer.length, duration: buffer.duration, numberOfChannels: buffer.numberOfChannels, channels: [] };
        for (let i = 0; i < buffer.numberOfChannels; i++) shim.channels.push(buffer.getChannelData(i));
        elements.videoProgress.textContent = 'Muxing...';
        recordingState.videoWorker.postMessage({ type: 'FINALIZE_MUXING', payload: { audioBufferShim: shim } }, shim.channels.map(c => c.buffer));
    };
    reader.readAsArrayBuffer(blob);
}
