//B"H
// modules/studio/core/lifecycle.js
import { ctx, initAudioContext } from '../context.js';
import state from '../../state.js';
import { renderTimeline, updatePropertiesPanel, bindStudioEvents } from '../ui.js';
import { initParticles } from '../particles.js';
import * as Actions from '../actions.js';
import { loop } from './loop.js';
import { handleStudioKeys } from './input.js';
import { autoSave } from './persistence.js';

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

export function closeStudio() {
    Actions.stopAudio();
    if (ctx.requestID) { cancelAnimationFrame(ctx.requestID); ctx.requestID = null; }
    if(window.studioAutosaveInt) clearInterval(window.studioAutosaveInt);
    document.removeEventListener('keydown', handleStudioKeys);
}