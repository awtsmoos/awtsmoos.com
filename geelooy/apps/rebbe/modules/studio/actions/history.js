//B"H
// modules/studio/actions/history.js
import state from '../../state.js';
import * as Transport from './transport.js';

// Lower limit for Mobile RAM safety
const HISTORY_LIMIT = 15;

export function saveState() {
    // Remove future history if we are in the middle
    if (state.historyPtr < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyPtr + 1);
    }
    
    // Don't store full Base64 strings in history if possible?
    // For now we just limit the count.
    const snapshot = JSON.stringify({
        mediaLayers: state.mediaLayers,
        audioLayers: state.audioLayers,
        captions: state.captions,
        trackSettings: state.trackSettings,
        fx: state.studioFX,
        global: state.studioGlobal
    });
    
    state.history.push(snapshot);
    if(state.history.length > HISTORY_LIMIT) state.history.shift();
    state.historyPtr = state.history.length - 1;
}

export function undo() {
    if (state.historyPtr > 0) {
        state.historyPtr--;
        restoreState(state.history[state.historyPtr]);
    }
}

export function redo() {
    if (state.historyPtr < state.history.length - 1) {
        state.historyPtr++;
        restoreState(state.history[state.historyPtr]);
    }
}

function restoreState(json) {
    const data = JSON.parse(json);
    state.mediaLayers = data.mediaLayers;
    state.audioLayers = data.audioLayers;
    state.captions = data.captions;
    state.trackSettings = data.trackSettings || state.trackSettings;
    state.studioFX = data.fx || state.studioFX;
    state.studioGlobal = data.global || state.studioGlobal;
    state.selectedClipId = null;
    
    Transport.stopAudio();
    
    // Refresh UI via Global Interface
    if (window.Studio) {
        window.Studio.renderTimeline();
        window.Studio.updatePropertiesPanel();
    }
}