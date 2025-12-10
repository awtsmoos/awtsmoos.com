//B"H
// modules/studio/actions/edit.js
import state from '../../state.js';
import * as History from './history.js';
import * as Transport from './transport.js';

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
             // newItem end remains original end
             newItem.offset = item.offset + offsetDiff; // Shift offset in source
             item.end = t; // Cut original
             
             state.audioLayers.splice(i+1, 0, newItem);
             hit = true;
             if(state.selectedClipId === item.id) break;
        }
    }
    
    // Check Media
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
    
    // Check Captions
    if(!hit) {
        for (let i = 0; i < state.captions.length; i++) {
            const item = state.captions[i];
            if (t > item.start && t < item.end) {
                const newItem = JSON.parse(JSON.stringify(item));
                newItem.id = Date.now() + Math.random();
                newItem.start = t;
                item.end = t;
                state.captions.splice(i + 1, 0, newItem);
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
    } else if (state.selectedType === 'media') {
        state.mediaLayers = state.mediaLayers.filter(i => i.id !== state.selectedClipId);
    } else {
        state.captions = state.captions.filter(i => i.id !== state.selectedClipId);
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
    else if(state.selectedType === 'media') state.mediaLayers.push(copy);
    else state.captions.push(copy);
    
    if(window.Studio) window.Studio.renderTimeline();
}

export function moveLayer(dir) {
    History.saveState();
    if(state.selectedType !== 'media') return;
    const idx = state.mediaLayers.findIndex(i => i.id === state.selectedClipId);
    if(idx === -1) return;
    const item = state.mediaLayers[idx];
    state.mediaLayers.splice(idx, 1);
    if(dir === 'up') state.mediaLayers.splice(Math.min(state.mediaLayers.length, idx+1), 0, item);
    else state.mediaLayers.splice(Math.max(0, idx-1), 0, item);
    
    if(window.Studio) window.Studio.renderTimeline();
}

export function addAudioCut() {
    if(!state.sourceAudioBuffer) return alert("No source audio loaded");
    History.saveState();
    
    const len = 5; // Default 5s cut
    const newLayer = {
        id: Date.now(),
        type: 'audio',
        title: 'NEW CUT',
        start: state.currentTime,
        end: state.currentTime + len,
        offset: 0, // Starts from beginning of source
        vol: 1.0
    };
    state.audioLayers.push(newLayer);
    
    if (window.Studio) {
        window.Studio.renderTimeline();
        window.Studio.updatePropertiesPanel();
    }
}

// Helpers
function getSelected() {
    if (state.selectedType === 'audio') {
         return state.audioLayers.find(i => i.id === state.selectedClipId);
    }
    const list = state.selectedType === 'media' ? state.mediaLayers : state.captions;
    return list.find(i => i.id === state.selectedClipId);
}

// State Updates
export function updateGlobal(k, v) { History.saveState(); state.studioGlobal[k] = v; }
export function updateParticle(k, v) { History.saveState(); state.studioParticleSettings[k] = v; }
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