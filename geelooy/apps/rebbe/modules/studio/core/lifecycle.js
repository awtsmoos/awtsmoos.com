//B"H
// modules/studio/core/lifecycle.js
import { ctx, initAudioContext, clearMediaCache } from '../context.js';
import state from '../../state.js';
import { renderTimeline, updatePropertiesPanel, bindStudioEvents, initResizer } from '../ui.js';
import { initParticles } from '../particles.js';
import * as Actions from '../actions.js';
import { loop } from './loop.js';
import { handleStudioKeys } from './input.js';
import { autoSave } from './persistence.js';
import { preAnalyzeAudio } from './audio-analysis.js';
import * as Audio from '../../../audio.js'; 
import { pauseBackground, resumeBackground } from '../../../ui/background.js';
import { pauseViz, resumeViz } from '../../../viz.js';

export function initStudio() {
    // 0. PERFORMANCE: Pause main app visualizations
    pauseBackground();
    pauseViz();

    // 1. Pause Main App Audio
    if(Audio.isPlaying()) {
        Audio.togglePlay();
    }

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

    // Run Audio Pre-Analysis for Scrubbing Visuals if buffer exists
    if (state.sourceAudioBuffer) {
        preAnalyzeAudio(state.sourceAudioBuffer);
    } else {
        ctx.analysisData = [];
    }

    // --- RESTORE DEFAULT PARTICLES ---
    const hasEffects = state.mediaLayers.some(l => l.type === 'effect');
    if (!hasEffects) {
        state.mediaLayers.push({
            id: Date.now(),
            type: 'effect',
            effectType: 'particles',
            start: 0,
            end: 300, 
            opacity: 1.0,
            config: {
                mode: 'float', count: 200, colorMode: 'rainbow', reactivity: 1.0, sizeBase: 20
            }
        });
    }

    initParticles(canvas.width, canvas.height);
    
    bindStudioEvents();
    renderTimeline();
    updatePropertiesPanel();
    initResizer(); 

    document.addEventListener('keydown', handleStudioKeys);

    if (!ctx.requestID) loop();
    
    if(window.studioAutosaveInt) clearInterval(window.studioAutosaveInt);
    window.studioAutosaveInt = setInterval(autoSave, 5000);

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
    
    // MEMORY CLEANUP
    clearMediaCache();
    
    // RESUME BACKGROUNDS
    resumeBackground();
    resumeViz();
}