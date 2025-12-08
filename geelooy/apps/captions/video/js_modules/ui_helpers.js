/*
ב"ה
B"H
*/

export const dom = {
    // ... (Keep all existing DOM references)
    controlsWrapper: document.getElementById('controls-wrapper'),
    renderButton: document.getElementById('renderButton'),
    previewButton: document.getElementById('previewButton'),
    cancelButton: document.getElementById('cancelButton'),
    
    previewWrapper: document.getElementById('preview-wrapper'), // NEW
    mobileCloseBtn: document.getElementById('mobile-close-btn'), // NEW
    
    previewCanvas: document.getElementById('previewCanvas'),
    outputVideo: document.getElementById('outputVideo'),
    // ... (Keep existing references)
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
    videoWidth: document.getElementById('videoWidth'),
    videoHeight: document.getElementById('videoHeight'),
    frameRate: document.getElementById('frameRate'),
    srtFile: document.getElementById('srtFile'),
    translationSrtFile: document.getElementById('translationSrtFile'),
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

// NEW: Handle Visual State Logic
export function showPreviewPanel() {
    // On desktop, this does nothing (already visible)
    // On mobile, this adds class to slide up
    dom.previewWrapper.classList.add('mobile-visible');
}

export function hidePreviewPanel() {
    dom.previewWrapper.classList.remove('mobile-visible');
    // Pause video if playing to save resources
    if (!dom.outputVideo.paused) dom.outputVideo.pause();
}

export function showCanvas() {
    dom.previewCanvas.classList.remove('hidden');
    dom.outputVideo.classList.add('hidden');
}

export function showVideo() {
    dom.previewCanvas.classList.add('hidden');
    dom.outputVideo.classList.remove('hidden');
}

export function updateUIState(appState) {
    const isIdle = appState.appStatus === 'IDLE';
    dom.controlsWrapper.classList.toggle('rendering', !isIdle);
    
    dom.renderButton.disabled = !isIdle;
    dom.previewButton.disabled = !isIdle;
    
    const isVideo = dom.renderMode.value === 'video';
    
    dom.timingControls.classList.toggle('hidden-control', !isVideo);
    document.getElementById('dual-caption-toggle-container').classList.toggle('hidden-control', !isVideo);
    dom.imageDownloadFolderControls.classList.toggle('hidden-control', !dom.enableImageDownload.checked);

    const isSrt = dom.captionSource.value === 'srt';
    document.getElementById('simple-caption-controls').classList.toggle('hidden-control', isSrt);
    document.getElementById('srt-caption-controls').classList.toggle('hidden-control', !isSrt);
}