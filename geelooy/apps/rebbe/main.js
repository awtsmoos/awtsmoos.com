//B"H
// main.js - Core Controller

import { initDB, saveTrack, getTrack, clearAllTracks, YEARS } from './store.js';
import { fetchYearFolders, fetchFolderTracks, fetchBlob } from './network.js';
import * as Render from './render.js';
import * as Audio from './audio.js';
import { initViz, setVisualizerData } from './viz.js';

const state = {
    folders: {}, 
    currentTracks: [],
    trackIndex: -1,
    currentYearId: null
};

async function init() {
    Render.initUI({
        onYearSelect: loadYear,
        onFolderSelect: loadFolder,
        onTrackSelect: playTrack,
        onPlayPause: Audio.togglePlay,
        onNext: nextTrack,
        onPrev: prevTrack,
        onSeek: Audio.seek,
        onDownloadAction: handleDownloadAction,
        onClearDB: handleClearDB,
        checkStatus: async (path) => !!(await getTrack(path)),
        isPlaying: Audio.isPlaying
    });

    Render.log("SYSTEM INITIALIZED // OMEGA PROTOCOL");
    
    try {
        await initDB();
        Render.log("CORE DATABASE MOUNTED");
    } catch(e) {
        Render.log("DB ERROR: PERSISTENCE DISABLED", true);
    }

    initViz(document.getElementById('viz-canvas'));
    
    Audio.setCallbacks({
        onUpdate: (cur, dur) => {
            const t = state.currentTracks[state.trackIndex];
            Render.updatePlayer(t ? t.name : '', cur, dur);
            setVisualizerData(Audio.getFreqData());
        },
        onEnd: nextTrack,
        onError: () => Render.log("AUDIO STREAM ERROR - CHECK NETWORK", true)
    });

    Render.renderYears(YEARS);
}

// --- Navigation ---

async function loadYear(year, id) {
    state.currentYearId = id;
    state.folders = {}; 
    Render.log(`ACCESSING ARCHIVE NODE: ${year}`);
    
    document.getElementById('col-folders').classList.remove('open');
    document.getElementById('col-tracks').classList.remove('open');
    
    try {
        const folderNames = await fetchYearFolders(id, (msg, err) => Render.log(msg, err));
        if (folderNames.length === 0) {
            Render.log("NO DATA VECTORS FOUND", true);
            return;
        }
        folderNames.forEach(name => state.folders[name] = null);
        Render.renderFolders(state.folders);
    } catch(e) {
        Render.log("FATAL: YEAR FETCH FAILED", true);
    }
}

async function loadFolder(name) {
    if (state.folders[name] === null) {
        Render.setTracksLoading(true);
        try {
            const tracks = await fetchFolderTracks(state.currentYearId, name, (msg, err) => Render.log(msg, err));
            state.folders[name] = tracks.sort((a,b) => a.name.localeCompare(b.name));
        } catch (e) {
            Render.log("TRACK DATA CORRUPTED", true);
            Render.setTracksLoading(false);
            return;
        }
    }
    state.currentTracks = state.folders[name];
    state.trackIndex = -1;
    Render.log(`MOUNTED: ${name}`);
    Render.renderTracks(state.currentTracks);
    Render.setTracksLoading(false);
}

// --- Audio ---

async function playTrack(idx) {
    if(idx < 0 || idx >= state.currentTracks.length) return;
    
    state.trackIndex = idx;
    const track = state.currentTracks[idx];
    
    Render.updateActiveTrack(idx);
    Render.log(`BUFFERING: ${track.name}`);
    
    try {
        const localBlob = await getTrack(track.path);
        if(localBlob) {
            Render.log("SOURCE: CORE MEMORY");
            Audio.playBlob(localBlob);
        } else {
            Render.log("SOURCE: NETWORK STREAM");
            Audio.playUrl(track.url);
        }
    } catch (e) {
        Render.log("PLAYBACK FAILURE", true);
    }
}

function nextTrack() {
    if(state.trackIndex < state.currentTracks.length - 1) playTrack(state.trackIndex + 1);
}
function prevTrack() {
    if(state.trackIndex > 0) playTrack(state.trackIndex - 1);
}

// --- Advanced Downloads ---

async function handleDownloadAction(type, target, method) {
    // type: 'track' | 'folder' | 'year'
    // target: index (track) | name (folder) | id (year)
    // method: 'app' | 'disk' | 'zip'

    if (type === 'year' && method === 'zip') {
        const bucketId = target;
        Render.log(`INITIATING ARCHIVE RETRIEVAL: ${bucketId}`);
        // Redirect to Archive.org compress page which allows downloading the zip
        const url = `https://archive.org/compress/${bucketId}`;
        window.open(url, '_blank');
        return;
    }

    if (type === 'track') {
        const track = state.currentTracks[target];
        if (!track) return;
        
        if (method === 'app') {
            await downloadToApp(track);
        } else {
            await downloadToDisk(track);
        }
    } else if (type === 'folder') {
        const name = target;
        // Ensure loaded
        if (state.folders[name] === null) await loadFolder(name);
        
        const tracks = state.folders[name];
        if (!tracks) return;

        Render.log(`BATCH OPERATION: ${tracks.length} ITEMS`);
        
        for (const track of tracks) {
            if (method === 'app') {
                if (await getTrack(track.path)) continue; // Skip existing in App
                await downloadToApp(track);
            } else {
                await downloadToDisk(track);
            }
        }
        Render.log("BATCH OPERATION COMPLETE");
    }
}

async function downloadToApp(track) {
    Render.log(`SYNCING TO CORE: ${track.name}...`);
    try {
        const blob = await fetchBlob(track.url);
        await saveTrack(track.path, blob);
        Render.log(`SYNC COMPLETE: ${track.name}`);
        // Refresh UI
        if(state.currentTracks.includes(track)) Render.renderTracks(state.currentTracks);
    } catch(e) {
        Render.log(`SYNC FAILED: ${track.name}`, true);
    }
}

async function downloadToDisk(track) {
    Render.log(`EXTRACTING: ${track.name}...`);
    try {
        // Smart Check: Check DB first!
        let blob = await getTrack(track.path);
        if (blob) {
            Render.log(`EXTRACTING FROM CORE CACHE...`);
        } else {
            blob = await fetchBlob(track.url);
        }
        
        // Trigger DL
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = track.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        Render.log(`EXTRACTED: ${track.name}`);
    } catch(e) {
        Render.log(`EXTRACTION FAILED: ${track.name}`, true);
    }
}

async function handleClearDB() {
    try {
        await clearAllTracks();
        Render.log("CORE MEMORY PURGED");
        Render.closeModal('modal-settings');
        // Refresh current view
        if(state.currentTracks.length > 0) Render.renderTracks(state.currentTracks);
        if(Object.keys(state.folders).length > 0) Render.renderFolders(state.folders);
    } catch(e) {
        Render.log("PURGE FAILED", true);
    }
}

init();
