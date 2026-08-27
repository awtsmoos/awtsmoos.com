//B"H
// modules/studio/ui/components/track.js
import state from '../../../state.js';
import * as Actions from '../../actions.js';
import { createBlock } from './blocks.js';

export function renderTrackLane(container, title, items, type) {
    const tr = document.createElement('div');
    tr.className = 'nle-track';
    
    const lbl = document.createElement('div');
    lbl.className = 'track-label';
    
    const lblTitle = document.createElement('div');
    lblTitle.textContent = title;
    lbl.appendChild(lblTitle);

    renderTrackControls(lbl, type);
    tr.appendChild(lbl);
    
    const lane = document.createElement('div');
    lane.className = 'track-lane';
    
    // Calculate dynamic width based on items
    let maxEnd = 0;
    items.forEach(i => { if(i.end > maxEnd) maxEnd = i.end; });
    const dynamicW = Math.max((state.studioZoom * maxEnd) + 500, container.clientWidth);
    lane.style.width = dynamicW + 'px';
    
    // Render Blocks
    items.forEach((item, idx) => {
        const blk = createBlock(type, item, idx);
        lane.appendChild(blk);
    });
    
    tr.appendChild(lane);
    container.appendChild(tr);
}

function renderTrackControls(lbl, type) {
    const ctrls = document.createElement('div');
    ctrls.style.display = 'flex';
    ctrls.style.gap = '2px';
    ctrls.style.marginTop = '4px';

    if (type === 'audio') {
        // Mute Button
        const btnMute = document.createElement('button');
        const isMuted = state.trackSettings.audio.muted;
        btnMute.className = 'btn-tool';
        btnMute.style.cssText = `font-size:9px; padding:2px 4px; ${isMuted ? 'background:red; color:white;' : ''}`;
        btnMute.textContent = "M";
        btnMute.title = "Mute Track";
        btnMute.onclick = (e) => { e.stopPropagation(); Actions.toggleTrackMute('audio'); };
        ctrls.appendChild(btnMute);

        // Volume Slider
        const volSlider = document.createElement('input');
        volSlider.type = "range";
        volSlider.min = 0; volSlider.max = 1; volSlider.step = 0.1;
        volSlider.value = state.trackSettings.audio.vol !== undefined ? state.trackSettings.audio.vol : 1.0;
        volSlider.style.width = '50px';
        volSlider.style.height = '6px';
        volSlider.title = "Track Volume";
        volSlider.oninput = (e) => { 
            e.stopPropagation(); 
            Actions.updateTrackVolume('audio', parseFloat(e.target.value)); 
        };
        volSlider.onmousedown = (e) => e.stopPropagation();
        ctrls.appendChild(volSlider);

        const btnAdd = document.createElement('button');
        btnAdd.innerHTML = '+ CUT';
        btnAdd.className = 'btn-tool';
        btnAdd.style.cssText = "font-size:8px; padding:2px; background:var(--c-cyan); color:black; margin-left:2px;";
        btnAdd.onclick = (e) => { e.stopPropagation(); Actions.addAudioCut(); };
        ctrls.appendChild(btnAdd);
    }
    lbl.appendChild(ctrls);
}