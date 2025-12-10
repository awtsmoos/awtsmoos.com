//B"H
// main.js - Core Controller (Refactored)
import state from './modules/state.js';
import * as Audio from './audio.js';
import * as Network from './modules/network.js';
import * as Store from './store.js';
import * as Render from './render.js'; 
import * as VideoGen from './modules/video-gen.js';
import * as Browser from './controllers/browser.js';
import { initStudio, closeStudio } from './modules/studio/index.js';
import { initViz } from './viz.js';
import { runBootSequence } from './ui/boot.js';

export async function init() {
    // Run Boot Sequence first
    await runBootSequence();
    
    Render.log("INIT CORE SYSTEM...");
    
    // Initialize Extreme Background Visualizer
    const bgCanvas = document.getElementById('matrix-bg');
    if (bgCanvas) {
        initViz(bgCanvas, () => Audio.getFreqData());
    }

    // Initialize UI Listeners
    Render.initUI({
        onYearSelect: Browser.handleYearSelect,
        onFolderSelect: Browser.handleFolderSelect,
        onTrackSelect: Browser.handleTrackSelect,
        onBack: Browser.handleBack, // Navigation Back Handler
        
        onPlayPause: Audio.togglePlay,
        onNext: Browser.handleNext,
        onPrev: Browser.handlePrev,
        
        // Seek Handlers
        onSeek: Audio.seek,
        onSeekRelative: (amt) => Audio.seek((Audio.audioEl.currentTime + amt)),
        onSeekFraction: (pct) => {
            if(Audio.audioEl && Audio.audioEl.duration) {
                Audio.seek(Audio.audioEl.duration * pct);
            }
        },

        checkStatus: Store.isCached, 
        onDownloadAction: (t) => { /* Handled internally by browser controller now */ },
        onSearch: handleSearch,
        onSearchResultSelect: handleSearchResultSelect,
        onClearDB: handleClearDB,
        onShare: () => {
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
                Render.closeModal('modal-video');
                Render.openModal('modal-studio');
                initStudio();
            });
        },
        onDownloadAudioSlice: (st) => VideoGen.handleDownloadAudioSlice(st),
        onRenderFinal: (st) => VideoGen.renderFinalVideo(st),
        
        onCloseStudio: () => {
            closeStudio();
            Render.closeModal('modal-studio');
        }
    });

    Audio.setCallbacks({
        onUpdate: (cur, dur) => {
            state.currentTime = cur;
            state.currentDuration = dur;
            Render.updatePlayer(state.currentTracks[state.trackIndex]?.title, cur, dur);
        },
        onEnd: Browser.handleNext,
        onError: () => Render.log("AUDIO ERROR", true)
    });

    // Boot Sequence
    try {
        await Store.initDB();
        Render.log("FETCHING INDEX...");
        const years = await Network.fetchIndex();
        Render.renderYears(years, Browser.handleYearSelect);
        Render.log("READY.");

        // --- Deep Linking Logic ---
        const params = new URLSearchParams(window.location.search);
        const yearParam = params.get('year');
        
        if (yearParam) {
            await Browser.handleYearSelect(yearParam);
            
            const folderParam = params.get('folder');
            if (folderParam) {
                // Get folder map from controller state (hacky sync)
                const map = Browser.getFolderMap(); 
                const folderIdx = map.indexOf(folderParam);
                
                if (folderIdx !== -1) {
                    await Browser.handleFolderSelect(folderIdx);
                    
                    const trackParam = params.get('track');
                    if (trackParam) {
                        const trackIdx = parseInt(trackParam);
                        if (!isNaN(trackIdx)) {
                            setTimeout(async () => {
                                await Browser.handleTrackSelect(trackIdx);
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
        console.error(e);
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

async function handleClearDB() {
    await Store.clearAllTracks();
    alert("CACHE CLEARED");
    location.reload();
}

init();