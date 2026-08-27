//B"H
// modules/studio/ui/components/blocks.js
import state from '../../../state.js';
import { handleBlockDown } from '../../interaction.js';
import { drawWaveformToCanvas } from '../../../audio-utils.js';

export function createBlock(type, item, idx) {
    const b = document.createElement('div');
    b.className = `nle-block ${type}-block`;
    b.id = `block-${item.id}`; // CRITICAL: Add ID for direct access
    
    if (state.selectedClipId === item.id) b.classList.add('selected');
    
    b.style.left = (item.start * state.studioZoom) + 'px';
    b.style.width = ((item.end - item.start) * state.studioZoom) + 'px';
    
    // Add Trim Handles
    const hLeft = document.createElement('div');
    hLeft.className = 'trim-handle left';
    b.appendChild(hLeft);
    
    const hRight = document.createElement('div');
    hRight.className = 'trim-handle right';
    b.appendChild(hRight);

    if (type === 'audio') {
        buildAudioBlock(b, item);
    } else if (type === 'caption') {
        // Need wrapper to avoid overwriting handles with innerHTML
        const c = document.createElement('div');
        c.className = 'block-content';
        c.innerHTML = `<div class="b-txt">${item.text}</div>`;
        b.appendChild(c);
    } else {
        const bg = item.type === 'glyph' ? '' : `background-image:url(${item.src});`;
        const txt = item.type === 'glyph' ? item.src.toUpperCase() : '';
        const c = document.createElement('div');
        c.className = 'block-img';
        c.style.cssText = `${bg} opacity:${item.opacity}; display:flex; align-items:center; justify-content:center; color:#fff; font-size:10px; width:100%; height:100%; background-size:cover;`;
        c.innerHTML = txt;
        b.appendChild(c);
    }
    
    b.onmousedown = (e) => handleBlockDown(e, type, idx, item);
    b.ontouchstart = (e) => handleBlockDown(e, type, idx, item); // Bind touch
    return b;
}

function buildAudioBlock(b, item) {
    b.style.background = '#002200';
    b.style.border = '1px solid #00ff66';
    
    // WAVEFORM RENDERING
    if (state.sourceAudioBuffer) {
        const cvs = document.createElement('canvas');
        cvs.width = Math.ceil((item.end - item.start) * state.studioZoom);
        cvs.height = 50; 
        cvs.style.width = '100%';
        cvs.style.height = '100%';
        
        setTimeout(() => {
            drawWaveformToCanvas(
                state.sourceAudioBuffer, 
                cvs, 
                item.offset || 0, 
                item.end - item.start,
                '#00ff66'
            );
        }, 0);
        b.appendChild(cvs);
    }
    
    const info = document.createElement('div');
    info.className = 'block-content';
    info.style.position = 'absolute';
    info.style.top = '0';
    info.style.color = '#fff';
    info.style.textShadow = '0 0 2px black';
    info.textContent = item.title || 'AUDIO';
    b.appendChild(info);
}