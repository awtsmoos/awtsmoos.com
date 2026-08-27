//B"H
// modules/export/audio-state.js
import { sliceAudioBuffer } from '../audio-utils.js';

export function setAudioProjectState(state, audioBuffer, startTime = 0, duration) {
    const fullDuration = audioBuffer.duration || 0;
    if (!Number.isFinite(fullDuration) || fullDuration <= 0) throw new Error('Decoded audio has no duration');

    startTime = Number.isFinite(startTime) ? Math.max(0, startTime) : 0;
    duration = Number.isFinite(duration) && duration > 0 ? duration : fullDuration;
    if (startTime >= fullDuration) startTime = 0;

    const effectiveDuration = Math.max(0.1, Math.min(duration, fullDuration - startTime));

    state.sourceAudioBuffer = audioBuffer;
    state.pendingSlice = sliceAudioBuffer(audioBuffer, startTime, startTime + effectiveDuration);
    state.audioLayers = [{
        id: Date.now(),
        type: 'audio',
        start: 0,
        end: effectiveDuration,
        offset: startTime,
        vol: 1.0,
        title: 'MAIN AUDIO'
    }];

    return true;
}

export function setAudioBlockedState(state, track) {
    state.sourceAudioBuffer = null;
    state.pendingSlice = null;
    state.pendingAudioShim = null;
    state.audioLayers = [{
        id: Date.now(),
        type: 'audio',
        start: 0,
        end: Math.max(1, state.currentDuration || 60),
        offset: 0,
        vol: 1,
        title: `ONLINE PLAYBACK ONLY - ${track?.title || 'AUDIO'}`
    }];
    state.audioBytesBlocked = true;
}
