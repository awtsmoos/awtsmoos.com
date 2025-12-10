//B"H
// modules/studio/index.js
import { ctx, initAudioContext } from './context.js';
import state from '../state.js';
import { drawFrame } from './render.js';
import { renderTimeline, updatePropertiesPanel, bindStudioEvents } from './ui.js';
import { initParticles } from './particles.js';
import * as Actions from './actions.js';

const AUTOSAVE_KEY = 'rebbe_studio_autosave';

export function initStudio() {
    initAudioContext();
    const canvas = document.getElementById('studio-preview-canvas');
    if (!canvas) return;
    
    ctx.canvas = canvas;
    ctx.g = canvas.getContext('2d');

    if(!state.studioGlobal) state.studioGlobal = { width: 1080, height: 1920, bg: '#000000' };
    if(!state.studioFX) state.studioFX = {};

    const isPortrait = state.resolutionSetting === 'portrait';
    state.studioGlobal.width = isPortrait ? 1080 : 1920;
    state.studioGlobal.height = isPortrait ? 1920 : 1080;
    if(state.resolutionSetting === 'square') {
        state.studioGlobal.width = 1080;
        state.studioGlobal.height = 1080;
    }

    canvas.width = state.studioGlobal.width;
    canvas.height = state.studioGlobal.height;

    initParticles(canvas.width, canvas.height);
    
    // Bind UI interactions
    bindStudioEvents();
    renderTimeline();
    updatePropertiesPanel();

    // Keyboard Shortcuts
    document.addEventListener('keydown', handleStudioKeys);

    if (!ctx.requestID) loop();
    
    if(window.studioAutosaveInt) clearInterval(window.studioAutosaveInt);
    window.studioAutosaveInt = setInterval(autoSave, 5000);

    // Expose Actions AND UI functions to Window to break circular deps
    window.Studio = { 
        ...Actions,
        renderTimeline,
        updatePropertiesPanel
    };
}

function handleStudioKeys(e) {
    if (document.getElementById('modal-studio').classList.contains('hidden')) return;
    
    // Ignore if typing in an input
    if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.code === 'Space') {
        e.preventDefault();
        Actions.togglePlay();
    } else if (e.code === 'Delete' || e.code === 'Backspace') {
        Actions.deleteSelected();
    } else if (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'c') {
        // Razor / Split
        Actions.splitClip();
    } else if (e.code === 'ArrowLeft') {
        Actions.seek(state.currentTime - 0.1);
    } else if (e.code === 'ArrowRight') {
        Actions.seek(state.currentTime + 0.1);
    }
}

function autoSave() {
    const data = {
        mediaLayers: state.mediaLayers,
        captions: state.captions,
        studioGlobal: state.studioGlobal,
        studioBeats: state.studioBeats,
        studioFX: state.studioFX
    };
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
}

export function closeStudio() {
    Actions.stopAudio();
    if (ctx.requestID) { cancelAnimationFrame(ctx.requestID); ctx.requestID = null; }
    if(window.studioAutosaveInt) clearInterval(window.studioAutosaveInt);
    document.removeEventListener('keydown', handleStudioKeys);
}

function loop() {
    const canvas = document.getElementById('studio-preview-canvas');
    if (!canvas) {
        ctx.requestID = null;
        return;
    }
    
    const modal = document.getElementById('modal-studio');
    if (modal && modal.classList.contains('hidden')) {
        ctx.requestID = null;
        return; 
    }

    if (state.studioIsPlaying && ctx.audio) {
        state.currentTime = state.studioOffsetTime + (ctx.audio.currentTime - state.studioStartTime);
        if (state.currentTime >= (state.pendingSlice?.duration || 10)) {
            Actions.stopAudio();
            state.currentTime = 0;
        }
    }

    drawFrame();
    updatePlayhead();
    
    const stat = document.getElementById('studio-status');
    if (stat) stat.textContent = `T: ${state.currentTime.toFixed(2)}`;

    ctx.requestID = requestAnimationFrame(loop);
}

function updatePlayhead() {
    const p = document.getElementById('timeline-playhead');
    const c = document.getElementById('timeline-tracks');
    if (p && c) {
        const x = state.currentTime * state.studioZoom;
        const scroll = c.scrollLeft;
        p.style.left = (120 + x - scroll) + 'px';
    }
}