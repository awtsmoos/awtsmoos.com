//B"H
// modules/video-gen.js
import { sliceAudioBuffer } from './audio-utils.js';
import { getTrack } from './store.js';
import { fetchBlob } from './network.js';
import * as Render from '../render.js';

// Helper: Prepare the audio slice state
async function ensureAudioState(startTime, duration, state) {
    if (state.pendingAudioShim && state.pendingSlice) return true;
    
    const track = state.currentTracks[state.trackIndex];
    if (!track) return false;

    Render.updateVideoProgress("BUFFERING SOURCE...", 0.1);
    try {
        let blob = await getTrack(track.path);
        if (!blob) blob = await fetchBlob(track.url);
        const arrayBuffer = await blob.arrayBuffer();
        
        const offlineCtx = new OfflineAudioContext(2, 44100, 44100);
        const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer);
        
        // Clamp duration
        if (startTime >= audioBuffer.duration) return false;
        if (startTime + duration > audioBuffer.duration) duration = audioBuffer.duration - startTime;

        const slice = sliceAudioBuffer(audioBuffer, startTime, startTime + duration);
        state.pendingSlice = slice; 
        
        // Create Shim structure for Worker
        state.pendingAudioShim = {
            sampleRate: slice.sampleRate,
            length: slice.length,
            duration: slice.duration,
            numberOfChannels: slice.numberOfChannels,
            channels: []
        };
        for(let c=0; c<slice.numberOfChannels; c++) {
            state.pendingAudioShim.channels.push(slice.getChannelData(c));
        }
        return true;
    } catch(e) {
        Render.log(`AUDIO ERROR: ${e.message}`, true);
        return false;
    }
}

export async function handleAnalyzeVideo(startTime, duration, resolution, state, onNLEReady) {
    state.resolutionSetting = resolution;
    
    // Reset previous NLE state if starting fresh
    state.captions = [];
    state.mediaLayers = [];
    state.selectedClipId = null;

    const success = await ensureAudioState(startTime, duration, state);
    if (!success) {
        Render.updateVideoProgress("FAILED TO LOAD TRACK", 0);
        return false;
    }
    
    onNLEReady(); 
    return true;
}

export async function handleDownloadAudioSlice(state) {
    const start = parseFloat(document.getElementById('vid-start').value || 0);
    const dur = parseFloat(document.getElementById('vid-duration').value || 15);

    const ready = await ensureAudioState(start, dur, state);
    if (!ready) return alert("COULD NOT PREPARE AUDIO");
    
    Render.updateVideoProgress("ENCODING WAV...", 0);
    const worker = new Worker('workers/rebbe-video-worker.js');
    
    worker.onmessage = (e) => {
        const { type, payload } = e.data;
        if (type === 'AUDIO_PROGRESS') {
            Render.updateVideoProgress(`ENCODING ${(payload*100).toFixed(0)}%`, payload);
        } else if (type === 'AUDIO_COMPLETE') {
            const url = URL.createObjectURL(payload);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rebbe-audio-${Date.now()}.wav`;
            document.body.appendChild(a);
            a.click();
            worker.terminate();
            Render.updateVideoProgress("DOWNLOAD READY", 1);
        }
    };
    
    worker.postMessage({ type: 'ENCODE_AUDIO', payload: state.pendingAudioShim });
}

export async function renderFinalVideo(state) {
    Render.closeModal('modal-studio');
    Render.openModal('modal-video'); 
    Render.updateVideoProgress("PREPARING ASSETS...", 0);

    let width = 1080, height = 1920;
    if (state.resolutionSetting === 'landscape') { width = 1920; height = 1080; }
    if (state.resolutionSetting === 'square') { width = 1080; height = 1080; }

    const workerLayers = [];
    for(const layer of state.mediaLayers) {
        try {
            const resp = await fetch(layer.src);
            const blob = await resp.blob();
            const bitmap = await createImageBitmap(blob);
            
            workerLayers.push({
                bitmap: bitmap,
                start: layer.start,
                end: layer.end,
                x: layer.x,
                y: layer.y,
                scale: layer.scale,
                rotation: layer.rotation || 0,
                opacity: layer.opacity !== undefined ? layer.opacity : 1,
                blendMode: layer.blendMode || 'source-over',
                filter: layer.filter || { brightness: 100, blur: 0 },
                type: 'image'
            });
        } catch(e) {
            console.error("Failed to load layer", layer, e);
        }
    }

    Render.updateVideoProgress("INITIALIZING RENDER KERNEL...", 0.1);
    const worker = new Worker('workers/rebbe-video-worker.js');
    
    worker.onmessage = (e) => {
        const { type, payload } = e.data;
        
        if (type === 'STATUS_UPDATE') {
            Render.updateVideoProgress(payload.message, payload.progress);
        }
        else if (type === 'VIDEO_COMPLETE') {
            const url = URL.createObjectURL(payload);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rebbe-studio-export-${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            worker.terminate();
            Render.updateVideoProgress("DONE", 1);
            setTimeout(() => Render.closeModal('modal-video'), 2000);
        }
        else if (type === 'FATAL_ERROR') {
             Render.log(`RENDER ERROR: ${payload.message}`, true);
             Render.updateVideoProgress("FAILED", 1);
             worker.terminate();
        }
    };

    const transferables = workerLayers.map(l => l.bitmap);

    worker.postMessage({
        type: 'START_EXPORT',
        payload: {
            audioShim: state.pendingAudioShim,
            captions: state.captions, 
            mediaLayers: workerLayers,
            settings: {
                resolution: { width, height },
                particles: state.studioParticleSettings
            }
        }
    }, transferables);
}