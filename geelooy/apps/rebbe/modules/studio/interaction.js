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
    e.stopPropagation();
    state.selectedClipId = item.id;
    state.selectedType = type;
    state.activeTab = 'clip';
    
    if(window.Studio && window.Studio.updatePropertiesPanel) {
        window.Studio.updatePropertiesPanel();
    }
    
    // Save state for Undo before drag begins
    Actions.saveState();

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
    // const dur = state.pendingSlice ? state.pendingSlice.duration : 100; // Not used for limit currently
    const minDur = 0.1;

    // --- SNAPPING LOGIC ---
    // Collect snap points: Start/End of all other clips + Playhead
    const snapPoints = [state.currentTime];
    
    // Helper to add points
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
        
        if (bestDiff !== Infinity) {
             snapGuidePos = bestTime;
             return bestTime;
        }
        return rawTime;
    };

    if (dragMode === 'move') {
        const length = originalEnd - originalStart;
        const rawStart = originalStart + deltaSec;
        
        let newStart = applySnap(rawStart);
        // Also check if END snaps (secondary check)
        if (newStart === rawStart) {
            const rawEnd = rawStart + length;
            const snappedEnd = applySnap(rawEnd);
            if (snappedEnd !== rawEnd) {
                newStart = snappedEnd - length;
            }
        }

        if (newStart < 0) newStart = 0;
        
        item.start = newStart;
        item.end = newStart + length;
    } 
    else if (dragMode === 'trim-start') {
        let newStart = applySnap(originalStart + deltaSec);
        
        if (newStart > item.end - minDur) newStart = item.end - minDur;
        if (newStart < 0) newStart = 0;

        // Update offset for audio to keep content in place relative to time? 
        // Standard NLE behavior: 
        // If I trim start to the right (later), I am cropping the beginning.
        // offset should increase by (newStart - originalStart)
        
        if (dragTarget.type === 'audio') {
            const diff = newStart - originalStart;
            // Only if we actually moved
             item.offset = originalOffset + diff;
        }

        item.start = newStart;
    } 
    else if (dragMode === 'trim-end') {
        let newEnd = applySnap(originalEnd + deltaSec);
        if (newEnd < item.start + minDur) newEnd = item.start + minDur;
        item.end = newEnd;
    }

    // UPDATE UI
    // Update Guide
    const guide = document.getElementById('snap-guide');
    if (guide) {
        if (snapGuidePos !== null) {
            guide.style.display = 'block';
            // Calculate position relative to tracks container logic
            // Need header width
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

    // Optimization: Don't force re-render synchronously full DOM
    // But we need to update THIS block's position
    if(window.Studio && window.Studio.renderTimeline) {
         requestAnimationFrame(() => window.Studio.renderTimeline());
    }
}

function handleUp() {
    dragTarget = null;
    dragMode = null;
    document.body.style.cursor = 'default';
    const guide = document.getElementById('snap-guide');
    if(guide) guide.style.display = 'none';
    
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
        // Force redraw to remove selection outline
        if(window.Studio && window.Studio.renderTimeline) window.Studio.renderTimeline();
    }
}