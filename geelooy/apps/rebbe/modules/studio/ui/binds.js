//B"H
// modules/studio/ui/binds.js
import * as Actions from '../actions.js';
import * as VideoGen from '../../video-gen.js';
import state from '../../state.js';

const el = (id) => document.getElementById(id);

export function bindStudioEvents() {
    // Playback
    el('st-play').onclick = () => Actions.togglePlay();
    el('st-stop').onclick = () => Actions.stopAudio();
    
    // Tools
    el('st-split').onclick = () => Actions.splitClip();
    el('st-zoom').oninput = (e) => Actions.setZoom(e.target.value);
    
    // AI & Upload
    el('st-detect-beats').onclick = () => Actions.detectBeats();
    el('st-gen-caps').onclick = () => Actions.handleGenCaps();
    el('st-gen-img').onclick = () => Actions.handleGenImage();
    el('st-upload').onchange = (e) => Actions.handleUpload(e);
    
    // Export
    el('st-export').onclick = () => VideoGen.renderFinalVideo(state);
}