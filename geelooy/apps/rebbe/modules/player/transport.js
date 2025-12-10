//B"H
// modules/player/transport.js
import { pState, init, resumeContext, loadBuffer, setBuffer } from './core.js';

export function setCallbacks(cbs) {
    pState.callbacks = { ...pState.callbacks, ...cbs };
    if(!pState.ctx) init();
}

export async function playUrl(url) {
    stopSource();
    pState.pauseOffset = 0;
    if(pState.callbacks.onUpdate) pState.callbacks.onUpdate(0, 0);
    
    const buffer = await loadBuffer(url);
    if (buffer) {
        playBuffer(buffer, 0);
    }
}

export async function playBlob(blob) {
    stopSource();
    pState.pauseOffset = 0;
    const buffer = await loadBuffer(blob);
    if (buffer) {
        playBuffer(buffer, 0);
    }
}

export function togglePlay() {
    if (!pState.buffer) return;
    
    if (pState.isPlaying) {
        const elapsed = pState.ctx.currentTime - pState.startTime;
        pState.pauseOffset += elapsed;
        stopSource(); 
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

function stopSource() {
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
    stopSource();
    setBuffer(buffer);
    
    pState.source = pState.ctx.createBufferSource();
    pState.source.buffer = buffer;
    pState.source.connect(pState.gain);
    
    pState.source.onended = () => {
        const expectedDuration = buffer.duration - offset;
        const elapsed = pState.ctx.currentTime - pState.startTime;
        
        if (pState.isPlaying && elapsed >= expectedDuration - 0.1) {
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