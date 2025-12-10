
/* B"H */
// piano/modules/recorder.js
import { AudioState } from './audio.js';
import { elements, scrollState } from './ui.js';
import { activeNotes } from './synth.js';

export let isVideoRecording = false;
export let videoStartTime = 0;
export let videoKeyDownMap = new Map();
export let videoRecordingData = [];
export let videoWorker = null;
let audioChunks = [];
let mediaRecorder = null;

export let isSheetRecording = false;
export let sheetNotes = [];
export let sheetRecordingStartTime = 0;

// --- AUDIO RECORDING ---
export function toggleAudioRecording() {
    const btn = elements.recordAudioButton;
    if (btn.classList.contains('recording')) {
        mediaRecorder.stop();
        btn.textContent = 'Record 🎤';
        btn.classList.remove('recording');
    } else {
        startMediaRecorder('audio');
        btn.textContent = 'Stop';
        btn.classList.add('recording');
    }
}

function startMediaRecorder(mode) {
    const stream = AudioState.mediaStreamDestination.stream;
    const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
    mediaRecorder = new MediaRecorder(stream, { mimeType });
    audioChunks = [];
    
    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
    
    mediaRecorder.onstop = () => {
        if (mode === 'audio') downloadBlob(new Blob(audioChunks, { type: mimeType }), `BH-Audio-${Date.now()}.webm`);
        if (mode === 'video') processAudioAndFinalize(audioChunks);
    };
    
    mediaRecorder.start();
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none'; a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    window.URL.revokeObjectURL(url); a.remove();
}

// --- VIDEO RECORDING ---
export async function toggleVideoRecording() {
    const btn = elements.recordVideoButton;
    if (isVideoRecording) {
        // Stop
        const stopTime = AudioState.context.currentTime;
        videoKeyDownMap.forEach((downEvent, noteName) => {
             // Flush remaining keys
             videoWorker.postMessage({
                type: 'ADD_KEY_EVENT',
                payload: { note: noteName, start: downEvent.startTime - videoStartTime, end: stopTime - videoStartTime, x: downEvent.x, y: downEvent.y }
             });
        });
        videoKeyDownMap.clear();
        mediaRecorder.stop();
        isVideoRecording = false;
        btn.textContent = 'Processing...';
        
    } else {
        // Start
        videoKeyDownMap.clear();
        videoRecordingData = []; // clear old data
        
        const renderMode = elements.effectSelect.value;
        const isVertical = window.innerHeight > window.innerWidth;
        const res = isVertical ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 };
        const fps = parseInt(document.getElementById('myFPS').value) || 30;
        
        videoWorker = new Worker('./synth-video-worker.js');
        setupWorkerListeners(videoWorker);
        
        startMediaRecorder('video'); // This sets up mediaRecorder
        
        videoStartTime = AudioState.context.currentTime;
        
        videoWorker.postMessage({
            type: 'INITIALIZE_RENDERER',
            payload: {
                renderMode,
                resolution: res,
                outputFormat: { quality: 0.8, fps },
                startOctave: elements.octaveSelect.value,
                alwaysDual: elements.alwaysDualCheckbox.checked,
                independentScroll: elements.independentScrollCheckbox.checked,
                isVertical,
                style: {
                    userKeyWidth: parseInt(elements.keyWidthSlider.value),
                    userViewportWidth: elements.keyboardContainer.clientWidth
                },
                initialScrollX: scrollState.x,
                initialScrollX2: scrollState.x2 || 0
            }
        });
        
        isVideoRecording = true;
        btn.textContent = 'STOP Video';
    }
}

function setupWorkerListeners(worker) {
    worker.onmessage = (event) => {
        const { type, payload } = event.data;
        const progEl = elements.videoProgress;
        if (type === 'STATUS_UPDATE') progEl.textContent = payload.message;
        else if (type === 'PROGRESS_UPDATE') progEl.textContent = `Processing: ${payload.percent}%`;
        else if (type === 'VIDEO_COMPLETE') {
            progEl.textContent = 'Complete! Downloading...';
            downloadBlob(payload.blob, `BH-Video-${Date.now()}.mp4`);
            worker.terminate();
            videoWorker = null;
            elements.recordVideoButton.textContent = 'Record 🎥';
            progEl.textContent = '';
        }
    };
}

function processAudioAndFinalize(chunks) {
    const blob = new Blob(chunks, { type: chunks[0].type });
    const reader = new FileReader();
    reader.onload = async (e) => {
        elements.videoProgress.textContent = 'Decoding Audio...';
        const buffer = await AudioState.context.decodeAudioData(e.target.result);
        const bufferShim = {
            sampleRate: buffer.sampleRate, length: buffer.length, duration: buffer.duration, numberOfChannels: buffer.numberOfChannels,
            channels: []
        };
        for(let i=0; i<buffer.numberOfChannels; i++) bufferShim.channels.push(buffer.getChannelData(i));
        
        elements.videoProgress.textContent = 'Muxing...';
        videoWorker.postMessage({ type: 'FINALIZE_MUXING', payload: { audioBufferShim: bufferShim } }, bufferShim.channels.map(c => c.buffer));
    };
    reader.readAsArrayBuffer(blob);
}

// Called by UI when scrolling
export function sendFrameStateToWorker() {
    if (!isVideoRecording || !videoWorker) return;
    videoWorker.postMessage({
        type: 'UPDATE_SCROLL',
        payload: { time: AudioState.context.currentTime - videoStartTime, scrollX: scrollState.x, scrollX2: scrollState.x2 || 0 }
    });
}

// --- SHEET MUSIC RECORDING ---
export function toggleSheetRecording() {
    const btn = elements.recordSheetButton;
    if (isSheetRecording) {
        isSheetRecording = false;
        btn.classList.remove('recording');
        btn.textContent = 'Record 🎼';
        if (sheetNotes.length > 0) processAndRenderSheetMusic();
    } else {
        isSheetRecording = true;
        sheetNotes = [];
        sheetRecordingStartTime = AudioState.context.currentTime;
        btn.classList.add('recording');
        btn.textContent = 'Done 🎼';
    }
}

function processAndRenderSheetMusic() {
    // We defer to sheetRender.js global function.
    // Ideally we should import quantize from there, but the structure provided 
    // keeps render logic in that file. We'll use the quantize provided there if accessible 
    // OR we just pass raw notes. The provided sheetRender.js has `renderProfessionalSheetMusic` which calls `quantizeNotes`.
    // Wait, `quantizeNotes` is internal to sheetRender.js?
    // In the provided file, `quantizeNotes` is a top level function.
    // We need to assume sheetRender.js is loaded in global scope or import it.
    // The HTML imports it as a script. So `renderProfessionalSheetMusic` and `quantizeNotes` are global.
    
    if (window.renderProfessionalSheetMusic && window.quantizeNotes) {
        const quantized = window.quantizeNotes(sheetNotes);
        const canvas = window.renderProfessionalSheetMusic(quantized, document.getElementById('sheet-music-container'));
        if (canvas) {
             const a = document.createElement('a');
             a.href = canvas.toDataURL('image/png');
             a.download = 'Awtsmoos-Sheet-Music.png';
             document.body.appendChild(a);
             a.click();
             a.remove();
        }
    } else {
        alert("Rendering engine not loaded.");
    }
}
