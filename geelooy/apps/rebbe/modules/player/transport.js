//B"H
// modules/player/transport.js
import { pState, init, resumeContext, setBuffer } from './core.js';
import * as Render from '../../render.js';

let currentUrl = null;

export function setCallbacks(cbs) {
    pState.callbacks = { ...pState.callbacks, ...cbs };
    if(!pState.ctx) init();
}

export async function playUrl(url) {
    if (!pState.ctx) init();
    resumeContext();
    
    // Release previous object URL if it was a blob
    if (currentUrl && currentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl);
    }
    currentUrl = url;

    // Reset Buffer state (since we are streaming now)
    setBuffer(null);

    Render.setTracksLoading(true, "CONNECTING STREAM");
    
    try {
        pState.audioElement.src = url;
        await pState.audioElement.play();
        Render.setTracksLoading(false, "");
    } catch(e) {
        console.warn("Autoplay or Stream Error", e);
        Render.setTracksLoading(false, "ERROR");
    }
}

export async function playBlob(blob) {
    const url = URL.createObjectURL(blob);
    playUrl(url);
}

export function togglePlay() {
    if (!pState.audioElement) return;
    
    if (pState.audioElement.paused) {
        resumeContext();
        pState.audioElement.play().catch(e => console.error(e));
    } else {
        pState.audioElement.pause();
    }
}

export function seek(time) {
    if (!pState.audioElement) return;
    if (Number.isFinite(time)) {
        pState.audioElement.currentTime = time;
    }
}

export function isPlaying() {
    return pState.audioElement ? !pState.audioElement.paused : false;
}

// Proxy Object matching the interface expected by UI
export const audioEl = {
    get currentTime() { 
        return pState.audioElement ? pState.audioElement.currentTime : 0; 
    },
    get duration() { 
        return pState.audioElement ? (pState.audioElement.duration || 0) : 0; 
    },
    get paused() { 
        return pState.audioElement ? pState.audioElement.paused : true; 
    }
};