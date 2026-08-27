//B"H
// modules/studio/core/persistence.js
import state from '../../state.js';

const AUTOSAVE_KEY = 'rebbe_studio_autosave';

export function autoSave() {
    const data = {
        mediaLayers: state.mediaLayers,
        captions: state.captions,
        studioGlobal: state.studioGlobal,
        studioBeats: state.studioBeats,
        studioFX: state.studioFX,
        audioLayers: state.audioLayers,
        trackSettings: state.trackSettings
    };
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
}