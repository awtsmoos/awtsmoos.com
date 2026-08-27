//B"H
// modules/video-gen.js
import * as Render from '../render.js';
import { ensureAudioState, bakeAudioTimeline } from './export/audio.js';
import { renderFinalVideo, handleDownloadAudioSlice } from './export/video.js';
import state from './state.js';

export async function handleAnalyzeVideo(startTime, duration, resolution, state, onNLEReady) {
    state.resolutionSetting = resolution;
    state.captions = [];
    state.mediaLayers = [];
    state.selectedClipId = null;

    // Check if audio exists. If not, open empty studio.
    // ensureAudioState tries to load audio. If none, we should handle it.
    
    const success = await ensureAudioState(startTime, duration, state);
    if (!success) {
        // If failed (no audio), we allow continuing to Studio as an empty project
        // Reset audio state to avoid corrupt buffer references
        state.sourceAudioBuffer = null;
        state.pendingSlice = null;
        state.audioLayers = [];
        Render.log("STARTING EMPTY PROJECT");
    }
    
    onNLEReady(); 
    return true;
}

export function initEmptyStudio(onReady) {
    state.resolutionSetting = 'portrait';
    state.captions = [];
    state.mediaLayers = [];
    state.audioLayers = [];
    state.selectedClipId = null;
    state.sourceAudioBuffer = null;
    state.pendingSlice = null;
    
    if(onReady) onReady();
}

export { renderFinalVideo, handleDownloadAudioSlice, bakeAudioTimeline };