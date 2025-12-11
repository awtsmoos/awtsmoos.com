//B"H
// modules/studio/actions/edit.js
import state from '../../state.js';
import * as History from './history.js';
import * as Transport from './transport.js';
import { initParticles } from '../particles.js';

export function splitClip() {
    History.saveState();
    const t = state.currentTime;
    let hit = false;
    
    // Audio Split
    for (let i=0; i<state.audioLayers.length; i++) {
        const item = state.audioLayers[i];
        if (t > item.start && t < item.end) {
             const offsetDiff = t - item.start;
             const newItem = JSON.parse(JSON.stringify(item));
             newItem.id = Date.now() + Math.random();
             newItem.start = t;
             newItem.offset = item.offset + offsetDiff; 
             item.end = t; 
             
             state.audioLayers.splice(i+1, 0, newItem);
             hit = true;
             if(state.selectedClipId === item.id) break;
        }
    }
    
    // Check Media & Effects
    if(!hit) {
        for (let i = 0; i < state.mediaLayers.length; i++) {
            const item = state.mediaLayers[i];
            if (t > item.start && t < item.end) {
                const newItem = JSON.parse(JSON.stringify(item));
                newItem.id = Date.now() + Math.random();
                newItem.start = t;
                item.end = t;
                state.mediaLayers.splice(i + 1, 0, newItem);
                hit = true;
                if (state.selectedClipId === item.id) break;
            }
        }
    }
    
    if (hit && window.Studio) window.Studio.renderTimeline();
}

export function deleteSelected() {
    History.saveState();
    if (state.selectedType === 'audio') {
        state.audioLayers = state.audioLayers.filter(i => i.id !== state.selectedClipId);
    } else if (state.selectedType === 'caption') {
        state.captions = state.captions.filter(i => i.id !== state.selectedClipId);
    } else {
        // Media or Effects
        state.mediaLayers = state.mediaLayers.filter(i => i.id !== state.selectedClipId);
    }
    state.selectedClipId = null;
    
    if (window.Studio) {
        window.Studio.renderTimeline();
        window.Studio.updatePropertiesPanel();
    }
}

export function duplicateSelected() {
    History.saveState();
    const item = getSelected();
    if(!item) return;
    const copy = JSON.parse(JSON.stringify(item));
    copy.id = Date.now() + Math.random();
    copy.start += 1.0; 
    copy.end += 1.0;
    
    if(state.selectedType === 'audio') state.audioLayers.push(copy);
    else if(state.selectedType === 'caption') state.captions.push(copy);
    else state.mediaLayers.push(copy);
    
    if(window.Studio) window.Studio.renderTimeline();
}

export function moveLayer(dir) {
    History.saveState();
    // Allow for effects too
    if(state.selectedType === 'audio' || state.selectedType === 'caption') return;
    
    const idx = state.mediaLayers.findIndex(i => i.id === state.selectedClipId);
    if(idx === -1) return;
    const item = state.mediaLayers[idx];
    state.mediaLayers.splice(idx, 1);
    if(dir === 'up') state.mediaLayers.splice(Math.min(state.mediaLayers.length, idx+1), 0, item);
    else state.mediaLayers.splice(Math.max(0, idx-1), 0, item);
    
    if(window.Studio) window.Studio.renderTimeline();
}

export function addAudioCut() {
    // If no buffer, allow adding a placeholder or trigger import
    if(!state.sourceAudioBuffer) {
        document.getElementById('st-upload').click(); 
        return; 
    }
    History.saveState();
    
    const len = 5; 
    const newLayer = {
        id: Date.now(), type: 'audio', title: 'NEW CUT',
        start: state.currentTime, end: state.currentTime + len,
        offset: 0, vol: 1.0
    };
    state.audioLayers.push(newLayer);
    if (window.Studio) { window.Studio.renderTimeline(); window.Studio.updatePropertiesPanel(); }
}

export function addEffectLayer(type) {
    History.saveState();
    state.mediaLayers.push({
        id: Date.now(),
        type: 'effect',
        effectType: type, // 'particles'
        start: state.currentTime,
        end: state.currentTime + 5,
        opacity: 1.0,
        config: {
            mode: 'float', count: 200, colorMode: 'rainbow', reactivity: 1.0, sizeBase: 20
        }
    });
    if (window.Studio) window.Studio.renderTimeline();
}

export function setResolution(res) {
    History.saveState();
    state.resolutionSetting = res;
    let w = 1080, h = 1920;
    if(res === 'landscape') { w = 1920; h = 1080; }
    if(res === 'square') { w = 1080; h = 1080; }
    state.studioGlobal.width = w;
    state.studioGlobal.height = h;
    
    const c = document.getElementById('studio-preview-canvas');
    if(c) {
        c.width = w; c.height = h;
        initParticles(w, h);
    }
}

// Helpers
function getSelected() {
    if (state.selectedType === 'audio') return state.audioLayers.find(i => i.id === state.selectedClipId);
    if (state.selectedType === 'caption') return state.captions.find(i => i.id === state.selectedClipId);
    return state.mediaLayers.find(i => i.id === state.selectedClipId);
}

// State Updates
export function updateGlobal(k, v) { History.saveState(); state.studioGlobal[k] = v; }
export function updateFX(k, v) { History.saveState(); state.studioFX[k] = v; }

export function updateClip(k, v) {
    History.saveState();
    const item = getSelected();
    if (item) { item[k] = v; if(window.Studio) window.Studio.renderTimeline(); }
}

export function updateClipDuration(d) {
    History.saveState();
    const item = getSelected();
    if (item) { item.end = item.start + d; if(window.Studio) window.Studio.renderTimeline(); }
}

export function updateClipStyle(k, v) {
    History.saveState();
    const item = getSelected();
    if (item) {
        if (!item.style) item.style = {};
        item.style[k] = v;
    }
}

export function toggleTrackMute(track) {
    History.saveState();
    if(state.trackSettings[track]) {
        state.trackSettings[track].muted = !state.trackSettings[track].muted;
        if(state.studioIsPlaying) { Transport.stopAudio(); Transport.startAudio(); }
        if(window.Studio) window.Studio.renderTimeline();
    }
}

export function updateTrackVolume(track, vol) {
    if(state.trackSettings[track]) {
        state.trackSettings[track].vol = vol;
        if(state.studioIsPlaying) { Transport.stopAudio(); Transport.startAudio(); }
    }
}