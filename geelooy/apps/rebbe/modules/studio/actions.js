//B"H
// modules/studio/actions.js
// AGGREGATOR MODULE

import * as History from './actions/history.js';
import * as Transport from './actions/transport.js';
import * as Edit from './actions/edit.js';
import * as VideoGen from '../video-gen.js';
import { bufferToWaveBlob } from '../audio-utils.js';
import { generateAiImage, transcribeAudio } from '../../services/gemini.js';
import state from '../state.js';

// Re-export Core Sub-Modules
export const { saveState, undo, redo } = History;
export const { togglePlay, seek, startAudio, stopAudio, setZoom } = Transport;
export const { 
    splitClip, deleteSelected, duplicateSelected, moveLayer, 
    addAudioCut, updateGlobal, updateParticle, updateFX, 
    updateClip, updateClipDuration, updateClipStyle,
    toggleTrackMute, updateTrackVolume
} = Edit;

// --- FEATURE ACTIONS (Remaining) ---

export function detectBeats() {
    if(!state.pendingSlice) return alert("NO AUDIO LOADED");
    History.saveState();
    
    document.getElementById('studio-status').textContent = "ANALYZING BEATS...";
    const data = state.pendingSlice.getChannelData(0);
    const sampleRate = state.pendingSlice.sampleRate;
    const step = Math.floor(sampleRate / 10);
    let beats = [];
    
    for(let i=0; i<data.length; i+=step) {
        let max = 0;
        for(let j=0; j<step; j++) {
            if(i+j < data.length) max = Math.max(max, Math.abs(data[i+j]));
        }
        if(max > 0.8) beats.push(i / sampleRate);
    }
    
    state.studioBeats = beats;
    if(window.Studio) window.Studio.renderTimeline();
    document.getElementById('studio-status').textContent = `FOUND ${beats.length} PEAKS`;
}

export function addGlyph(type='warning') {
    History.saveState();
    state.mediaLayers.push({
        id: Date.now(),
        type: 'glyph',
        src: type,
        start: state.currentTime, 
        end: state.currentTime+3,
        x: 0.5, y: 0.5, scale: 1, opacity: 1, 
        blendMode: 'source-over',
        filter: { brightness: 100, blur: 0 }
    });
    if(window.Studio) window.Studio.renderTimeline();
}

// --- AI HANDLERS ---

export async function handleGenCaps() {
    const key = getKey(); if(!key) return;
    document.getElementById('studio-status').textContent = "AI WORKING...";
    try {
        const blob = await bufferToWaveBlob(state.pendingSlice);
        const caps = await transcribeAudio(blob, key, {model:'gemini-2.5-flash'});
        History.saveState();
        state.captions = caps.map(c => ({...c, id: Date.now() + Math.random(), style:{}}));
        if(window.Studio) window.Studio.renderTimeline();
        document.getElementById('studio-status').textContent = "DONE";
    } catch(e) { alert(e.message); }
}

export async function handleGenImage() {
    const p = prompt("Prompt:");
    if(!p) return;
    const key = getKey(); if(!key) return;
    document.getElementById('studio-status').textContent = "GENERATING...";
    try {
        const src = await generateAiImage(p, key);
        History.saveState();
        state.mediaLayers.push({
            id: Date.now(), type:'image', src, 
            start: state.currentTime, end: state.currentTime+5,
            x:0.5, y:0.5, scale:1, opacity:1, blendMode:'source-over',
            filter: { brightness: 100, blur: 0 }
        });
        if(window.Studio) window.Studio.renderTimeline();
        document.getElementById('studio-status').textContent = "DONE";
    } catch(e) { alert(e.message); }
}

export function handleUpload(e) {
    const file = e.target.files[0];
    if(!file) return;
    History.saveState();
    
    const url = URL.createObjectURL(file);
    state.mediaLayers.push({
        id: Date.now(),
        type: file.type.startsWith('video')?'video':'image',
        src: url,
        start: state.currentTime, end: state.currentTime+5,
        x:0.5, y:0.5, scale:1, opacity:1, blendMode:'source-over',
        filter: { brightness: 100, blur: 0 }
    });
    if(window.Studio) window.Studio.renderTimeline();
}

function getKey() {
    let k = localStorage.getItem('gemini_api_key');
    if(!k) {
        k = prompt("Gemini API Key:");
        if(k) localStorage.setItem('gemini_api_key', k);
    }
    return k;
}