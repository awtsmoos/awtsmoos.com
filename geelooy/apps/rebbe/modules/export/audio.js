//B"H
// modules/export/audio.js
import { sliceAudioBuffer } from '../audio-utils.js';
import { getTrack } from '../store.js';
import { fetchBlob } from '../network.js';
import * as Render from '../../render.js';
import * as Audio from '../../audio.js';

export async function ensureAudioState(startTime, duration, state) {
    if (state.sourceAudioBuffer) return true;
    
    const existingBuffer = Audio.getBuffer();
    let audioBuffer = null;

    if (existingBuffer) {
        Render.updateVideoProgress("CLONING BUFFER...", 0.2);
        audioBuffer = existingBuffer;
    } else {
        const track = state.currentTracks[state.trackIndex];
        if (!track) return false;

        Render.updateVideoProgress("BUFFERING SOURCE...", 0.1);
        try {
            let blob = await getTrack(track.path);
            if (!blob) blob = await fetchBlob(track.url);
            const arrayBuffer = await blob.arrayBuffer();
            
            const offlineCtx = new OfflineAudioContext(2, 44100, 44100);
            audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer);
        } catch(e) {
            Render.log(`AUDIO ERROR: ${e.message}`, true);
            return false;
        }
    }

    state.sourceAudioBuffer = audioBuffer;

    try {
        let effectiveDuration = duration;
        if (startTime >= audioBuffer.duration) startTime = 0; 
        if (startTime + duration > audioBuffer.duration) effectiveDuration = audioBuffer.duration - startTime;

        state.pendingSlice = sliceAudioBuffer(audioBuffer, startTime, startTime + effectiveDuration); 
        
        state.audioLayers = [{
            id: Date.now(),
            type: 'audio',
            start: 0, 
            end: effectiveDuration, 
            offset: startTime, 
            vol: 1.0,
            title: 'MAIN CUT'
        }];
        
        return true;
    } catch(e) {
        Render.log(`SETUP ERROR: ${e.message}`, true);
        return false;
    }
}

export async function bakeAudioTimeline(state) {
    if (!state.audioLayers.length || !state.sourceAudioBuffer) return null;

    const totalDuration = Math.max(...state.audioLayers.map(l => l.end));
    const sampleRate = 44100;
    const offlineCtx = new OfflineAudioContext(2, Math.ceil(totalDuration * sampleRate), sampleRate);

    state.audioLayers.forEach(clip => {
        if (clip.end > clip.start) {
            const source = offlineCtx.createBufferSource();
            source.buffer = state.sourceAudioBuffer;
            
            const gain = offlineCtx.createGain();
            gain.gain.value = clip.vol || 1.0;
            
            source.connect(gain);
            gain.connect(offlineCtx.destination);
            
            const duration = clip.end - clip.start;
            let offset = clip.offset;
            
            if (offset < 0) offset = 0;
            if (offset >= state.sourceAudioBuffer.duration) return;
            let playDur = duration;
            if (offset + playDur > state.sourceAudioBuffer.duration) playDur = state.sourceAudioBuffer.duration - offset;
            
            source.start(clip.start, offset, playDur);
        }
    });

    Render.updateVideoProgress("BAKING AUDIO...", 0.5);
    const renderedBuffer = await offlineCtx.startRendering();
    
    state.pendingSlice = renderedBuffer;

    const shim = {
        sampleRate: renderedBuffer.sampleRate,
        length: renderedBuffer.length,
        duration: renderedBuffer.duration,
        numberOfChannels: renderedBuffer.numberOfChannels,
        channels: []
    };
    for(let c=0; c<renderedBuffer.numberOfChannels; c++) {
        shim.channels.push(renderedBuffer.getChannelData(c));
    }
    state.pendingAudioShim = shim;
    
    return shim;
}