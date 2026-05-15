//B"H
// modules/export/audio.js
import { getTrack } from '../store.js';
import { fetchTrackBlob } from '../network.js';
import * as Render from '../../render.js';
import * as Audio from '../../audio.js';
import { setAudioProjectState, setAudioBlockedState } from './audio-state.js';
import { decodeBlobToAudioBuffer } from './audio-decode.js';

export async function ensureAudioState(startTime = 0, duration = 15, state) {
    if (state.sourceAudioBuffer) return true;

    const existingBuffer = Audio.getBuffer();
    if (existingBuffer) {
        Render.updateVideoProgress('CLONING BUFFER...', 0.2);
        return setAudioProjectState(state, existingBuffer, startTime, duration);
    }

    const track = state.currentTracks[state.trackIndex];
    if (!track) {
        Render.log('NLE AUDIO: NO TRACK SELECTED', true);
        return false;
    }

    try {
        Render.updateVideoProgress('BUFFERING READDABLE AUDIO...', 0.1);
        let blob = await getTrack(track.path);

        if (!blob) blob = await fetchTrackBlob(track);

        Render.updateVideoProgress('DECODING AUDIO...', 0.25);
        const audioBuffer = await decodeBlobToAudioBuffer(blob);
        Render.updateVideoProgress('AUDIO READY', 0.9);
        return setAudioProjectState(state, audioBuffer, startTime, duration);
    } catch(e) {
        console.error(e);
        setAudioBlockedState(state, track);
        Render.log('NLE AUDIO BYTES BLOCKED. EDITOR OPENED WITH ONLINE PLAYBACK ONLY.', true);
        Render.log('FOR EXPORT: USE A LOCAL PROXY OR CACHE THE FILE.', true);
        Render.updateVideoProgress('EDITOR OPEN - AUDIO BYTES BLOCKED', 1);
        return true;
    }
}

export async function bakeAudioTimeline(state) {
    if (!state.audioLayers.length || !state.sourceAudioBuffer) {
        Render.log('EXPORT WARNING: NO READABLE AUDIO TIMELINE', true);
        state.pendingAudioShim = null;
        return null;
    }

    const totalDuration = Math.max(0.1, ...state.audioLayers.map(l => Number(l.end) || 0));
    const sampleRate = state.sourceAudioBuffer.sampleRate || 44100;
    const channels = Math.min(2, state.sourceAudioBuffer.numberOfChannels || 1);
    const offlineCtx = new OfflineAudioContext(channels, Math.ceil(totalDuration * sampleRate), sampleRate);

    state.audioLayers.forEach(clip => {
        if (clip.end > clip.start) {
            const source = offlineCtx.createBufferSource();
            source.buffer = state.sourceAudioBuffer;
            const gain = offlineCtx.createGain();
            gain.gain.value = clip.vol ?? 1.0;
            source.connect(gain);
            gain.connect(offlineCtx.destination);

            const duration = clip.end - clip.start;
            let offset = Math.max(0, clip.offset || 0);
            if (offset >= state.sourceAudioBuffer.duration) return;

            let playDur = duration;
            if (offset + playDur > state.sourceAudioBuffer.duration) playDur = state.sourceAudioBuffer.duration - offset;

            source.start(Math.max(0, clip.start), offset, Math.max(0.01, playDur));
        }
    });

    Render.updateVideoProgress('BAKING AUDIO...', 0.5);
    const renderedBuffer = await offlineCtx.startRendering();
    state.pendingSlice = renderedBuffer;

    const shim = { sampleRate: renderedBuffer.sampleRate, length: renderedBuffer.length, duration: renderedBuffer.duration, numberOfChannels: renderedBuffer.numberOfChannels, channels: [] };
    for (let c = 0; c < renderedBuffer.numberOfChannels; c++) shim.channels.push(renderedBuffer.getChannelData(c));

    state.pendingAudioShim = shim;
    return shim;
}
