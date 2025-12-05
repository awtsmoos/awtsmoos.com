//B"H
// modules/state.js

const state = {
    folders: {}, 
    currentTracks: [],
    currentFolderName: null,
    trackIndex: -1,
    currentYearId: null,
    currentTime: 0,
    currentDuration: 0,
    
    // Video Gen State
    pendingSlice: null, 
    pendingAudioShim: null,
    pendingCaptions: [], 
    
    // NLE / Studio State
    mediaLayers: [], 
    captions: [],
    studioMode: 'captions',
    studioZoom: 100, 
    studioScrollX: 0,
    studioIsPlaying: false,
    studioStartTime: 0, 
    studioOffsetTime: 0, 
    studioBeats: [], 

    studioGlobal: {
        width: 1080,
        height: 1920,
        bg: '#000000',
        bgPattern: 'none'
    },
    
    // 8 Surprise FX
    studioFX: {
        pump: false,       // 1. Audio Pump
        rgbSplit: false,   // 2. Chromatic Aberration
        mirrorX: false,    // 3. Mirror X
        mirrorY: false,    // 4. Mirror Y
        vhs: false,        // 5. VHS Overlay
        colorCycle: false, // 6. Color Cycle
        jitter: false,     // 7. Camera Shake
        vaporGrid: false   // 8. 3D Grid
    },
    
    studioParticleSettings: {
        color: '#ffffff',
        count: 200,
        reactivity: 1.0,
        mode: 'circle',
        waveIntensity: 50
    },

    // UI State
    selectedClipId: null,
    selectedType: null, 
    activeTab: 'global',

    resolutionSetting: 'portrait',
    modelSetting: 'gemini-2.5-flash'
};

export default state;

export function resetVideoState() {
    state.pendingSlice = null;
    state.pendingAudioShim = null;
    state.pendingCaptions = [];
    state.mediaLayers = [];
    state.captions = [];
    state.studioBeats = [];
    state.studioZoom = 100;
    state.studioScrollX = 0;
    state.studioIsPlaying = false;
    state.studioOffsetTime = 0;
    state.selectedClipId = null;
    state.studioFX = {
        pump: false, rgbSplit: false, mirrorX: false, mirrorY: false,
        vhs: false, colorCycle: false, jitter: false, vaporGrid: false
    };
}