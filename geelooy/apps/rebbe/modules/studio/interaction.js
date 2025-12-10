//B"H
// modules/studio/interaction.js
import state from '../state.js';

let dragTarget = null; 
let dragMode = null; 
let startX = 0;
let originalStart = 0;
let originalEnd = 0;
let originalOffset = 0;

export function handleBlockDown(e, type, index, item) {
    e.stopPropagation();
    state.selectedClipId = item.id;
    state.selectedType = type;
    state.activeTab = 'clip';
    
    if(window.Studio && window.Studio.updatePropertiesPanel) {
        window.Studio.updatePropertiesPanel();
    }

    const rect = e.target.getBoundingClientRect();
    const edgeMargin = 15; 
    const relX = e.clientX - rect.left;
    const w = rect.width;

    startX = e.clientX;
    originalStart = item.start;
    originalEnd = item.end;
    originalOffset = item.offset || 0;

    // Determine drag mode
    if (relX < edgeMargin) {
        dragMode = 'trim-start';
        document.body.style.cursor = 'ew-resize';
    } else if (relX > w - edgeMargin) {
        dragMode = 'trim-end';
        document.body.style.cursor = 'ew-resize';
    } else {
        dragMode = 'move';
        document.body.style.cursor = 'grabbing';
    }

    dragTarget = { type, index, item };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
}

function handleMove(e) {
    if (!dragTarget) return;

    const deltaPx = e.clientX - startX;
    const deltaSec = deltaPx / state.studioZoom;

    const item = dragTarget.item;
    const dur = state.pendingSlice ? state.pendingSlice.duration : 100;
    const minDur = 0.2;

    // Snapping
    const SNAP_TOLERANCE = 10 / state.studioZoom;
    const snap = (time) => {
        if(Math.abs(time) < SNAP_TOLERANCE) return 0;
        if(Math.abs(time - dur) < SNAP_TOLERANCE) return dur;
        if(Math.abs(time - state.currentTime) < SNAP_TOLERANCE) return state.currentTime;
        return time;
    };

    if (dragMode === 'move') {
        const length = originalEnd - originalStart;
        let newStart = snap(originalStart + deltaSec);
        let newEnd = newStart + length;
        
        item.start = newStart;
        item.end = newEnd;
    } 
    else if (dragMode === 'trim-start') {
        let newStart = snap(originalStart + deltaSec);
        if (newStart > item.end - minDur) newStart = item.end - minDur;
        item.start = newStart;
    } 
    else if (dragMode === 'trim-end') {
        let newEnd = snap(originalEnd + deltaSec);
        if (newEnd < item.start + minDur) newEnd = item.start + minDur;
        item.end = newEnd;
    }

    // Optimization: Don't force re-render synchronously
    if(window.Studio && window.Studio.renderTimeline) {
         requestAnimationFrame(() => window.Studio.renderTimeline());
    }
}

function handleUp() {
    dragTarget = null;
    dragMode = null;
    document.body.style.cursor = 'default';
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleUp);
}

export function handleTimelineClick(e) {
    if (!e.target.closest('.nle-block')) {
        state.selectedClipId = null;
        state.activeTab = 'global';
        if(window.Studio && window.Studio.updatePropertiesPanel) {
            window.Studio.updatePropertiesPanel();
        }
    }
}