//B"H
// modules/studio/core/loop.js
import { ctx } from '../context.js';
import state from '../../state.js';
import { drawFrame } from '../render.js';

export function loop() {
    const canvas = document.getElementById('studio-preview-canvas');
    if (!canvas) {
        ctx.requestID = null;
        return;
    }
    
    const modal = document.getElementById('modal-studio');
    if (modal && modal.classList.contains('hidden')) {
        ctx.requestID = null;
        return; 
    }

    if (state.studioIsPlaying && ctx.audio) {
        state.currentTime = state.studioOffsetTime + (ctx.audio.currentTime - state.studioStartTime);
    }

    drawFrame();
    updatePlayhead();
    
    const stat = document.getElementById('studio-status');
    if (stat) stat.textContent = `T: ${state.currentTime.toFixed(2)}`;

    ctx.requestID = requestAnimationFrame(loop);
}

function updatePlayhead() {
    const p = document.getElementById('timeline-playhead');
    const c = document.getElementById('timeline-tracks');
    const header = document.querySelector('.track-head');
    
    if (p && c && header) {
        const headerW = header.offsetWidth;
        const x = state.currentTime * state.studioZoom;
        const scroll = c.scrollLeft;
        p.style.left = (headerW + x - scroll) + 'px';
    }
}