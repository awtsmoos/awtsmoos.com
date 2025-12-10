//B"H
// modules/studio/ui.js
import state from '../state.js';
import { handleBlockDown, handleTimelineClick } from './interaction.js';
import { renderGlobalProps, renderFXProps, renderClipProps } from './ui-props.js';

const el = (id) => document.getElementById(id);

export function renderTimeline() {
    const ruler = el('timeline-ruler');
    const trackContainer = el('timeline-tracks');
    if(!ruler || !trackContainer) return;

    el('studio-bottom').onclick = handleTimelineClick;

    const zoom = state.studioZoom;
    const dur = state.pendingSlice ? state.pendingSlice.duration : 10;
    const totalW = dur * zoom;

    // 1. Ruler
    ruler.innerHTML = '';
    const step = zoom > 150 ? 0.5 : 1;
    for(let i=0; i<=Math.ceil(dur); i+=step) {
        const mark = document.createElement('div');
        mark.className = 'ruler-mark';
        mark.style.left = (i * zoom) + 'px';
        if (Number.isInteger(i)) {
            if(i%5===0) {
                 mark.classList.add('major');
                 mark.textContent = i + 's';
            } else {
                 mark.style.height = '30%';
            }
        } else {
            mark.style.height = '15%';
        }
        ruler.appendChild(mark);
    }
    
    // Beat Markers
    state.studioBeats.forEach(beat => {
        const b = document.createElement('div');
        b.style.position = 'absolute';
        b.style.left = (beat * zoom) + 'px';
        b.style.top = '0';
        b.style.height = '100%';
        b.style.width = '1px';
        b.style.background = 'var(--c-lime)';
        b.style.opacity = '0.5';
        b.style.pointerEvents = 'none';
        ruler.appendChild(b);
    });

    ruler.onmousedown = (e) => {
        const rect = ruler.getBoundingClientRect();
        const scrub = (evt) => {
            const x = evt.clientX - rect.left + trackContainer.scrollLeft;
            if(window.Studio && window.Studio.seek) {
                window.Studio.seek(Math.max(0, x / zoom));
            }
        };
        scrub(e);
        window.addEventListener('mousemove', scrub);
        window.addEventListener('mouseup', () => window.removeEventListener('mousemove', scrub), {once:true});
    };

    // 2. Tracks
    trackContainer.innerHTML = '';
    
    // Base Audio Track (Visual Only)
    const audioBlock = [{
        id: 'base-audio', start: 0, end: dur, 
        type: 'audio-base', text: 'AUDIO SOURCE (MAIN)'
    }];
    renderTrackLane(trackContainer, "AUDIO", audioBlock, 'audio-base');

    // Media & Captions
    renderTrackLane(trackContainer, "MEDIA", state.mediaLayers, 'media');
    renderTrackLane(trackContainer, "CAPTIONS", state.captions, 'caption');
}

function renderTrackLane(container, title, items, type) {
    const tr = document.createElement('div');
    tr.className = 'nle-track';
    
    const lbl = document.createElement('div');
    lbl.className = 'track-label';
    lbl.textContent = title;
    tr.appendChild(lbl);
    
    const lane = document.createElement('div');
    lane.className = 'track-lane';
    lane.style.width = (state.studioZoom * (state.pendingSlice?.duration||10)) + 500 + 'px';
    
    items.forEach((item, idx) => {
        const b = document.createElement('div');
        b.className = `nle-block ${type}-block`;
        if (state.selectedClipId === item.id) b.classList.add('selected');
        
        b.style.left = (item.start * state.studioZoom) + 'px';
        b.style.width = ((item.end - item.start) * state.studioZoom) + 'px';
        
        if (type === 'audio-base') {
            b.style.background = 'repeating-linear-gradient(45deg, #111, #111 10px, #222 10px, #222 20px)';
            b.style.border = '1px solid #444';
            b.style.pointerEvents = 'none'; // Read only
            b.innerHTML = `<div class="block-content" style="color:#666;">${item.text}</div>`;
        } else if (type === 'caption') {
            b.innerHTML = `<div class="block-content"><div class="b-txt">${item.text}</div></div>`;
            b.onmousedown = (e) => handleBlockDown(e, type, idx, item);
        } else {
            const bg = item.type === 'glyph' ? '' : `background-image:url(${item.src});`;
            const txt = item.type === 'glyph' ? item.src.toUpperCase() : '';
            b.innerHTML = `<div class="block-img" style="${bg} opacity:${item.opacity}; display:flex; align-items:center; justify-content:center; color:#fff; font-size:10px;">${txt}</div>`;
            b.onmousedown = (e) => handleBlockDown(e, type, idx, item);
        }
        
        lane.appendChild(b);
    });
    
    tr.appendChild(lane);
    container.appendChild(tr);
}

export function updatePropertiesPanel() {
    const p = el('studio-props');
    if(!p) return;
    
    const content = p.querySelector('.prop-content');
    content.innerHTML = '';

    const tabs = document.createElement('div');
    tabs.className = 'prop-tabs';
    tabs.innerHTML = `
        <button class="tab-btn ${state.activeTab==='global'?'active':''}" id="tab-global">GLOBAL</button>
        <button class="tab-btn ${state.activeTab==='clip'?'active':''}" id="tab-clip">CLIP</button>
        <button class="tab-btn ${state.activeTab==='fx'?'active':''}" id="tab-fx">FX</button>
    `;
    content.appendChild(tabs);
    
    el('tab-global').onclick = () => { state.activeTab='global'; updatePropertiesPanel(); };
    el('tab-clip').onclick = () => { state.activeTab='clip'; updatePropertiesPanel(); };
    el('tab-fx').onclick = () => { state.activeTab='fx'; updatePropertiesPanel(); };

    if (state.activeTab === 'global') renderGlobalProps(content);
    else if (state.activeTab === 'fx') renderFXProps(content);
    else renderClipProps(content);
}