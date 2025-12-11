//B"H
// modules/studio/core/preview-interaction.js
import state from '../../state.js';
import { drawFrame } from '../render.js';

let isDragging = false;
let startX = 0;
let startY = 0;
let startViewX = 0;
let startViewY = 0;

export function initPreviewControls(canvasWrapper, canvas) {
    if(!canvasWrapper || !canvas) return;

    // Pan (Drag)
    canvasWrapper.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startViewX = state.previewViewport.x;
        startViewY = state.previewViewport.y;
        canvasWrapper.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if(!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        state.previewViewport.x = startViewX + dx;
        state.previewViewport.y = startViewY + dy;
        requestAnimationFrame(() => drawFrame());
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        canvasWrapper.style.cursor = 'default';
    });

    // Zoom (Wheel)
    canvasWrapper.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomSpeed = 0.001;
        const delta = -e.deltaY * zoomSpeed;
        
        let newScale = state.previewViewport.scale + delta;
        newScale = Math.max(0.1, Math.min(5.0, newScale)); // Clamp zoom
        
        state.previewViewport.scale = newScale;
        requestAnimationFrame(() => drawFrame());
    }, { passive: false });
}
