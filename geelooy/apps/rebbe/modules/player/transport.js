//B"H
// modules/player/transport.js
import { pState, init, resumeContext, loadBuffer, setBuffer } from './core.js';
import * as Render from '../../render.js'; // Import Render to update loading UI

let loadRequestId = 0;

export function setCallbacks(cbs) {
    pState.callbacks = { ...pState.callbacks, ...cbs };
    if(!pState.ctx) init();
}

export async function playUrl(url) {
    stopSource();
    const currentId = ++loadRequestId; // Increment request ID
    
    // Notify Loading
    Render.setTracksLoading(true, "BUFFERING");
    
    pState.pauseOffset = 0;
    if(pState.callbacks.onUpdate) pState.callbacks.onUpdate(0, 0);
    
    try {
        const buffer = await loadBuffer(url);
        
        // Race Condition Check
        if (currentId !== loadRequestId) {
            console.log("Playback aborted: newer request detected.");
            return;
        }

        Render.setTracksLoading(false, "");
        if (buffer) {
            playBuffer(buffer, 0);
        }
    } catch(e) {
        if (currentId === loadRequestId) {
            Render.setTracksLoading(false, "ERROR");
            console.error(e);
        }
    }
}

export async function playBlob(blob) {
    stopSource();
    const currentId = ++loadRequestId;
    
    Render.setTracksLoading(true, "READING CACHE");
    pState.pauseOffset = 0;
    
    try {
        const buffer = await loadBuffer(blob);
        
        if (currentId !== loadRequestId) return;
        
        Render.setTracksLoading(false, "");
        if (buffer) {
            playBuffer(buffer, 0);
        }
    } catch (e) {
         if (currentId === loadRequestId) Render.setTracksLoading(false, "ERROR");
    }
}

export function togglePlay() {
    if (!pState.buffer) return;
    
    if (pState.isPlaying) {
        const elapsed = pState.ctx.currentTime - pState.startTime;
        pState.pauseOffset += elapsed;
        stopSource(false); // Don't reset everything, just pause
        if (pState.callbacks.onUpdate) pState.callbacks.onUpdate(pState.pauseOffset, pState.buffer.duration);
    } else {
        if(pState.ctx.state === 'suspended') pState.ctx.resume();
        playBuffer(pState.buffer, pState.pauseOffset);
    }
}

export function seek(time) {
    if (!pState.buffer) return;
    const duration = pState.buffer.duration;
    time = Math.max(0, Math.min(time, duration));
    
    pState.pauseOffset = time;
    
    if (pState.isPlaying) {
        playBuffer(pState.buffer, pState.pauseOffset);
    } else {
        if (pState.callbacks.onUpdate) pState.callbacks.onUpdate(pState.pauseOffset, duration);
    }
}

export function isPlaying() {
    return pState.isPlaying;
}

function stopSource(reset = true) {
    if (pState.source) {
        try {
            pState.source.stop();
            pState.source.disconnect();
        } catch (e) {}
        pState.source = null;
    }
    if (pState.animationFrameId) {
        cancelAnimationFrame(pState.animationFrameId);
        pState.animationFrameId = null;
    }
    pState.isPlaying = false;
}

function playBuffer(buffer, offset) {
    stopSource(false);
    setBuffer(buffer);
    
    pState.source = pState.ctx.createBufferSource();
    pState.source.buffer = buffer;
    pState.source.connect(pState.gain);
    
    pState.source.onended = () => {
        // Only trigger end if we actually played past the end, not just stopped
        const expectedDuration = buffer.duration - offset;
        const elapsed = pState.ctx.currentTime - pState.startTime;
        
        // Use a small threshold
        if (pState.isPlaying && elapsed >= expectedDuration - 0.2) {
            pState.isPlaying = false;
            cancelAnimationFrame(pState.animationFrameId);
            pState.pauseOffset = 0; 
            if (pState.callbacks.onEnd) pState.callbacks.onEnd();
        }
    };

    pState.source.start(0, offset);
    pState.startTime = pState.ctx.currentTime;
    pState.pauseOffset = offset;
    pState.isPlaying = true;

    updateLoop();
}

function updateLoop() {
    if (!pState.isPlaying) return;
    
    const elapsed = pState.ctx.currentTime - pState.startTime;
    const current = pState.pauseOffset + elapsed;
    
    if (pState.callbacks.onUpdate && pState.buffer) {
        pState.callbacks.onUpdate(current, pState.buffer.duration);
    }
    
    pState.animationFrameId = requestAnimationFrame(updateLoop);
}

// Proxy Object
export const audioEl = {
    get currentTime() { 
        if(!pState.ctx) return 0;
        if(pState.isPlaying) return pState.pauseOffset + (pState.ctx.currentTime - pState.startTime);
        return pState.pauseOffset; 
    },
    get duration() { return pState.buffer ? pState.buffer.duration : 0; },
    get paused() { return !pState.isPlaying; }
};