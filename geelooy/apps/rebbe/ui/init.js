//B"H
// ui/init.js
import { openModal, closeModal, updateVideoModalDefaults } from './modals.js';
import { updatePlayIcon } from './player.js';

export function initUI(cb) {
    console.log("VIEW: Initializing UI...");
    
    // -- Player Controls --
    const btnPlay = document.getElementById('btn-play');
    if (btnPlay) {
        btnPlay.onclick = (e) => {
            e.stopPropagation();
            cb.onPlayPause();
            updatePlayIcon(cb.isPlaying());
        };
    }

    const btnNext = document.getElementById('btn-next');
    if (btnNext) btnNext.onclick = cb.onNext;

    const btnPrev = document.getElementById('btn-prev');
    if (btnPrev) btnPrev.onclick = cb.onPrev;

    // SCISSORS / STUDIO BTN
    const btnSlice = document.getElementById('btn-slice');
    if (btnSlice) {
        btnSlice.onclick = (e) => {
            e.stopPropagation();
            if(cb.onOpenSliceModal) cb.onOpenSliceModal();
        };
    }

    // Seeker
    const fill = document.getElementById('player-fill');
    if (fill && fill.parentElement) {
        fill.parentElement.onclick = (e) => {
            const rect = fill.parentElement.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            if (cb.onSeekFraction) cb.onSeekFraction(pct);
        };
    }

    // -- Header Tools --
    const btnSearch = document.getElementById('btn-search');
    if (btnSearch) {
        btnSearch.onclick = () => {
            openModal('modal-search');
            setTimeout(() => document.getElementById('inp-search').focus(), 100);
        };
    }
    
    const inpSearch = document.getElementById('inp-search');
    if (inpSearch) {
        inpSearch.onkeydown = (e) => { 
            if (e.key === 'Enter') cb.onSearch(inpSearch.value); 
        };
    }

    // SHARE
    const btnShare = document.getElementById('btn-share');
    if (btnShare) btnShare.onclick = cb.onShare;

    // SETTINGS
    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings) {
        btnSettings.onclick = () => openModal('modal-settings');
    }

    const btnActionClear = document.getElementById('btn-action-clear');
    if (btnActionClear) {
        btnActionClear.onclick = () => {
             if(confirm("DELETE ALL CACHED AUDIO?")) {
                 cb.onClearDB();
             }
        };
    }
    
    // Video Modal Buttons
    const btnGenAnalyze = document.getElementById('btn-generate-analyze');
    if (btnGenAnalyze) {
        btnGenAnalyze.onclick = () => {
            const start = parseFloat(document.getElementById('vid-start').value || 0);
            const dur = parseFloat(document.getElementById('vid-duration').value || 15);
            const res = document.getElementById('vid-res').value;
            cb.onAnalyzeVideo(start, dur, res);
        };
    }

    const btnDownloadSlice = document.getElementById('btn-download-audio');
    if (btnDownloadSlice) {
        btnDownloadSlice.onclick = () => {
             cb.onDownloadAudioSlice(window.state); 
        };
    }

    const btnCloseStudio = document.getElementById('btn-close-studio');
    if (btnCloseStudio) {
        btnCloseStudio.onclick = () => {
            if(cb.onCloseStudio) cb.onCloseStudio();
        };
    }

    // Modal Close Logic
    document.querySelectorAll('.modal-close').forEach(b => {
        b.onclick = () => {
            document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
            document.getElementById('overlay-layer').classList.add('hidden');
        };
    });

    const overlay = document.getElementById('overlay-layer');
    if(overlay) {
        overlay.onclick = (e) => {
            if(e.target === overlay) {
                document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
                overlay.classList.add('hidden');
            }
        };
    }
}