//B"H
// modules/export/video.js
import * as Render from '../../render.js';
import { bakeAudioTimeline } from './audio.js';

export async function renderFinalVideo(state) {
    Render.closeModal('modal-studio');
    Render.openModal('modal-video'); 
    Render.updateVideoProgress("PREPARING ASSETS...", 0);

    // Bake Audio First
    await bakeAudioTimeline(state);

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
                particles: state.studioParticleSettings,
                fx: state.studioFX // Pass Global FX like beatRing
            }
        }
    }, transferables);
}

export async function handleDownloadAudioSlice(state) {
    if (!state.sourceAudioBuffer) return alert("NO AUDIO SOURCE");
    
    // Bake current edit
    await bakeAudioTimeline(state);
    
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
            a.download = `rebbe-audio-edit-${Date.now()}.wav`;
            document.body.appendChild(a);
            a.click();
            worker.terminate();
            Render.updateVideoProgress("DOWNLOAD READY", 1);
        }
    };
    
    worker.postMessage({ type: 'ENCODE_AUDIO', payload: state.pendingAudioShim });
}