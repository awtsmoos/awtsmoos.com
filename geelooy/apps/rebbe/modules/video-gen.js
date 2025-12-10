//B"H
// modules/video-gen.js
import * as Render from '../render.js';
import { ensureAudioState, bakeAudioTimeline } from './export/audio.js';
import { renderFinalVideo, handleDownloadAudioSlice } from './export/video.js';

export async function handleAnalyzeVideo(startTime, duration, resolution, state, onNLEReady) {
    state.resolutionSetting = resolution;
    state.captions = [];
    state.mediaLayers = [];
    state.selectedClipId = null;

    const success = await ensureAudioState(startTime, duration, state);
    if (!success) {
        Render.updateVideoProgress("FAILED TO LOAD TRACK", 0);
        return false;
    }
    
    onNLEReady(); 
    return true;
}

export { renderFinalVideo, handleDownloadAudioSlice, bakeAudioTimeline };