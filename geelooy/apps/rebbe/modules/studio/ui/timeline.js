//B"H
// modules/studio/ui/timeline.js
import state from '../../state.js';
import * as Actions from '../actions.js';
import { handleTimelineClick } from '../interaction.js';
import { renderRuler } from './components/ruler.js';
import { renderTrackLane } from './components/track.js';
import { drawFrame } from '../render.js';

const el = (id) => document.getElementById(id);

export function renderTimeline() {
    const ruler = el('timeline-ruler');
    const trackContainer = el('timeline-tracks');
    if(!ruler || !trackContainer) return;
    
    ensureScrubTrigger(); // The transparent seek layer
    ensureSnapGuide(trackContainer);
    bindTimelineInteraction(trackContainer);

    const zoom = state.studioZoom;
    
    // Determine max duration based on content
    let dur = 15;
    if (state.audioLayers.length) dur = Math.max(dur, Math.max(...state.audioLayers.map(l=>l.end)));
    if (state.mediaLayers.length) dur = Math.max(dur, Math.max(...state.mediaLayers.map(l=>l.end)));
    if (state.captions.length) dur = Math.max(dur, Math.max(...state.captions.map(l=>l.end)));
    dur += 5; // buffer
    
    // 1. Render Components
    renderRuler(ruler, dur, zoom);
    
    trackContainer.innerHTML = '';
    
    // RENDER LANES
    // 1. Captions (Top)
    renderTrackLane(trackContainer, "CAPTIONS", state.captions, 'caption');

    // 2. Media Layers (Dynamic Packing)
    // We separate layers into "lanes" so overlapping clips don't sit on top of each other.
    const mediaLanes = packLanes(state.mediaLayers);
    
    // Render Lanes in Reverse Order (Top Lane = Foreground/Top Z-Index) 
    // This matches standard NLEs (V3 above V2 above V1)
    for(let i = mediaLanes.length - 1; i >= 0; i--) {
        const laneName = mediaLanes.length > 1 ? `MEDIA ${i+1}` : `MEDIA`;
        renderTrackLane(trackContainer, laneName, mediaLanes[i], 'media');
    }

    // 3. Audio (Bottom)
    renderTrackLane(trackContainer, "AUDIO", state.audioLayers, 'audio');

    ensurePlayhead(trackContainer);
    updatePlayheadPosition();
}

/**
 * Packs overlapping clips into separate arrays (lanes).
 * Clips that overlap in time will be pushed to the next lane.
 * Preserves the input array order (Z-Index) logic: 
 * If Clip B (index 1) overlaps Clip A (index 0), B goes to Lane 1.
 */
function packLanes(layers) {
    if (!layers || layers.length === 0) return [[]];
    
    const lanes = [];
    
    layers.forEach(layer => {
        let placed = false;
        
        // Try to place in existing lanes (starting from 0 = bottom)
        for (let i = 0; i < lanes.length; i++) {
            const lane = lanes[i];
            // Check for collision
            const hasOverlap = lane.some(existing => 
                (layer.start < existing.end && layer.end > existing.start)
            );
            
            if (!hasOverlap) {
                lane.push(layer);
                placed = true;
                break;
            }
        }
        
        // If overlap in all lanes, create new one
        if (!placed) {
            lanes.push([layer]);
        }
    });
    
    return lanes.length > 0 ? lanes : [[]];
}

function ensurePlayhead(trackContainer) {
    if(!document.getElementById('timeline-playhead')) {
        const ph = document.createElement('div');
        ph.id = 'timeline-playhead';
        ph.className = 'timeline-playhead';
        trackContainer.appendChild(ph);
    }
}

function ensureSnapGuide(trackContainer) {
    let snapGuide = document.getElementById('snap-guide');
    if(!snapGuide) {
        snapGuide = document.createElement('div');
        snapGuide.id = 'snap-guide';
        snapGuide.className = 'snap-guide';
        trackContainer.parentElement.appendChild(snapGuide); 
    }
}

function ensureScrubTrigger() {
    // Add a layer over the ruler area specifically for seeking
    const header = document.querySelector('.timeline-header');
    if(header && !document.getElementById('scrub-trigger')) {
        const trig = document.createElement('div');
        trig.id = 'scrub-trigger';
        trig.title = "Drag to Seek";
        header.appendChild(trig);
        
        // Bind Scrub Logic
        trig.onmousedown = (e) => ScrubManager.start(e);
        trig.ontouchstart = (e) => ScrubManager.start(e);
    }
}

function bindTimelineInteraction(trackContainer) {
    trackContainer.onmousedown = (e) => {
        // If clicking on empty space in track container (not a block), deselect
        if(e.target === trackContainer || e.target.classList.contains('track-lane')) {
             handleTimelineClick(e);
        }
    };
}

export function updatePlayheadPosition() {
    const ph = document.getElementById('timeline-playhead');
    const container = document.getElementById('timeline-tracks');
    const header = document.querySelector('.track-head');
    
    if (ph && container && header) {
        const headerW = header.offsetWidth;
        const x = state.currentTime * state.studioZoom;
        const scroll = container.scrollLeft;
        
        // Move Horizontally
        ph.style.left = (headerW + x - scroll) + 'px';
        
        // Scale Vertically to match ScrollHeight (Fix infinite scroll issue)
        // We use Math.max to ensure it covers at least visible area
        const height = Math.max(container.clientHeight, container.scrollHeight);
        ph.style.height = height + 'px';
    }
}

// --- SMOOTH SCRUB MANAGER ---
const ScrubManager = {
    active: false,
    startX: 0,
    wasPlaying: false,
    headerWidth: 0,
    containerScroll: 0,

    start(e) {
        e.preventDefault(); // Stop text selection
        this.active = true;
        this.wasPlaying = state.studioIsPlaying;
        
        // PAUSE ENGINE BUT KEEP STATE
        if(this.wasPlaying) {
            Actions.stopAudio(); 
            // We set playing back to true internally in Manager to resume later
            this.wasPlaying = true; 
        }

        const ph = document.getElementById('timeline-playhead');
        if(ph) ph.classList.add('dragging');

        // Cache geometry
        const header = document.querySelector('.track-head');
        this.headerWidth = header ? header.offsetWidth : (window.innerWidth <= 768 ? 60 : 140);
        this.containerScroll = document.getElementById('timeline-tracks').scrollLeft;
        
        // Initial Seek
        this.update(e);

        // Bind Global
        const moveHandler = (ev) => this.update(ev);
        const upHandler = (ev) => this.end(ev, moveHandler, upHandler);
        
        window.addEventListener('mousemove', moveHandler);
        window.addEventListener('touchmove', moveHandler, {passive: false});
        window.addEventListener('mouseup', upHandler);
        window.addEventListener('touchend', upHandler);
    },

    update(e) {
        if(!this.active) return;
        
        let clientX = e.clientX;
        if(e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            e.preventDefault(); // Stop scrolling on mobile
        }
        
        // Calculate Time
        // Ruler logic: The ruler is inside the header row.
        // We need X relative to the START of the tracks (after the label).
        // Since 'scrub-trigger' is absolutely positioned after the label:
        const trigger = document.getElementById('scrub-trigger');
        const rect = trigger.getBoundingClientRect();
        
        let x = clientX - rect.left;
        
        // Add scroll offset from the tracks container
        x += this.containerScroll;
        
        const t = Math.max(0, x / state.studioZoom);
        
        // Update State
        state.currentTime = t;
        
        // Fast UI Update (Playhead & Time Text)
        updatePlayheadPosition();
        const stat = document.getElementById('studio-status');
        if (stat) stat.textContent = `T: ${t.toFixed(2)}`;

        // Fast Preview Render
        // We call drawFrame directly to bypass the loop overhead if loop is paused
        requestAnimationFrame(() => drawFrame());
    },

    end(e, moveFn, upFn) {
        this.active = false;
        const ph = document.getElementById('timeline-playhead');
        if(ph) ph.classList.remove('dragging');
        
        window.removeEventListener('mousemove', moveFn);
        window.removeEventListener('touchmove', moveFn);
        window.removeEventListener('mouseup', upFn);
        window.removeEventListener('touchend', upFn);
        
        // Resume if needed
        if(this.wasPlaying) {
            Actions.startAudio();
        }
    }
};