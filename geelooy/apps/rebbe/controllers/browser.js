//B"H
// controllers/browser.js
import state from '../modules/state.js';
import * as Network from '../modules/network.js';
import * as Store from '../modules/store.js';
import * as Render from '../render.js';
import * as Audio from '../audio.js';

let folderMap = {};

export async function handleYearSelect(yid) {
    state.currentYearId = yid;
    Render.log(`ACCESSING YEAR ${yid}...`);
    try {
        const folders = await Network.fetchYear(yid);
        folderMap = folders; 
        Render.renderFolders(folders, handleFolderSelect);
        
        document.getElementById('col-folders').classList.add('open');
        document.getElementById('col-tracks').classList.remove('open');
        updateURL({ year: yid });
    } catch(e) { Render.log("ERROR: " + e.message, true); }
}

export async function handleFolderSelect(fid) {
    const folderName = folderMap[fid]; 
    if(!folderName) return Render.log("INVALID FOLDER ID", true);

    state.currentFolderName = folderName;
    Render.log(`OPENING ${folderName}...`);
    try {
        Render.setTracksLoading(true, state.currentFolderName);
        const tracks = await Network.fetchFolder(state.currentYearId, folderName);
        state.currentTracks = tracks;
        state.folders[fid] = tracks;
        
        Render.renderTracks(
            tracks, 
            state.currentFolderName, 
            Store.isCached, 
            handleTrackSelect, 
            (x, y, t, el) => Render.showContextMenu(x, y, t, el, handleDownloadAction)
        );
        Render.setTracksLoading(false, state.currentFolderName);
        
        document.getElementById('col-tracks').classList.add('open');
        updateURL({ year: state.currentYearId, folder: folderName });
    } catch(e) { Render.log("ERROR: " + e.message, true); }
}

export async function handleTrackSelect(idx) {
    state.trackIndex = idx;
    const track = state.currentTracks[idx];
    if(!track) return;

    Render.log(`LOADING: ${track.title}`);
    Render.updateActiveTrack(idx);
    
    updateURL({ 
        year: state.currentYearId, 
        folder: state.currentFolderName, 
        track: idx 
    });

    // Check Cache
    const cached = await Store.getTrack(track.path);
    if(cached) {
        Render.log("PLAYING FROM LOCAL CACHE");
        Audio.playBlob(cached);
    } else {
        Render.log("STREAMING FROM NETWORK...");
        Audio.playUrl(track.url);
        // Cache in background
        Network.fetchBlob(track.url).then(b => Store.saveTrack(track.path, b)).catch(e=>console.warn("Cache fail", e));
    }
}

export function handleNext() {
    if(state.trackIndex < state.currentTracks.length - 1) {
        handleTrackSelect(state.trackIndex + 1);
    }
}

export function handlePrev() {
    if(state.trackIndex > 0) {
        handleTrackSelect(state.trackIndex - 1);
    }
}

// Helper to expose folderMap if needed for Deep Linking
export function getFolderMap() { return folderMap; }
export function setFolderMap(m) { folderMap = m; }

function updateURL(params) {
    const url = new URL(window.location);
    if(params.year) url.searchParams.set('year', params.year);
    if(params.folder) url.searchParams.set('folder', params.folder);
    if(params.track !== undefined) url.searchParams.set('track', params.track);
    window.history.replaceState({}, '', url);
}

function handleDownloadAction(track) {
    const a = document.createElement('a');
    a.href = track.url;
    a.download = track.title + ".mp3";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}