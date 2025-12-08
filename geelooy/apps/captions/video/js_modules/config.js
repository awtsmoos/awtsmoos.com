/* B"H */

// Safe getter to avoid crashing if an element is missing
const getEl = (id) => {
    const el = document.getElementById(id);
    if (!el) console.warn(`Missing DOM Element: #${id}`);
    return el;
};

export const DOM = {
    // Containers
    controlsWrapper: getEl('controls-wrapper'),
    previewWrapper: getEl('preview-wrapper'),
    previewContainer: getEl('preview-container'),
    renderOverlay: getEl('render-overlay'),
    
    // Inputs - General
    renderMode: getEl('renderMode'),
    frameRate: getEl('frameRate'),
    videoWidth: getEl('videoWidth'),
    videoHeight: getEl('videoHeight'),
    
    // Inputs - Content
    headerText: getEl('headerText'),
    captionSource: getEl('captionSource'),
    mainCaptions: getEl('mainCaptions'),
    translationCaptions: getEl('translationCaptions'),
    dualCaptionToggle: getEl('dualCaptionToggle'),
    dualCaptionContainer: getEl('dual-caption-toggle-container'), // Fixed ref
    srtFile: getEl('srtFile'),
    translationSrtFile: getEl('translationSrtFile'),
    audioFile: getEl('audioFile'),
    
    // Inputs - Visuals
    backgroundImageInput: getEl('backgroundImageInput'),
    portalImagesInput: getEl('portalImages'),
    dynamicBackgroundToggle: getEl('dynamicBackgroundToggle'),
    
    // Inputs - Output
    enableImageDownload: getEl('enableImageDownload'),
    folderControls: getEl('image-download-folder-controls'),
    selectDownloadFolderButton: getEl('selectDownloadFolderButton'),
    folderDisplay: getEl('selectedDownloadFolderDisplay'),
    
    // Buttons
    renderButton: getEl('renderButton'),
    previewButton: getEl('previewButton'),
    cancelButton: getEl('cancelButton'),
    savePresetBtn: getEl('save-preset-btn'),
    deletePresetBtn: getEl('delete-preset-btn'),
    presetSelect: getEl('preset-select'),
    randomizeAllBtn: getEl('randomize-all-btn'),
    mobileCloseBtn: getEl('mobile-close-btn'),
    
    // Visuals
    previewCanvas: getEl('previewCanvas'),
    outputVideo: getEl('outputVideo'),
    status: getEl('status'),
    progressBar: getEl('progressBar'),
    progressContainer: getEl('progressContainer'),
    
    // Logic Containers
    controlsDiv: getEl('controls'),
    simpleControls: getEl('simple-caption-controls'),
    srtControls: getEl('srt-caption-controls')
};

export const CTX = DOM.previewCanvas ? DOM.previewCanvas.getContext('2d') : null;