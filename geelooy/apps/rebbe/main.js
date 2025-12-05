//B"H
// main.js - Core Controller
import state from './modules/state.js';
import * as Audio from './audio.js';
import * as Network from './modules/network.js';
import * as Store from './store.js';
import * as Render from './render.js'; 
import * as VideoGen from './modules/video-gen.js';

let folderMap = {}; // Will hold array of folder names

export async function init() {
    Render.log("INIT CORE SYSTEM...");
    
    // Initialize Matrix Background
    try {
        if (Render.initBackgroundEffect) {
            Render.initBackgroundEffect();
        }
    } catch(e) {
        console.warn("Background FX failed", e);
    }

    // Initialize UI Listeners
    Render.initUI({
        onYearSelect: handleYearSelect,
        onFolderSelect: handleFolderSelect,
        onTrackSelect: handleTrackSelect,
        onPlayPause: Audio.togglePlay,
        onNext: handleNext,
        onPrev: handlePrev,
        
        // Seek Handlers
        onSeek: Audio.seek,
        onSeekRelative: (amt) => Audio.seek((Audio.audioEl.currentTime + amt)),
        onSeekFraction: (pct) => {
            if(Audio.audioEl && Audio.audioEl.duration) {
                Audio.seek(Audio.audioEl.duration * pct);
            }
        },

        checkStatus: Store.isCached, // Now exists in Store
        onDownloadAction: handleDownloadAction,
        onSearch: handleSearch,
        onSearchResultSelect: handleSearchResultSelect,
        onClearDB: handleClearDB,
        onShare: () => {
             // URL is already updated by handleTrackSelect
             const url = window.location.href;
             navigator.clipboard.writeText(url).then(()=>alert("LINK COPIED: " + url));
        },
        isPlaying: Audio.isPlaying,
        
        // Video Gen Handlers
        onOpenSliceModal: () => {
             if(Audio.audioEl && Audio.audioEl.duration) {
                 Render.updateVideoModalDefaults(Audio.audioEl.currentTime);
                 Render.openModal('modal-video');
             } else {
                 alert("PLEASE LOAD AUDIO TRACK FIRST");
             }
        },
        onAnalyzeVideo: async (start, dur, res) => {
            const ready = await VideoGen.handleAnalyzeVideo(start, dur, res, state, () => {
                Render.openCaptionEditor();
            });
        },
        onDownloadAudioSlice: (st) => VideoGen.handleDownloadAudioSlice(st),
        onRenderFinal: (st) => VideoGen.renderFinalVideo(st)
    });

    Audio.setCallbacks({
        onUpdate: (cur, dur) => {
            state.currentTime = cur;
            state.currentDuration = dur;
            Render.updatePlayer(state.currentTracks[state.trackIndex]?.title, cur, dur);
        },
        onEnd: handleNext,
        onError: () => Render.log("AUDIO ERROR", true)
    });

    // Boot Sequence
    try {
        await Store.initDB(); // Ensure DB is open
        Render.log("FETCHING INDEX...");
        const years = await Network.fetchIndex();
        Render.renderYears(years);
        Render.log("READY.");

        // --- Deep Linking Logic ---
        const params = new URLSearchParams(window.location.search);
        const yearParam = params.get('year');
        
        if (yearParam) {
            await handleYearSelect(yearParam);
            
            const folderParam = params.get('folder');
            if (folderParam) {
                // Find index of folder name (decoded) in the map
                const folderIdx = folderMap.indexOf(folderParam);
                if (folderIdx !== -1) {
                    await handleFolderSelect(folderIdx);
                    
                    const trackParam = params.get('track');
                    if (trackParam) {
                        const trackIdx = parseInt(trackParam);
                        if (!isNaN(trackIdx)) {
                            // Delay slightly to allow UI to settle
                            setTimeout(async () => {
                                await handleTrackSelect(trackIdx);
                                const timeParam = params.get('time');
                                if (timeParam) {
                                    setTimeout(() => {
                                        if(Audio.audioEl) Audio.seek(parseFloat(timeParam));
                                    }, 500);
                                }
                            }, 100);
                        }
                    }
                } else {
                    Render.log(`FOLDER NOT FOUND: ${folderParam}`, true);
                }
            }
        }

    } catch(e) {
        Render.log("BOOT ERROR: " + e.message, true);
        console.error(e); // Ensure visibility in dev tools
    }
}

// --- Handlers ---

async function handleYearSelect(yid) {
    state.currentYearId = yid;
    Render.log(`ACCESSING YEAR ${yid}...`);
    try {
        // fetchYear returns array of folder names
        const folders = await Network.fetchYear(yid);
        folderMap = folders; // Store array for index lookup
        Render.renderFolders(folders);
        
        document.getElementById('col-folders').classList.add('open');
        document.getElementById('col-tracks').classList.remove('open');
        updateURL({ year: yid });
    } catch(e) { Render.log("ERROR: " + e.message, true); }
}

async function handleFolderSelect(fid) {
    // fid is the INDEX from the view loop
    const folderName = folderMap[fid]; 
    if(!folderName) return Render.log("INVALID FOLDER ID", true);

    state.currentFolderName = folderName;
    Render.log(`OPENING ${folderName}...`);
    try {
        Render.setTracksLoading(true, state.currentFolderName);
        // Pass both YearKey and FolderName to resolve correctly
        const tracks = await Network.fetchFolder(state.currentYearId, folderName);
        state.currentTracks = tracks;
        state.folders[fid] = tracks;
        Render.renderTracks(tracks, state.currentFolderName);
        Render.setTracksLoading(false, state.currentFolderName);
        
        document.getElementById('col-tracks').classList.add('open');
        updateURL({ year: state.currentYearId, folder: folderName });
    } catch(e) { Render.log("ERROR: " + e.message, true); }
}

async function handleTrackSelect(idx) {
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
        // Audio.playUrl handles the actual playback. 
        // Ensure track.url is correct (handled in Network)
        Audio.playUrl(track.url);
        // Cache in background
        Network.fetchBlob(track.url).then(b => Store.saveTrack(track.path, b)).catch(e=>console.warn("Cache fail", e));
    }
}

function updateURL(params) {
    const url = new URL(window.location);
    if(params.year) url.searchParams.set('year', params.year);
    if(params.folder) url.searchParams.set('folder', params.folder);
    if(params.track !== undefined) url.searchParams.set('track', params.track);
    // Don't set time continuously, only on share
    window.history.replaceState({}, '', url);
}

function handleNext() {
    if(state.trackIndex < state.currentTracks.length - 1) {
        handleTrackSelect(state.trackIndex + 1);
    }
}

function handlePrev() {
    if(state.trackIndex > 0) {
        handleTrackSelect(state.trackIndex - 1);
    }
}

async function handleSearch(m, d) {
    Render.log(`SEARCHING ${m}/${d}...`);
    try {
        const res = await Network.search(m, d);
        Render.renderSearchResults(res);
        Render.log(`FOUND ${res.length} ENTRIES`);
    } catch(e) { Render.log("SEARCH FAILED", true); }
}

async function handleSearchResultSelect(path) {
    alert("Deep linking not yet implemented for: " + path);
}

function handleDownloadAction(track) {
    const a = document.createElement('a');
    a.href = track.url;
    a.download = track.title + ".mp3";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function handleClearDB() {
    await Store.clearAllTracks();
    alert("CACHE CLEARED");
    location.reload();
}

// Boot
init();