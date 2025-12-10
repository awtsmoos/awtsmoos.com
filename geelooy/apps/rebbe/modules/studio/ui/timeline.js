//B"H
// modules/studio/ui/timeline.js
import state from '../../state.js';
import * as Actions from '../actions.js';
import { handleTimelineClick } from '../interaction.js';
import { renderRuler } from './components/ruler.js';
import { renderTrackLane } from './components/track.js';

const el = (id) => document.getElementById(id);

export function renderTimeline() {
    const ruler = el('timeline-ruler');
    const trackContainer = el('timeline-tracks');
    if(!ruler || !trackContainer) return;
    
    ensureSnapGuide(trackContainer);
    bindTimelineInteraction(trackContainer);

    const zoom = state.studioZoom;
    
    // Determine max duration based on content
    let dur = 15;
    if (state.audioLayers.length) dur = Math.max(dur, Math.max(...state.audioLayers.map(l=>l.end)));
    if (state.mediaLayers.length) dur = Math.max(dur, Math.max(...state.mediaLayers.map(l=>l.end)));
    dur += 5; // buffer
    
    // 1. Render Components
    renderRuler(ruler, dur, zoom);
    
    trackContainer.innerHTML = '';
    renderTrackLane(trackContainer, "AUDIO", state.audioLayers, 'audio');
    renderTrackLane(trackContainer, "MEDIA", state.mediaLayers, 'media');
    renderTrackLane(trackContainer, "CAPTIONS", state.captions, 'caption');

    updatePlayhead(trackContainer);
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

function bindTimelineInteraction(trackContainer) {
    trackContainer.onmousedown = (e) => {
        if(e.target === trackContainer || e.target.classList.contains('track-lane') || e.target.classList.contains('nle-track')) {
             const containerRect = trackContainer.getBoundingClientRect();
             const header = document.querySelector('.track-head');
             const headerW = header ? header.offsetWidth : 120;
             
             const clickXInside = e.clientX - containerRect.left;
             const contentX = clickXInside + trackContainer.scrollLeft - headerW;
             
             if (contentX >= 0) {
                 Actions.seek(contentX / state.studioZoom);
             }
             handleTimelineClick(e);
        }
    };
}

function updatePlayhead(trackContainer) {
    const ph = document.createElement('div');
    ph.id = 'timeline-playhead';
    ph.className = 'timeline-playhead';
    trackContainer.appendChild(ph);
    
    const header = document.querySelector('.track-head');
    if (header) {
        const headerW = header.offsetWidth;
        const x = state.currentTime * state.studioZoom;
        const scroll = trackContainer.scrollLeft;
        ph.style.left = (headerW + x - scroll) + 'px';
    }
}