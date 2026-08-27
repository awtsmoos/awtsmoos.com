//B"H
// modules/state.js

const state = {
    // Browser State
    folders: {}, 
    currentTracks: [],
    currentFolderName: null,
    trackIndex: -1,
    currentYearId: null,
    currentTime: 0,
    currentDuration: 0,
    
    // Video Gen State
    pendingSlice: null, 
    sourceAudioBuffer: null, 
    pendingAudioShim: null,
    pendingCaptions: [], 
    
    // NLE / Studio State
    mediaLayers: [], // Now contains Images, Videos, AND Effects
    captions: [],
    audioLayers: [], 
    
    // History
    history: [],
    historyPtr: -1,

    // Track Mixer
    trackSettings: {
        audio: { muted: false, solo: false, vol: 1.0 },
        media: { visible: true, locked: false },
        captions: { visible: true, locked: false }
    },

    studioMode: 'captions',
    studioZoom: 100, 
    studioScrollX: 0,
    studioIsPlaying: false,
    studioStartTime: 0, 
    studioOffsetTime: 0, 
    studioBeats: [], 
    
    // Canvas Viewport
    previewViewport: { x: 0, y: 0, scale: 0.8 },

    studioGlobal: {
        width: 1080,
        height: 1920,
        bg: '#000000',
        bgPattern: 'none'
    },
    
    // Global FX (Post-Processing)
    studioFX: {
        pump: false,       
        rgbSplit: false,   
        mirrorX: false,    
        mirrorY: false,    
        vhs: false,        
        colorCycle: false, 
        jitter: false,     
        vaporGrid: false,  
        beatRing: true,    // Kept as global geometry for now, could be layer later
        crt: false         
    },
    
    // UI State
    selectedClipId: null,
    selectedType: null, 
    activeTab: 'global',

    resolutionSetting: 'portrait',
    modelSetting: 'gemini-2.5-flash',
    
    // Project Metadata
    projectId: null,
    projectName: "Untitled Project"
};

export default state;

export function resetVideoState() {
    state.pendingSlice = null;
    state.sourceAudioBuffer = null;
    state.pendingAudioShim = null;
    state.pendingCaptions = [];
    state.mediaLayers = [];
    state.captions = [];
    state.studioBeats = [];
    state.audioLayers = [];
    state.history = [];
    state.historyPtr = -1;
    state.trackSettings = {
        audio: { muted: false, solo: false, vol: 1.0 },
        media: { visible: true, locked: false },
        captions: { visible: true, locked: false }
    };
    state.studioZoom = 100;
    state.studioScrollX = 0;
    state.studioIsPlaying = false;
    state.studioOffsetTime = 0;
    state.selectedClipId = null;
    state.previewViewport = { x: 0, y: 0, scale: 0.8 };
    state.projectId = Date.now();
    state.projectName = "Untitled Project";
}