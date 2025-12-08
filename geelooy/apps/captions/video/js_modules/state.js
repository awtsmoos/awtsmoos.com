/* B"H */
export const AppState = {
    status: 'IDLE', // IDLE, PREVIEWING, RENDERING
    worker: null,
    db: null,
    
    // Data
    bgBitmap: null,
    portalBitmaps: [],
    audioBuffer: null,
    
    // Output
    videoURL: null,
    dirHandle: null,
    downloadQueue: [],
    isDownloading: false,
    
    // Logic
    previewTimer: null,
    
    // Cache for caption text
    srtText: { main: '', trans: '' }
};