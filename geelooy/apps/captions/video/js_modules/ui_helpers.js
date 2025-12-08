/*
ב"ה
B"H
*/

// --- DOM Cache ---
export const dom = {
    controlsWrapper: document.getElementById('controls-wrapper'),
    renderButton: document.getElementById('renderButton'),
    previewButton: document.getElementById('previewButton'),
    cancelButton: document.getElementById('cancelButton'),
    previewCanvas: document.getElementById('previewCanvas'),
    outputVideo: document.getElementById('outputVideo'),
    status: document.getElementById('status'),
    progressContainer: document.getElementById('progressContainer'),
    progressBar: document.getElementById('progressBar'),
    renderMode: document.getElementById('renderMode'),
    timingControls: document.getElementById('timing-controls'),
    captionSource: document.getElementById('captionSource'),
    mainCaptions: document.getElementById('mainCaptions'),
    translationCaptions: document.getElementById('translationCaptions'),
    presetSelect: document.getElementById('preset-select'),
    savePresetBtn: document.getElementById('save-preset-btn'),
    deletePresetBtn: document.getElementById('delete-preset-btn'),
    randomizeAllBtn: document.getElementById('randomize-all-btn'),
    dynamicBackgroundToggle: document.getElementById('dynamicBackgroundToggle'),
    fpsControls: document.getElementById('fps-controls'),
    
    // Resolution & FPS (Previously Missing)
    videoWidth: document.getElementById('videoWidth'),
    videoHeight: document.getElementById('videoHeight'),
    frameRate: document.getElementById('frameRate'),
    
    // Caption Files (Previously Missing)
    srtFile: document.getElementById('srtFile'),
    translationSrtFile: document.getElementById('translationSrtFile'),
    
    // Feature Inputs
    enableImageDownload: document.getElementById('enableImageDownload'),
    imageDownloadFolderControls: document.getElementById('image-download-folder-controls'),
    selectDownloadFolderButton: document.getElementById('selectDownloadFolderButton'),
    selectedDownloadFolderDisplay: document.getElementById('selectedDownloadFolderDisplay'),
    backgroundImageInput: document.getElementById('backgroundImageInput'),
    portalImagesInput: document.getElementById('portalImages')
};

export const pCtx = dom.previewCanvas.getContext('2d');

export function setStatus(message, type = '') {
    dom.status.textContent = message;
    dom.status.className = type;
}

export function updateUIState(appState) {
    const isIdle = appState.appStatus === 'IDLE';
    dom.controlsWrapper.classList.toggle('rendering', !isIdle);
    
    // Disable main buttons if not idle
    dom.renderButton.disabled = !isIdle;
    dom.previewButton.disabled = !isIdle;
    
    const isVideo = dom.renderMode.value === 'video';
    
    // Toggle Visibility
    dom.timingControls.classList.toggle('hidden-control', !isVideo);
    document.getElementById('dual-caption-toggle-container').classList.toggle('hidden-control', !isVideo);
    dom.imageDownloadFolderControls.classList.toggle('hidden-control', !dom.enableImageDownload.checked);

    // Update specific text input placeholders based on source
    const isSrt = dom.captionSource.value === 'srt';
    document.getElementById('simple-caption-controls').classList.toggle('hidden-control', isSrt);
    document.getElementById('srt-caption-controls').classList.toggle('hidden-control', !isSrt);
}