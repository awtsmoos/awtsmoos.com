//B"H
// modules/studio/core/preview-interaction.js
import state from '../../state.js';
import { drawFrame } from '../render.js';
import { ctx } from '../context.js';
import * as Actions from '../actions.js'; // To save state

// Interaction Modes
const MODE = {
    NONE: 0,
    PAN: 1,
    MOVE_CLIP: 2,
    ROTATE_CLIP: 3,
    SCALE_CLIP: 4
};

let currentMode = MODE.NONE;
let startX = 0; // Screen X
let startY = 0; // Screen Y

// Viewport snapshot
let startViewX = 0;
let startViewY = 0;

// Clip snapshot
let activeLayerId = null;
let startLayerX = 0;
let startLayerY = 0;
let startLayerRot = 0;
let startLayerScale = 0;
let startAngle = 0; // For rotation
let startDist = 0;  // For scale

export function initPreviewControls(canvasWrapper, canvas) {
    if(!canvasWrapper || !canvas) return;

    // MOUSE DOWN
    canvasWrapper.addEventListener('mousedown', (e) => {
        handleDown(e.clientX, e.clientY, canvas);
    });
    
    // TOUCH START
    canvasWrapper.addEventListener('touchstart', (e) => {
        if(e.touches.length === 1) {
            handleDown(e.touches[0].clientX, e.touches[0].clientY, canvas);
        }
        // Could support pinch zoom for canvas here, but sticking to single touch for now
    }, {passive: false});

    // MOUSE MOVE
    window.addEventListener('mousemove', (e) => {
        handleMove(e.clientX, e.clientY, canvas);
    });
    
    // TOUCH MOVE
    window.addEventListener('touchmove', (e) => {
        if(e.touches.length === 1) {
            e.preventDefault();
            handleMove(e.touches[0].clientX, e.touches[0].clientY, canvas);
        }
    }, {passive: false});

    // UP
    const end = () => {
        currentMode = MODE.NONE;
        activeLayerId = null;
        canvasWrapper.style.cursor = 'default';
    };
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);

    // Zoom (Wheel)
    canvasWrapper.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomSpeed = 0.001;
        const delta = -e.deltaY * zoomSpeed;
        let newScale = state.previewViewport.scale + delta;
        newScale = Math.max(0.1, Math.min(5.0, newScale)); 
        state.previewViewport.scale = newScale;
        requestAnimationFrame(() => drawFrame());
    }, { passive: false });
}

function handleDown(sx, sy, canvas) {
    startX = sx;
    startY = sy;
    
    // Get Canvas Space Coordinates
    const p = getCanvasPoint(sx, sy, canvas);
    
    // Hit Test Selected Clip first
    const hit = hitTest(p.x, p.y);
    
    if (hit) {
        // Save State for Undo
        Actions.saveState();
        
        activeLayerId = state.selectedClipId;
        const layer = state.mediaLayers.find(l => l.id === activeLayerId);
        
        if (hit.type === 'move') {
            currentMode = MODE.MOVE_CLIP;
            startLayerX = layer.x || 0.5;
            startLayerY = layer.y || 0.5;
            canvas.style.cursor = 'move';
        } else if (hit.type === 'rotate') {
            currentMode = MODE.ROTATE_CLIP;
            startLayerRot = layer.rotation || 0;
            // Angle from clip center to mouse
            const cx = (layer.x || 0.5) * state.studioGlobal.width;
            const cy = (layer.y || 0.5) * state.studioGlobal.height;
            startAngle = Math.atan2(p.y - cy, p.x - cx);
            canvas.style.cursor = 'alias'; // Rotate icon approximation
        } else if (hit.type === 'scale') {
            currentMode = MODE.SCALE_CLIP;
            startLayerScale = layer.scale || 1.0;
            const cx = (layer.x || 0.5) * state.studioGlobal.width;
            const cy = (layer.y || 0.5) * state.studioGlobal.height;
            startDist = Math.hypot(p.x - cx, p.y - cy);
            canvas.style.cursor = 'nwse-resize';
        }
    } else {
        // If no hit, Pan Canvas
        currentMode = MODE.PAN;
        startViewX = state.previewViewport.x;
        startViewY = state.previewViewport.y;
        canvas.style.cursor = 'grabbing';
    }
}

function handleMove(sx, sy, canvas) {
    if (currentMode === MODE.NONE) return;
    
    if (currentMode === MODE.PAN) {
        const dx = sx - startX;
        const dy = sy - startY;
        state.previewViewport.x = startViewX + dx;
        state.previewViewport.y = startViewY + dy;
    } 
    else if (activeLayerId) {
        const layer = state.mediaLayers.find(l => l.id === activeLayerId);
        if (!layer) return;
        
        const p = getCanvasPoint(sx, sy, canvas);
        const w = state.studioGlobal.width;
        const h = state.studioGlobal.height;

        if (currentMode === MODE.MOVE_CLIP) {
            // Delta in Screen Space / Scale = Delta in Canvas Space
            // Wait, we already have Canvas Point.
            // But we need Delta from START Canvas Point.
            // Let's keep it simple: Delta Screen / Scale
            
            const dx = (sx - startX) / state.previewViewport.scale;
            const dy = (sy - startY) / state.previewViewport.scale;
            
            // Convert pixels to normalized 0-1
            layer.x = startLayerX + (dx / w);
            layer.y = startLayerY + (dy / h);
        } 
        else if (currentMode === MODE.ROTATE_CLIP) {
            const cx = (layer.x || 0.5) * w;
            const cy = (layer.y || 0.5) * h;
            const curAngle = Math.atan2(p.y - cy, p.x - cx);
            const deltaAngle = curAngle - startAngle;
            layer.rotation = startLayerRot + (deltaAngle * 180 / Math.PI);
        }
        else if (currentMode === MODE.SCALE_CLIP) {
            const cx = (layer.x || 0.5) * w;
            const cy = (layer.y || 0.5) * h;
            const curDist = Math.hypot(p.x - cx, p.y - cy);
            // Ratio
            const ratio = curDist / startDist;
            layer.scale = Math.max(0.1, startLayerScale * ratio);
        }
        
        // Update Properties Panel if open?
        if (window.Studio && window.Studio.updatePropertiesPanel) {
            // Throttling this might be needed for perf, but for now ok
            // window.Studio.updatePropertiesPanel(); 
        }
    }
    
    requestAnimationFrame(() => drawFrame());
}

// Convert Screen Coordinates (clientX) to Internal Canvas Coordinates (0 -> 1080/1920)
function getCanvasPoint(sx, sy, canvas) {
    const rect = canvas.getBoundingClientRect();
    
    // 1. Mouse relative to element center
    const mx = sx - rect.left - (rect.width / 2);
    const my = sy - rect.top - (rect.height / 2);
    
    // 2. Remove Pan & Zoom
    // Transform was: T(center) -> T(pan) -> S(zoom) -> T(-center)
    // We reverse:
    
    const vp = state.previewViewport;
    
    // Inverse Pan
    let vx = mx - vp.x;
    let vy = my - vp.y;
    
    // Inverse Scale
    let cx = vx / vp.scale;
    let cy = vy / vp.scale;
    
    // 3. Coordinate is now relative to Center of unzoomed canvas. Add Center offset.
    const w = state.studioGlobal.width;
    const h = state.studioGlobal.height;
    
    return {
        x: cx + w/2,
        y: cy + h/2
    };
}

// Check if point (canvas space) hits selected clip controls
function hitTest(x, y) {
    if (state.selectedType !== 'media' || !state.selectedClipId) return null;
    
    const layer = state.mediaLayers.find(l => l.id === state.selectedClipId);
    if (!layer) return null;
    
    // Only if visible
    if (state.currentTime < layer.start || state.currentTime > layer.end) return null;

    // Get Bounds
    let w = 100, h = 100;
    const media = ctx.mediaCache[layer.src];
    if (media && media.ready) {
        if(media.type==='image') { w = media.el.naturalWidth; h = media.el.naturalHeight; }
        else { w = media.el.videoWidth; h = media.el.videoHeight; }
    }
    
    const scale = layer.scale || 1.0;
    const halfW = (w * scale) / 2;
    const halfH = (h * scale) / 2;
    
    // Transform point into Layer's Local Space (reverse translation and rotation)
    const cx = (layer.x || 0.5) * state.studioGlobal.width;
    const cy = (layer.y || 0.5) * state.studioGlobal.height;
    const rot = (layer.rotation || 0) * Math.PI / 180;
    
    // Translate back to origin
    let dx = x - cx;
    let dy = y - cy;
    
    // Rotate reverse
    const localX = dx * Math.cos(-rot) - dy * Math.sin(-rot);
    const localY = dx * Math.sin(-rot) + dy * Math.cos(-rot);
    
    // Now check bounds in local AABB
    // Top Handle (Rotation) -> at (0, -halfH - 30)
    const handleSz = 20;
    if (dist(localX, localY, 0, -halfH - 30) < 20) return { type: 'rotate' };
    
    // Corners (Scale)
    if (dist(localX, localY, -halfW, -halfH) < handleSz) return { type: 'scale' };
    if (dist(localX, localY, halfW, -halfH) < handleSz) return { type: 'scale' };
    if (dist(localX, localY, halfW, halfH) < handleSz) return { type: 'scale' };
    if (dist(localX, localY, -halfW, halfH) < handleSz) return { type: 'scale' };
    
    // Body (Move)
    if (localX >= -halfW && localX <= halfW && localY >= -halfH && localY <= halfH) {
        return { type: 'move' };
    }
    
    return null;
}

function dist(x1, y1, x2, y2) {
    return Math.hypot(x1 - x2, y1 - y2);
}