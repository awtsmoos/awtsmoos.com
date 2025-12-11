//B"H
// modules/studio/interaction.js
import state from '../state.js';
import * as Actions from './actions.js';

let dragTarget = null; 
let dragMode = null; 
let startX = 0;
let originalStart = 0;
let originalEnd = 0;
let originalOffset = 0;

export function handleBlockDown(e, type, index, item) {
    // STOP propagation so the timeline background click doesn't deselect immediately
    e.stopPropagation();
    e.preventDefault(); 

    // Update Selection
    state.selectedClipId = item.id;
    state.selectedType = type;
    state.activeTab = 'clip';
    
    // FORCE UI REFRESH (Only once on start)
    if(window.Studio) {
        if(window.Studio.renderTimeline) window.Studio.renderTimeline();
        if(window.Studio.updatePropertiesPanel) window.Studio.updatePropertiesPanel();
    }
    
    // Save state for Undo before drag begins
    Actions.saveState();

    let clientX = e.clientX;
    if(e.touches && e.touches.length > 0) clientX = e.touches[0].clientX;

    startX = clientX;
    originalStart = item.start;
    originalEnd = item.end;
    originalOffset = item.offset || 0;

    // Determine drag mode via Handles
    if (e.target.classList.contains('trim-handle')) {
        if (e.target.classList.contains('left')) {
            dragMode = 'trim-start';
            document.body.style.cursor = 'w-resize';
        } else {
            dragMode = 'trim-end';
            document.body.style.cursor = 'e-resize';
        }
    } else {
        dragMode = 'move';
        document.body.style.cursor = 'grabbing';
    }

    dragTarget = { type, index, item };
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, {passive: false});
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
}

function handleMove(e) {
    if (!dragTarget) return;

    let clientX = e.clientX;
    if(e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        e.preventDefault(); // Stop scroll
    }

    const deltaPx = clientX - startX;
    const deltaSec = deltaPx / state.studioZoom;
    const item = dragTarget.item;
    const minDur = 0.1;

    // --- SNAPPING LOGIC ---
    const snapPoints = [state.currentTime];
    const addPoints = (layers) => {
        layers.forEach(l => {
            if (l.id !== item.id) {
                snapPoints.push(l.start);
                snapPoints.push(l.end);
            }
        });
    };
    addPoints(state.audioLayers);
    addPoints(state.mediaLayers);
    
    const SNAP_TOLERANCE_PX = 15;
    const SNAP_TOLERANCE_SEC = SNAP_TOLERANCE_PX / state.studioZoom;
    let snapGuidePos = null;

    const applySnap = (rawTime) => {
        let bestDiff = Infinity;
        let bestTime = rawTime;
        for (const pt of snapPoints) {
            const diff = Math.abs(pt - rawTime);
            if (diff < SNAP_TOLERANCE_SEC && diff < bestDiff) {
                bestDiff = diff;
                bestTime = pt;
            }
        }
        if (bestDiff !== Infinity) { snapGuidePos = bestTime; return bestTime; }
        return rawTime;
    };

    if (dragMode === 'move') {
        const length = originalEnd - originalStart;
        const rawStart = originalStart + deltaSec;
        let newStart = applySnap(rawStart);
        if (newStart === rawStart) {
            const rawEnd = rawStart + length;
            const snappedEnd = applySnap(rawEnd);
            if (snappedEnd !== rawEnd) newStart = snappedEnd - length;
        }
        if (newStart < 0) newStart = 0;
        item.start = newStart;
        item.end = newStart + length;
    } 
    else if (dragMode === 'trim-start') {
        let newStart = applySnap(originalStart + deltaSec);
        if (newStart > item.end - minDur) newStart = item.end - minDur;
        if (newStart < 0) newStart = 0;
        if (dragTarget.type === 'audio') {
            const diff = newStart - originalStart;
             item.offset = originalOffset + diff;
        }
        item.start = newStart;
    } 
    else if (dragMode === 'trim-end') {
        let newEnd = applySnap(originalEnd + deltaSec);
        if (newEnd < item.start + minDur) newEnd = item.start + minDur;
        item.end = newEnd;
    }

    // UPDATE DOM DIRECTLY (PERFORMANCE OPTIMIZATION)
    // Do NOT re-render entire timeline. Just move the div.
    const blockEl = document.getElementById(`block-${item.id}`);
    if (blockEl) {
        const left = item.start * state.studioZoom;
        const width = (item.end - item.start) * state.studioZoom;
        blockEl.style.left = `${left}px`;
        blockEl.style.width = `${width}px`;
    }

    // UPDATE SNAP GUIDE UI
    const guide = document.getElementById('snap-guide');
    if (guide) {
        if (snapGuidePos !== null) {
            guide.style.display = 'block';
            const header = document.querySelector('.track-head');
            const tracks = document.getElementById('timeline-tracks');
            if(header && tracks) {
                 const x = (snapGuidePos * state.studioZoom) + header.offsetWidth - tracks.scrollLeft;
                 guide.style.left = x + 'px';
            }
        } else {
            guide.style.display = 'none';
        }
    }
}

function handleUp() {
    dragTarget = null;
    dragMode = null;
    document.body.style.cursor = 'default';
    const guide = document.getElementById('snap-guide');
    if(guide) guide.style.display = 'none';
    
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('touchmove', handleMove);
    window.removeEventListener('mouseup', handleUp);
    window.removeEventListener('touchend', handleUp);
    
    // Commit final state visually
    if(window.Studio && window.Studio.renderTimeline) {
        window.Studio.renderTimeline();
        // Update waveform if trimmed
        // (Block creation logic handles this in renderTimeline)
    }
}

export function handleTimelineClick(e) {
    if (e.target.closest('.nle-block')) return; 

    state.selectedClipId = null;
    state.activeTab = 'global';
    if(window.Studio && window.Studio.updatePropertiesPanel) {
        window.Studio.updatePropertiesPanel();
    }
    if(window.Studio && window.Studio.renderTimeline) window.Studio.renderTimeline();
}