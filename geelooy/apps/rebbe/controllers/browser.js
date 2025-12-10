//B"H
// controllers/browser.js
import state from '../modules/state.js';
import * as Network from '../modules/network.js';
import * as Store from '../modules/store.js';
import * as Render from '../render.js';
import * as Audio from '../audio.js';

let folderMap = {};

// Mobile Navigation Logic
function openColumn(colId) {
    if (window.innerWidth <= 768) {
        // Hide all first
        document.querySelectorAll('.col').forEach(c => c.classList.remove('open'));
    }
    const target = document.getElementById(colId);
    if(target) target.classList.add('open');
}

export function handleBack() {
    // Determine where we are
    const tracksOpen = document.getElementById('col-tracks').classList.contains('open');
    const foldersOpen = document.getElementById('col-folders').classList.contains('open');
    
    if (tracksOpen) {
        openColumn('col-folders');
    } else if (foldersOpen) {
        openColumn('col-years');
    }
}

export async function handleYearSelect(yid) {
    state.currentYearId = yid;
    Render.log(`ACCESSING YEAR ${yid}...`);
    try {
        const folders = await Network.fetchYear(yid);
        folderMap = folders; 
        Render.renderFolders(folders, handleFolderSelect);
        
        openColumn('col-folders'); // Switch view
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
            handleTrackAction // Context/Button action
        );
        Render.setTracksLoading(false, state.currentFolderName);
        
        openColumn('col-tracks'); // Switch view
        updateURL({ year: state.currentYearId, folder: folderName });
    } catch(e) { Render.log("ERROR: " + e.message, true); }
}

export async function handleTrackSelect(idx) {
    if (idx < 0 || idx >= state.currentTracks.length) return;

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
        // Cache in background logic moved to explicit user action to save data/bandwidth
        // or keep auto-cache if preferred. For now, we only play.
    }
}

// Unified action handler
export async function handleTrackAction(action, track) {
    if (action === 'download') {
         const a = document.createElement('a');
         a.href = track.url;
         a.download = track.title + ".mp3";
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         Render.log(`DOWNLOADING ${track.title}...`);
    } 
    else if (action === 'cache') {
         Render.log(`CACHING ${track.title}...`);
         try {
             const blob = await Network.fetchBlob(track.url);
             await Store.saveTrack(track.path, blob);
             Render.log("CACHED OK");
             // Refresh list to show cached status
             Render.renderTracks(state.currentTracks, state.currentFolderName, Store.isCached, handleTrackSelect, handleTrackAction);
         } catch(e) {
             Render.log("CACHE FAILED", true);
         }
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

export function getFolderMap() { return folderMap; }
export function setFolderMap(m) { folderMap = m; }

function updateURL(params) {
    const url = new URL(window.location);
    if(params.year) url.searchParams.set('year', params.year);
    if(params.folder) url.searchParams.set('folder', params.folder);
    if(params.track !== undefined) url.searchParams.set('track', params.track);
    window.history.replaceState({}, '', url);
}