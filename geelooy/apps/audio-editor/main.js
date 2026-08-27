// B"H
// Pro Audio Editor - Main Logic

/**
 * Global Constants & Config
 */
const CONFIG = {
    SAMPLE_RATE: 44100,
    MIN_ZOOM: 0.1,  // CHANGED: Allows massive zoom out
    MAX_ZOOM: 2000,
    HEADER_HEIGHT: 30, 
    TRACK_HEIGHT: 80,
    HANDLE_WIDTH: 20,
    LONG_PRESS_MS: 300,
};

/**
 * State Management
 */
const state = {
    audioContext: null,
    clips: [], // Array of Clip objects: { id, buffer, start, offset, duration, name, peaks }
    isPlaying: false,
    playStartTime: 0, // AudioContext time when play started
    playHeadTime: 0, // Current cursor position in seconds
    zoom: 100, // Pixels per second
    scrollX: 0, // Horizontal scroll in pixels
    selectedClipId: null,
    
    // Interaction State
    interactionMode: 'IDLE', // IDLE, DRAGGING_CLIP, RESIZING_LEFT, RESIZING_RIGHT, PANNING
    dragStartX: 0,
    dragStartScroll: 0,
    dragStartClipTime: 0,
    dragStartClipDuration: 0,
    dragStartClipOffset: 0,
    lastMouseX: 0,
    longPressTimer: null,
    
    // Audio Nodes
    activeSources: [],
};

// Worker for Exporting
const worker = new Worker('worker.js');

/**
 * Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    initAudioContext();
    setupCanvas();
    setupEventListeners();
    loop(); // Start render loop
});

function initAudioContext() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    state.audioContext = new AudioCtor();
}

/**
 * Canvas & Rendering
 */
const canvas = document.getElementById('timeline-canvas');
const ctx = canvas.getContext('2d');

function setupCanvas() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    const container = canvas.parentElement;
    // Set internal resolution to match client size for sharp rendering
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Force a redraw immediately so the user doesn't see a blank screen after rotate
    requestAnimationFrame(render);
}

function loop() {
    updatePlayhead();
    render();
    requestAnimationFrame(loop);
}

function updatePlayhead() {
    if (state.isPlaying) {
        const now = state.audioContext.currentTime;
        state.playHeadTime = state.playHeadTime + (now - state.lastFrameTime);
        state.lastFrameTime = now;
        
        // Auto scroll if playing off screen
        const playheadX = (state.playHeadTime * state.zoom) - state.scrollX;
        if (playheadX > canvas.width * 0.9) {
            state.scrollX += 5; // Smooth follow
        }
    } else {
        state.lastFrameTime = state.audioContext.currentTime;
    }
}

function render() {
    // Clear
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid/Ruler
    drawRuler();

    // Draw Clips
    const trackY = CONFIG.HEADER_HEIGHT + 10;
    
    state.clips.forEach(clip => {
        const x = (clip.start * state.zoom) - state.scrollX;
        const width = clip.duration * state.zoom;
        
        // Optimization: Don't draw off-screen clips
        if (x + width < 0 || x > canvas.width) return;

        const isSelected = clip.id === state.selectedClipId;
        
        // Clip Background
        ctx.fillStyle = isSelected ? '#536dfe' : '#3d5afe';
        drawRoundedRect(ctx, x, trackY, width, CONFIG.TRACK_HEIGHT, 6);
        ctx.fill();

        // Waveform
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        drawClipWaveform(clip, x, trackY, width, CONFIG.TRACK_HEIGHT);

        // Clip Name
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText(clip.name, Math.max(x + 5, 5), trackY + 15);

        // Selection Border & Handles
        if (isSelected) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            drawRoundedRect(ctx, x, trackY, width, CONFIG.TRACK_HEIGHT, 6);
            ctx.stroke();

            // Handles
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(x, trackY, CONFIG.HANDLE_WIDTH, CONFIG.TRACK_HEIGHT); // Left
            ctx.fillRect(x + width - CONFIG.HANDLE_WIDTH, trackY, CONFIG.HANDLE_WIDTH, CONFIG.TRACK_HEIGHT); // Right
        }
    });

    // Draw Playhead
    const playheadX = (state.playHeadTime * state.zoom) - state.scrollX;
    ctx.strokeStyle = '#ff5252';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, canvas.height);
    ctx.stroke();
    
    // Playhead Cap
    ctx.fillStyle = '#ff5252';
    ctx.beginPath();
    ctx.moveTo(playheadX - 6, 0);
    ctx.lineTo(playheadX + 6, 0);
    ctx.lineTo(playheadX, 10);
    ctx.fill();
}

function drawRuler() {
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, CONFIG.HEADER_HEIGHT);
    ctx.fillStyle = '#888';
    ctx.font = '10px Arial';

    // Calculate time spacing based on zoom
    // Calculate time spacing based on zoom
    let secondStep = 1;
    if (state.zoom < 50) secondStep = 5;
    if (state.zoom < 20) secondStep = 15;
    if (state.zoom < 5) secondStep = 60;   // 1 Minute intervals
    if (state.zoom < 1) secondStep = 300;  // 5 Minute intervals
    if (state.zoom < 0.2) secondStep = 600; // 10 Minute intervals
    if (state.zoom > 100) secondStep = 0.5;
    if (state.zoom > 300) secondStep = 0.1;
    
    const startSec = Math.floor(state.scrollX / state.zoom);
    const endSec = Math.floor((state.scrollX + canvas.width) / state.zoom);

    for (let s = startSec; s <= endSec; s += secondStep) {
        // Fix float precision
        const sec = Math.round(s * 10) / 10;
        const x = (sec * state.zoom) - state.scrollX;
        
        ctx.fillRect(x, CONFIG.HEADER_HEIGHT - 10, 1, 10);
        if (Number.isInteger(sec)) {
            ctx.fillText(formatTime(sec), x + 4, CONFIG.HEADER_HEIGHT - 12);
            ctx.fillStyle = '#444'; // Grid line
            ctx.fillRect(x, CONFIG.HEADER_HEIGHT, 1, canvas.height);
            ctx.fillStyle = '#888'; // Reset text color
        }
    }
}

function drawClipWaveform(clip, x, y, width, height) {
    if (!clip.peaks) return;
    
    const centerY = y + (height / 2);
    const scaleY = (height / 2) * 0.9;
    
    // We render a simplified waveform based on pre-calculated peaks
    // The visual resolution depends on pixel width
    const step = Math.ceil(clip.peaks.length / width);
    
    ctx.beginPath();
    
    // Determine visible slice of the peaks
    // Clip start time logic is handled by 'x', here we need the internal offset logic
    // But since 'peaks' represents the whole buffer, we map width to peaks.
    
    // However, the clip might be trimmed (offset, duration).
    // We need to map pixels 0..width to the correct index in 'peaks'.
    
    const peaksPerSec = clip.peaks.length / clip.buffer.duration;
    const startPeakIdx = Math.floor(clip.offset * peaksPerSec);
    const endPeakIdx = Math.floor((clip.offset + clip.duration) * peaksPerSec);
    const visiblePeaks = clip.peaks.slice(startPeakIdx, endPeakIdx);
    
    // Drawing loop
    for (let i = 0; i < width; i++) {
        const peakIdx = Math.floor(i * (visiblePeaks.length / width));
        const val = visiblePeaks[peakIdx] || 0;
        const h = val * scaleY;
        ctx.rect(x + i, centerY - h, 1, h * 2);
    }
    ctx.fill();
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

/**
 * Event Listeners & Interaction
 */
function setupEventListeners() {
    const addBtn = document.getElementById('add-track-btn');
    const fileInput = document.getElementById('file-input');
    const playBtn = document.getElementById('play-pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const splitBtn = document.getElementById('split-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const zoomSlider = document.getElementById('zoom-slider');
    const exportBtn = document.getElementById('export-btn');

    addBtn.onclick = () => fileInput.click();
    fileInput.onchange = handleFileUpload;
    playBtn.onclick = togglePlay;
    stopBtn.onclick = stopPlayback;
    splitBtn.onclick = splitSelectedClip;
    deleteBtn.onclick = deleteSelectedClip;
    
    zoomSlider.oninput = (e) => {
        // Zoom around center
        const centerTime = (state.scrollX + canvas.width/2) / state.zoom;
        state.zoom = parseFloat(e.target.value);
        state.scrollX = (centerTime * state.zoom) - (canvas.width/2);
        state.scrollX = Math.max(0, state.scrollX);
    };
    
    exportBtn.onclick = handleExport;

    // Pointer Events (Unified Mouse/Touch)
    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    
    // Prevent context menu on right click for better web app feel
    canvas.addEventListener('contextmenu', e => e.preventDefault());
}

/**
 * Interaction Logic (The "Smart" Part)
 */
function handlePointerDown(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const mouseTime = (x + state.scrollX) / state.zoom;
    
    state.lastMouseX = e.clientX;
    state.dragStartX = e.clientX;
    
    // Check clip hits
    const hitClip = state.clips.find(clip => {
        return mouseTime >= clip.start && mouseTime <= clip.start + clip.duration &&
               y > CONFIG.HEADER_HEIGHT; // Simple Y check
    });

    if (hitClip) {
        state.selectedClipId = hitClip.id;
        
        // Edge Detection
        const clipPixelStart = (hitClip.start * state.zoom) - state.scrollX;
        const clipPixelEnd = clipPixelStart + (hitClip.duration * state.zoom);
        
        if (x >= clipPixelStart && x <= clipPixelStart + CONFIG.HANDLE_WIDTH) {
            state.interactionMode = 'RESIZING_LEFT';
            state.dragStartClipTime = hitClip.start;
            state.dragStartClipOffset = hitClip.offset;
            state.dragStartClipDuration = hitClip.duration;
        } else if (x >= clipPixelEnd - CONFIG.HANDLE_WIDTH && x <= clipPixelEnd) {
            state.interactionMode = 'RESIZING_RIGHT';
            state.dragStartClipDuration = hitClip.duration;
        } else {
            // Initiate Long Press logic for Move vs Selection
            state.dragStartClipTime = hitClip.start;
            
            // For Desktop: Click is usually instant select/drag. 
            // For Mobile: We use the timer.
            // Here we implement a hybrid: "Hold to move" feel.
            state.longPressTimer = setTimeout(() => {
                state.interactionMode = 'DRAGGING_CLIP';
                canvas.style.cursor = 'grabbing';
            }, 200); // 200ms threshold for "picking up"
        }
    } else {
        // Clicked on empty space / Ruler
        state.selectedClipId = null;
        if (y < CONFIG.HEADER_HEIGHT) {
            // Jump playhead
            state.playHeadTime = Math.max(0, mouseTime);
            if (state.isPlaying) {
                 stopPlayback(); // Reschedule needed
                 togglePlay();
            }
        } else {
            // Panning
            state.interactionMode = 'PANNING';
            state.dragStartScroll = state.scrollX;
            canvas.style.cursor = 'grabbing';
        }
    }
}

function handlePointerMove(e) {
    if (state.interactionMode === 'IDLE') return;

    // If moving significantly before timer fires, cancel timer (it was a tap or pan attempt)
    if (state.longPressTimer && Math.abs(e.clientX - state.dragStartX) > 10) {
        clearTimeout(state.longPressTimer);
        state.longPressTimer = null;
        // If we were waiting to drag a clip but moved quickly, maybe initiate panning if touch? 
        // For now, let's assume if you didn't wait, you aren't dragging the clip.
    }

    const dx = e.clientX - state.dragStartX;
    const clip = state.clips.find(c => c.id === state.selectedClipId);

    if (state.interactionMode === 'PANNING') {
        state.scrollX = Math.max(0, state.dragStartScroll - dx);
    } 
    else if (state.interactionMode === 'DRAGGING_CLIP' && clip) {
        const dt = dx / state.zoom;
        clip.start = Math.max(0, state.dragStartClipTime + dt);
    }
    else if (state.interactionMode === 'RESIZING_RIGHT' && clip) {
        const dt = dx / state.zoom;
        // Limit: Duration > 0.1s, and cannot exceed source buffer
        const maxDuration = clip.buffer.duration - clip.offset;
        const newDuration = Math.max(0.1, state.dragStartClipDuration + dt);
        clip.duration = Math.min(newDuration, maxDuration);
    }
    else if (state.interactionMode === 'RESIZING_LEFT' && clip) {
        const dt = dx / state.zoom;
        // Logic: Moving start right means increasing offset, decreasing duration, increasing start time
        // Limit: Duration > 0.1s, offset >= 0
        
        // Desired change in time
        let change = dt;
        
        // Constraints
        // 1. New Offset cannot be < 0 (dragged too far left)
        if (state.dragStartClipOffset + change < 0) change = -state.dragStartClipOffset;
        
        // 2. Duration must remain > 0.1
        if (state.dragStartClipDuration - change < 0.1) change = state.dragStartClipDuration - 0.1;

        clip.start = state.dragStartClipTime + change;
        clip.offset = state.dragStartClipOffset + change;
        clip.duration = state.dragStartClipDuration - change;
    }
}

function handlePointerUp(e) {
    if (state.longPressTimer) clearTimeout(state.longPressTimer);
    state.interactionMode = 'IDLE';
    canvas.style.cursor = 'default';
}

/**
 * File Handling & Audio Processing
 */
async function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    document.getElementById('loading-overlay').classList.remove('hidden');

    for (const file of files) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await state.audioContext.decodeAudioData(arrayBuffer);
            
            // Calculate Peaks for visualization
            const peaks = calculatePeaks(audioBuffer, 1000); // 1000 samples for the whole file

            const newClip = {
                id: Date.now() + Math.random().toString(),
                buffer: audioBuffer,
                start: state.playHeadTime, // Place at playhead
                offset: 0,
                duration: audioBuffer.duration,
                name: file.name,
                peaks: peaks
            };
            
            state.clips.push(newClip);
            // Move playhead to end of new clip
            state.playHeadTime += newClip.duration;
            
        } catch (err) {
            console.error("Error loading file:", err);
            alert("Could not load " + file.name);
        }
    }

    document.getElementById('loading-overlay').classList.add('hidden');
    document.getElementById('export-btn').disabled = false;
    render();
}

function calculatePeaks(buffer, resolution) {
    const data = buffer.getChannelData(0); // Use first channel
    const step = Math.floor(data.length / resolution) || 1;
    const peaks = [];
    for (let i = 0; i < data.length; i += step) {
        let max = 0;
        // Check a small window for the peak to be accurate
        for (let j = 0; j < 100 && i+j < data.length; j++) {
            const val = Math.abs(data[i+j]);
            if (val > max) max = val;
        }
        peaks.push(max);
    }
    return peaks;
}

/**
 * Editing Functions
 */
function splitSelectedClip() {
    if (!state.selectedClipId) return;
    const clipIndex = state.clips.findIndex(c => c.id === state.selectedClipId);
    if (clipIndex === -1) return;
    
    const clip = state.clips[clipIndex];
    
    // Check if playhead is within clip
    if (state.playHeadTime > clip.start && state.playHeadTime < clip.start + clip.duration) {
        const splitPointRelative = state.playHeadTime - clip.start;
        
        // Create Right Side Clip
        const rightClip = {
            ...clip,
            id: Date.now() + Math.random().toString(),
            start: state.playHeadTime,
            offset: clip.offset + splitPointRelative,
            duration: clip.duration - splitPointRelative
        };
        
        // Modify Left Side (Original) Clip
        clip.duration = splitPointRelative;
        
        state.clips.push(rightClip);
        state.selectedClipId = rightClip.id; // Select new part
        render();
    }
}

function deleteSelectedClip() {
    if (!state.selectedClipId) return;
    state.clips = state.clips.filter(c => c.id !== state.selectedClipId);
    state.selectedClipId = null;
    if (state.clips.length === 0) document.getElementById('export-btn').disabled = true;
    render();
}

/**
 * Audio Engine (Playback)
 */
function togglePlay() {
    if (state.isPlaying) {
        stopPlayback();
    } else {
        startPlayback();
    }
}

function startPlayback() {
    if (state.audioContext.state === 'suspended') state.audioContext.resume();
    
    state.activeSources = [];
    const startTime = state.audioContext.currentTime;
    
    state.clips.forEach(clip => {
        // Only schedule clips that end after the current playhead
        if (clip.start + clip.duration > state.playHeadTime) {
            
            const source = state.audioContext.createBufferSource();
            source.buffer = clip.buffer;
            source.connect(state.audioContext.destination);
            
            // Calculate offsets
            let whenToPlay = startTime + (clip.start - state.playHeadTime);
            let offsetInFile = clip.offset;
            let durationToPlay = clip.duration;
            
            // If playhead is in the middle of this clip
            if (state.playHeadTime > clip.start) {
                const startDiff = state.playHeadTime - clip.start;
                offsetInFile += startDiff;
                durationToPlay -= startDiff;
                whenToPlay = startTime;
            }
            
            // Schedule
            if (whenToPlay >= startTime) {
                source.start(whenToPlay, offsetInFile, durationToPlay);
                state.activeSources.push(source);
            }
        }
    });

    state.isPlaying = true;
    state.playStartTime = startTime;
    document.getElementById('play-icon').textContent = 'pause';
}

function stopPlayback() {
    state.activeSources.forEach(s => {
        try { s.stop(); } catch(e){}
    });
    state.activeSources = [];
    state.isPlaying = false;
    document.getElementById('play-icon').textContent = 'play_arrow';
}

/**
 * Export Logic
 */
function handleExport() {
    if (state.clips.length === 0) return;
    stopPlayback();
    
    document.getElementById('status-bar').textContent = 'Exporting...';
    document.getElementById('loading-overlay').classList.remove('hidden');

    // Prepare data for worker
    // We can't send AudioBuffers directly efficiently, we send channel data
    // But since that's heavy, we'll do a simplified approach:
    // We will calculate the total duration, and send minimal instructions to worker 
    // to mix. 
    // *Correction*: We must send the data.
    
    const exportData = state.clips.map(clip => {
        const channels = [];
        for (let i = 0; i < clip.buffer.numberOfChannels; i++) {
            channels.push(clip.buffer.getChannelData(i));
        }
        return {
            channels: channels,
            sampleRate: clip.buffer.sampleRate,
            start: clip.start,
            offset: clip.offset,
            duration: clip.duration
        };
    });

    // Find max duration
    const totalDuration = Math.max(...state.clips.map(c => c.start + c.duration));

    worker.postMessage({
        type: 'EXPORT',
        payload: {
            clips: exportData,
            totalDuration: totalDuration,
            sampleRate: CONFIG.SAMPLE_RATE
        }
    });
}

worker.onmessage = (e) => {
    const { type, payload } = e.data;
    if (type === 'EXPORT_COMPLETE') {
        const url = URL.createObjectURL(payload.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'BH_Master_Mix.wav';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        document.getElementById('loading-overlay').classList.add('hidden');
        document.getElementById('status-bar').textContent = 'Export Complete!';
    }
};

/**
 * Utils
 */
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${m}:${s.toString().padStart(2, '0')}.${ms}`;
}