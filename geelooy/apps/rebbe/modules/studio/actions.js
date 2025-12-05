//B"H
// modules/studio/actions.js
import state from '../state.js';
import { ctx, initAudioContext } from './context.js';
import { renderTimeline, updatePropertiesPanel } from './ui.js';
import { bufferToWaveBlob } from '../audio-utils.js';
import { generateAiImage, transcribeAudio } from '../../services/gemini.js';

// --- PLAYBACK ---

export async function togglePlay() {
    if (state.studioIsPlaying) stopAudio();
    else await startAudio();
    updateUI();
}

export function seek(time) {
    stopAudio();
    state.currentTime = Math.max(0, Math.min(time, state.pendingSlice?.duration || 10));
    updateUI();
    renderTimeline(); // Update playhead pos
}

async function startAudio() {
    if (!state.pendingSlice) return;
    initAudioContext();
    if (ctx.audio.state === 'suspended') await ctx.audio.resume();

    ctx.source = ctx.audio.createBufferSource();
    ctx.source.buffer = state.pendingSlice;
    ctx.source.connect(ctx.analyser);
    ctx.analyser.connect(ctx.audio.destination);

    const off = state.currentTime;
    ctx.source.start(0, off);
    
    state.studioStartTime = ctx.audio.currentTime;
    state.studioOffsetTime = off;
    state.studioIsPlaying = true;
    
    syncMedia(true);
}

export function stopAudio() {
    if (ctx.source) { try { ctx.source.stop(); } catch(e){} ctx.source = null; }
    state.studioIsPlaying = false;
    syncMedia(false);
    updateUI();
}

function syncMedia(playing) {
    Object.values(ctx.mediaCache).forEach(m => {
        if (m.type === 'video' && m.el) {
            if (playing) m.el.play().catch(e=>{});
            else m.el.pause();
        }
    });
}

function updateUI() {
    const b = document.getElementById('st-play');
    if (b) b.textContent = state.studioIsPlaying ? "⏸ PAUSE" : "▶ PLAY";
}

// --- STATE MUTATIONS ---

export function setZoom(v) { state.studioZoom = parseInt(v); renderTimeline(); }
export function updateGlobal(k, v) { state.studioGlobal[k] = v; }
export function updateParticle(k, v) { state.studioParticleSettings[k] = v; }
export function updateFX(k, v) { state.studioFX[k] = v; }

export function updateClip(k, v) {
    const item = getSelected();
    if (item) { item[k] = v; renderTimeline(); }
}

export function updateClipDuration(d) {
    const item = getSelected();
    if (item) { item.end = item.start + d; renderTimeline(); }
}

export function updateClipStyle(k, v) {
    const item = getSelected();
    if (item) {
        if (!item.style) item.style = {};
        item.style[k] = v;
    }
}

export function deleteSelected() {
    if (state.selectedType === 'media') {
        state.mediaLayers = state.mediaLayers.filter(i => i.id !== state.selectedClipId);
    } else {
        state.captions = state.captions.filter(i => i.id !== state.selectedClipId);
    }
    state.selectedClipId = null;
    renderTimeline();
    updatePropertiesPanel();
}

export function duplicateSelected() {
    const item = getSelected();
    if(!item) return;
    const copy = JSON.parse(JSON.stringify(item));
    copy.id = Date.now() + Math.random();
    copy.start += 1.0; 
    copy.end += 1.0;
    if(state.selectedType === 'media') state.mediaLayers.push(copy);
    else state.captions.push(copy);
    renderTimeline();
}

export function moveLayer(dir) {
    if(state.selectedType !== 'media') return;
    const idx = state.mediaLayers.findIndex(i => i.id === state.selectedClipId);
    if(idx === -1) return;
    const item = state.mediaLayers[idx];
    state.mediaLayers.splice(idx, 1);
    if(dir === 'up') state.mediaLayers.splice(Math.min(state.mediaLayers.length, idx+1), 0, item);
    else state.mediaLayers.splice(Math.max(0, idx-1), 0, item);
    renderTimeline();
}

// --- FEATURES ---

export function detectBeats() {
    if(!state.pendingSlice) return alert("NO AUDIO LOADED");
    
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
    renderTimeline();
    document.getElementById('studio-status').textContent = `FOUND ${beats.length} PEAKS`;
}

export function addGlyph(type='warning') {
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
    renderTimeline();
}

// --- AI ---

export async function handleGenCaps() {
    const key = getKey(); if(!key) return;
    document.getElementById('studio-status').textContent = "AI WORKING...";
    try {
        const blob = await bufferToWaveBlob(state.pendingSlice);
        const caps = await transcribeAudio(blob, key, {model:'gemini-2.5-flash'});
        state.captions = caps.map(c => ({...c, id: Date.now() + Math.random(), style:{}}));
        renderTimeline();
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
        state.mediaLayers.push({
            id: Date.now(), type:'image', src, 
            start: state.currentTime, end: state.currentTime+5,
            x:0.5, y:0.5, scale:1, opacity:1, blendMode:'source-over',
            filter: { brightness: 100, blur: 0 }
        });
        renderTimeline();
        document.getElementById('studio-status').textContent = "DONE";
    } catch(e) { alert(e.message); }
}

export function handleUpload(e) {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        state.mediaLayers.push({
            id: Date.now(),
            type: file.type.startsWith('video')?'video':'image',
            src: ev.target.result,
            start: state.currentTime, end: state.currentTime+5,
            x:0.5, y:0.5, scale:1, opacity:1, blendMode:'source-over',
            filter: { brightness: 100, blur: 0 }
        });
        renderTimeline();
    };
    reader.readAsDataURL(file);
}

function getKey() {
    let k = localStorage.getItem('gemini_api_key');
    if(!k) {
        k = prompt("Gemini API Key:");
        if(k) localStorage.setItem('gemini_api_key', k);
    }
    return k;
}

function getSelected() {
    const list = state.selectedType === 'media' ? state.mediaLayers : state.captions;
    return list.find(i => i.id === state.selectedClipId);
}