/* B"H */
import { DOM, CTX } from './config.js';

export function setStatus(msg, type = '') {
    if (DOM.status) {
        DOM.status.textContent = msg;
        DOM.status.className = type;
    }
}

export function toggleClass(el, className, force) {
    if (el) el.classList.toggle(className, force);
}

export function updateUI(state) {
    const isIdle = state.status === 'IDLE';
    const isVideo = DOM.renderMode ? DOM.renderMode.value === 'video' : true;
    const isSrt = DOM.captionSource ? DOM.captionSource.value === 'srt' : false;
    const isDl = DOM.enableImageDownload ? DOM.enableImageDownload.checked : false;

    // Main States
    toggleClass(DOM.controlsWrapper, 'rendering', !isIdle);
    if(DOM.renderButton) DOM.renderButton.disabled = !isIdle;
    if(DOM.previewButton) DOM.previewButton.disabled = !isIdle;

    // Visibility Toggles
    // Safe-checked via toggleClass helper
    toggleClass(document.getElementById('timing-controls'), 'hidden-control', !isVideo);
    toggleClass(DOM.dualCaptionContainer, 'hidden-control', !isVideo);
    toggleClass(DOM.folderControls, 'hidden-control', !isDl);
    
    toggleClass(DOM.simpleControls, 'hidden-control', isSrt);
    toggleClass(DOM.srtControls, 'hidden-control', !isSrt);
}

export function showMobilePreview() {
    if (DOM.previewWrapper) DOM.previewWrapper.classList.add('mobile-visible');
}

export function hideMobilePreview() {
    if (DOM.previewWrapper) DOM.previewWrapper.classList.remove('mobile-visible');
    if (DOM.outputVideo) DOM.outputVideo.pause();
}

export function switchVisuals(mode) {
    if (!DOM.previewCanvas || !DOM.outputVideo) return;
    
    if (mode === 'canvas') {
        DOM.previewCanvas.classList.remove('hidden');
        DOM.outputVideo.classList.add('hidden');
    } else {
        DOM.previewCanvas.classList.add('hidden');
        DOM.outputVideo.classList.remove('hidden');
    }
}