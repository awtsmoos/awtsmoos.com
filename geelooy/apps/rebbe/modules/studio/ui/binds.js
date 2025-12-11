//B"H
// modules/studio/ui/binds.js
import * as Actions from '../actions.js';
import * as VideoGen from '../../video-gen.js';
import state from '../../state.js';
import { initPreviewControls } from '../core/preview-interaction.js';

const el = (id) => document.getElementById(id);

export function bindStudioEvents() {
    // Playback
    if(el('st-play')) el('st-play').onclick = () => Actions.togglePlay();
    if(el('st-stop')) el('st-stop').onclick = () => Actions.stopAudio();
    
    // Tools
    if(el('st-split')) el('st-split').onclick = () => Actions.splitClip();
    if(el('st-delete')) el('st-delete').onclick = () => Actions.deleteSelected();

    // Zoom
    const zoomSlider = el('st-zoom');
    if(zoomSlider) {
        zoomSlider.oninput = (e) => Actions.setZoom(e.target.value);
    }
    
    // AI & Upload
    if(el('st-detect-beats')) el('st-detect-beats').onclick = () => Actions.detectBeats();
    if(el('st-gen-caps')) el('st-gen-caps').onclick = () => Actions.handleGenCaps();
    if(el('st-gen-img')) el('st-gen-img').onclick = () => Actions.handleGenImage();
    if(el('st-upload')) el('st-upload').onchange = (e) => Actions.handleUpload(e);
    
    // Export
    if(el('st-export')) el('st-export').onclick = () => VideoGen.renderFinalVideo(state);

    // Minimize / Restore
    if(el('btn-minimize')) el('btn-minimize').onclick = () => Actions.minimizeStudio();
    if(el('studio-fab')) el('studio-fab').onclick = () => Actions.restoreStudio();

    // Mobile Props Toggle
    if(el('btn-toggle-props')) {
        el('btn-toggle-props').onclick = () => {
            const p = document.getElementById('studio-props');
            if(p) p.classList.add('open');
        };
    }

    // Preview Canvas Pan/Zoom
    const wrap = el('studio-preview-wrapper');
    const canvas = el('studio-preview-canvas');
    if(wrap && canvas) {
        initPreviewControls(wrap, canvas);
    }
}