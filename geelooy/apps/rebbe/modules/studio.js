//B"H
// modules/studio.js
import state from './state.js';
import { bufferToWaveBlob } from './audio-utils.js';
import { generateAiImage, transcribeAudio } from '../services/gemini.js';

// --- ENGINE VARS ---
let ctx = null; // Canvas Context
let audioCtx = null;
let sourceNode = null;
let analyserNode = null;
let requestID = null;

// Media Cache
const mediaCache = {}; // { src: { element: HTMLImage/Video, type: 'video'|'image', ready: bool } }

// Particles
const particles = [];
const CHARS = "אבגדהוזחטיכלמנסעפצקרשת";

// --- INITIALIZATION ---

export function initStudio() {
    const canvas = document.getElementById('studio-preview-canvas');
    if(!canvas) return;
    ctx = canvas.getContext('2d');
    
    // Resize Canvas based on resolution setting
    const isPortrait = state.resolutionSetting === 'portrait';
    canvas.width = isPortrait ? 360 : 640;
    canvas.height = isPortrait ? 640 : 360;

    initParticles(canvas.width, canvas.height);
    renderTimeline();
    updateUIControls();

    if(!requestID) loop();
}

export function closeStudio() {
    if(sourceNode) { try{sourceNode.stop();}catch(e){} sourceNode=null; }
    if(requestID) { cancelAnimationFrame(requestID); requestID = null; }
    state.studioIsPlaying = false;
    // Clear heavy media from memory?
}

// --- CONTROLS ---

export async function togglePlay() {
    if(state.studioIsPlaying) {
        stopAudio();
    } else {
        await startAudio();
    }
    updateUIControls();
}

export function seek(time) {
    stopAudio();
    const dur = state.pendingSlice ? state.pendingSlice.duration : 10;
    state.currentTime = Math.max(0, Math.min(time, dur));
    updateUIControls();
}

export function setZoom(z) {
    state.studioZoom = parseInt(z);
    renderTimeline();
}

export function updateParticleSettings(key, val) {
    state.studioParticleSettings[key] = val;
}

// --- AUDIO ENGINE ---

async function startAudio() {
    if(!state.pendingSlice) return;
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') await audioCtx.resume();

    sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = state.pendingSlice;
    
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 256;
    
    sourceNode.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);
    
    const offset = state.currentTime;
    const duration = state.pendingSlice.duration - offset;
    
    if(duration > 0) {
        sourceNode.start(0, offset, duration);
        state.studioStartTime = audioCtx.currentTime;
        state.studioOffsetTime = offset;
        state.studioIsPlaying = true;
        
        // Sync videos
        syncVideoElements(true);
        
        sourceNode.onended = () => {
             if(state.studioIsPlaying && (state.currentTime >= state.pendingSlice.duration - 0.1)) {
                 stopAudio();
                 state.currentTime = 0; // Loop or stop at end? Stop.
                 updateUIControls();
             }
        };
    }
}

function stopAudio() {
    if(sourceNode) { try{sourceNode.stop();}catch(e){} sourceNode = null; }
    state.studioIsPlaying = false;
    syncVideoElements(false);
}

function syncVideoElements(play) {
    Object.values(mediaCache).forEach(m => {
        if(m.type === 'video' && m.element) {
            if(play) {
                m.element.currentTime = state.currentTime - (m.startTime || 0); 
                m.element.play().catch(e=>{});
            } else {
                m.element.pause();
            }
        }
    });
}

// --- RENDER LOOP ---

function loop() {
    if(!document.getElementById('studio-preview-canvas')) {
        requestID = null;
        return; 
    }

    // Time Update
    if(state.studioIsPlaying && audioCtx) {
        const now = audioCtx.currentTime;
        state.currentTime = state.studioOffsetTime + (now - state.studioStartTime);
    }

    drawFrame();
    updatePlayhead();
    
    const timeDisplay = document.getElementById('studio-status');
    if(timeDisplay) timeDisplay.textContent = `TIME: ${state.currentTime.toFixed(2)}s`;

    requestID = requestAnimationFrame(loop);
}

function drawFrame() {
    if(!ctx) return;
    const { width, height } = ctx.canvas;
    
    // 0. Audio Analysis
    let bass = 0;
    if(state.studioIsPlaying && analyserNode) {
        const data = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(data);
        const avg = data.reduce((a,b)=>a+b,0) / data.length;
        bass = (avg / 255) * state.studioParticleSettings.reactivity; 
    }

    // 1. BG
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // 2. Particles
    drawParticles(ctx, width, height, bass);

    // 3. Media Layers
    state.mediaLayers.forEach(l => {
        if(state.currentTime >= l.start && state.currentTime <= l.end) {
            drawMediaLayer(ctx, l, width, height);
        }
    });

    // 4. Captions
    const cap = state.pendingCaptions.find(c => state.currentTime >= c.start && state.currentTime <= c.end);
    if(cap) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff0055';
        ctx.font = 'bold 30px monospace';
        ctx.fillText(cap.text, width/2, height*0.8);
        
        ctx.fillStyle = '#00f3ff';
        ctx.font = '20px monospace';
        ctx.fillText(cap.translation, width/2, height*0.8 + 30);
    }
}

function drawMediaLayer(ctx, layer, w, h) {
    // Get/Load Media
    let media = mediaCache[layer.src];
    
    if (!media) {
        // Init
        if (layer.type === 'image') {
            const img = new Image();
            img.src = layer.src;
            media = { element: img, type: 'image', ready: false };
            img.onload = () => media.ready = true;
        } else if (layer.type === 'video') {
            const vid = document.createElement('video');
            vid.src = layer.src;
            vid.muted = true;
            vid.playsInline = true;
            vid.loop = true; // or handled by logic
            media = { element: vid, type: 'video', ready: false };
            vid.onloadeddata = () => media.ready = true;
        }
        mediaCache[layer.src] = media;
    }

    if(media.ready) {
        if(media.type === 'video') {
            // Manual sync if not playing
            if(!state.studioIsPlaying) {
                 // only set if diff is large to avoid stutter
                 const target = state.currentTime - layer.start;
                 if(Math.abs(media.element.currentTime - target) > 0.2) {
                     media.element.currentTime = target;
                 }
            }
            try {
                ctx.drawImage(media.element, 0, 0, w, h);
            } catch(e){}
        } else {
             ctx.drawImage(media.element, 0, 0, w, h);
        }
    } else {
        // Loading placeholder
        ctx.fillStyle = '#333';
        ctx.fillText("LOADING...", w/2, h/2);
    }
}

function initParticles(w, h) {
    particles.length = 0;
    const count = 200;
    for(let i=0; i<count; i++) {
        particles.push({
            x: Math.random() * w, y: Math.random() * h,
            char: CHARS[Math.floor(Math.random() * CHARS.length)],
            vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2,
            size: 10 + Math.random() * 20
        });
    }
}

function drawParticles(ctx, w, h, energy) {
    const s = state.studioParticleSettings;
    const limit = s.count;
    
    ctx.fillStyle = s.color;
    ctx.font = '20px monospace';
    
    for(let i=0; i<Math.min(limit, particles.length); i++) {
        const p = particles[i];
        
        // Move
        const boost = 1 + (energy * 5);
        p.x += p.vx * boost;
        p.y += p.vy * boost;
        
        if(p.x<0)p.x=w; if(p.x>w)p.x=0;
        if(p.y<0)p.y=h; if(p.y>h)p.y=0;
        
        const size = p.size + (energy * 30);
        ctx.font = `${size}px monospace`;
        
        // Draw
        ctx.fillText(p.char, p.x, p.y);
    }
}

// --- TIMELINE UI ---

function renderTimeline() {
    const ruler = document.getElementById('timeline-ruler');
    const trackContainer = document.getElementById('timeline-tracks');
    if(!ruler || !trackContainer) return;

    const zoom = state.studioZoom;
    const dur = state.pendingSlice ? state.pendingSlice.duration : 10;
    const totalW = dur * zoom;

    // Ruler
    ruler.innerHTML = '';
    for(let i=0; i<=dur; i+=1) {
        const mark = document.createElement('div');
        mark.style.position = 'absolute';
        mark.style.left = (i * zoom) + 'px';
        mark.style.height = '100%';
        mark.style.borderLeft = '1px solid #444';
        mark.style.fontSize = '9px';
        mark.style.paddingLeft = '2px';
        mark.style.color = '#666';
        mark.textContent = i + 's';
        ruler.appendChild(mark);
    }
    
    // Scrub Interaction on Ruler
    ruler.onmousedown = (e) => handleScrub(e, ruler);

    // Tracks
    trackContainer.innerHTML = '';
    
    // Caps Track
    renderTrack(trackContainer, "CAPTIONS", state.pendingCaptions, totalW, 'caps');
    // Media Track
    renderTrack(trackContainer, "MEDIA", state.mediaLayers, totalW, 'media');
}

function renderTrack(container, label, items, width, type) {
    const tr = document.createElement('div');
    tr.className = 'nle-track';
    
    const lbl = document.createElement('div');
    lbl.className = 'track-label';
    lbl.textContent = label;
    tr.appendChild(lbl);
    
    const lane = document.createElement('div');
    lane.className = 'track-lane';
    lane.style.width = width + 'px';
    
    // Scrub on lane too
    lane.onmousedown = (e) => handleScrub(e, lane);

    items.forEach((item, idx) => {
        const b = document.createElement('div');
        b.className = type === 'media' ? 'nle-block media-block' : 'nle-block';
        b.style.left = (item.start * state.studioZoom) + 'px';
        b.style.width = ((item.end - item.start) * state.studioZoom) + 'px';
        
        if(type === 'caps') {
            b.innerHTML = `<div class="block-content"><div class="b-txt">${item.text}</div><div class="b-sub">${item.translation}</div></div>`;
            b.onclick = (e) => { e.stopPropagation(); editCaption(item); }
        } else {
            b.innerHTML = `<div class="block-img" style="background-image:url(${item.src})"></div>`;
            b.onclick = (e) => { 
                e.stopPropagation(); 
                if(confirm("Delete layer?")) {
                    state.mediaLayers.splice(idx,1);
                    renderTimeline();
                }
            }
        }
        lane.appendChild(b);
    });

    tr.appendChild(lane);
    container.appendChild(tr);
}

function handleScrub(e, el) {
    const startX = e.clientX;
    const rect = el.getBoundingClientRect();
    const scroll = document.getElementById('timeline-tracks').scrollLeft;
    // Base offset from lane/ruler
    // Note: rect.left is the left of visible area. 
    // timeline-tracks scrolls, but ruler-container might scroll? 
    // Wait, ruler is sticky in some designs, but here I put it separate.
    // Let's assume el is the scrollable container's child.
    
    // Simple logic:
    // x relative to element + scroll of parent?
    // Actually, in CSS, tracks scroll. The lane is wide.
    // rect.left changes as we scroll if it's the lane.
    
    const update = (evt) => {
        const x = evt.clientX - rect.left; 
        const t = Math.max(0, x / state.studioZoom);
        seek(t);
    };
    
    update(e); // Seek on click
    
    const move = (evt) => update(evt);
    const up = () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
}

function updatePlayhead() {
    const p = document.getElementById('timeline-playhead');
    const container = document.getElementById('timeline-tracks');
    if(!p || !container) return;
    
    const labelW = window.innerWidth <= 768 ? 60 : 120;
    const scroll = container.scrollLeft;
    const x = (state.currentTime * state.studioZoom);
    
    // Playhead is fixed absolute in studio-bottom.
    // It must move with time relative to tracks.
    // But tracks move with scroll.
    // Visually: X - scroll + LabelWidth.
    p.style.left = (labelW + x - scroll) + 'px';
}

function updateUIControls() {
    const b = document.getElementById('st-play');
    if(b) b.textContent = state.studioIsPlaying ? "⏸ PAUSE" : "▶ PLAY";
}

function editCaption(cap) {
    const t = prompt("Edit Hebrew/Yiddish:", cap.text);
    if(t) {
        cap.text = t;
        const tr = prompt("Edit English:", cap.translation);
        if(tr) cap.translation = tr;
        renderTimeline();
    }
}

// --- AI HANDLERS ---

export async function handleGenCaps() {
    const k = localStorage.getItem('gemini_api_key');
    if(!k) return alert("API KEY MISSING");
    if(!state.pendingSlice) return alert("NO AUDIO");
    
    document.getElementById('studio-status').textContent = "AI PROCESSING...";
    try {
        const blob = await bufferToWaveBlob(state.pendingSlice);
        const caps = await transcribeAudio(blob, k, {model:'gemini-2.5-flash'});
        state.pendingCaptions = caps;
        renderTimeline();
        document.getElementById('studio-status').textContent = "READY";
    } catch(e) {
        alert(e.message);
    }
}

export async function handleGenImage() {
    const p = prompt("Image Prompt:");
    if(!p) return;
    const k = localStorage.getItem('gemini_api_key');
    if(!k) return alert("API KEY MISSING");
    
    document.getElementById('studio-status').textContent = "GENERATING...";
    try {
        const src = await generateAiImage(p, k);
        state.mediaLayers.push({
            id: Date.now(), type: 'image', src, 
            start: state.currentTime, end: state.currentTime+5,
            x:0.5, y:0.5, scale:1
        });
        renderTimeline();
        document.getElementById('studio-status').textContent = "READY";
    } catch(e) {
        alert(e.message);
    }
}

export function handleUpload(e) {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        state.mediaLayers.push({
            id: Date.now(), 
            type: file.type.startsWith('video') ? 'video' : 'image',
            src: ev.target.result,
            start: state.currentTime, end: state.currentTime+5,
            x:0.5, y:0.5, scale:1
        });
        renderTimeline();
    };
    reader.readAsDataURL(file);
}
