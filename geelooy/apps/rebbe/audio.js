//B"H
// audio.js - Audio Engine with CORS Fallback

let ctx = null;
let audio = null;
let analyser = null;
let sourceNode = null;
let callbacks = {};
let mode = 'HiFi'; // 'HiFi' (Visuals) or 'Stream' (No Visuals)

function initCtx() {
    if(ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
}

export function setCallbacks(cbs) {
    callbacks = cbs;
}

export function playUrl(url) {
    initCtx();
    
    // Reset
    if(audio) {
        audio.pause();
        audio.src = '';
    }
    if(sourceNode) {
        try { sourceNode.disconnect(); } catch(e){}
    }
    if(ctx.state === 'suspended') ctx.resume();

    // Create new audio element for every track to clear strict CORS locks
    audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.src = url;

    setupEvents(audio);

    // Try to connect to Web Audio API
    // If CORS fails here, it throws immediately or on play
    try {
        sourceNode = ctx.createMediaElementSource(audio);
        sourceNode.connect(analyser);
        analyser.connect(ctx.destination);
        mode = 'HiFi';
    } catch(e) {
        console.warn("CORS Restricted. Switching to Stream Mode.", e);
        // Fallback: Just play through the element, no Analyser connection
        // The browser handles routing to speakers automatically for Audio elements not connected to graph
        mode = 'Stream';
    }

    const playPromise = audio.play();
    if(playPromise) {
        playPromise.catch(e => {
            console.error("Playback Error:", e);
            if(e.name === "NotSupportedError" || e.message.includes("CORS") || e.message.includes("source")) {
                 // Final fallback attempt: Remove crossorigin attribute and try again
                 // This forces the browser to treat it as an opaque response
                 console.log("Retrying in Opaque Mode...");
                 audio.crossOrigin = null; 
                 audio.src = url;
                 audio.play();
                 mode = 'Stream';
            }
        });
    }
}

export function playBlob(blob) {
    initCtx();
    if(audio) audio.pause();
    
    const url = URL.createObjectURL(blob);
    audio = new Audio();
    // Blobs are local, so CORS is fine
    sourceNode = ctx.createMediaElementSource(audio);
    sourceNode.connect(analyser);
    analyser.connect(ctx.destination);
    mode = 'HiFi';
    
    setupEvents(audio);
    audio.src = url;
    audio.play();
}

function setupEvents(aud) {
    aud.ontimeupdate = () => {
        if(callbacks.onUpdate) callbacks.onUpdate(aud.currentTime, aud.duration || 0);
    };
    aud.onended = () => {
        if(callbacks.onEnd) callbacks.onEnd();
    };
    aud.onerror = (e) => {
        console.error("Audio Object Error", e);
        if(callbacks.onError) callbacks.onError();
    };
}

export function togglePlay() {
    if(!audio) return;
    if(audio.paused) audio.play();
    else audio.pause();
}

export function seek(pct) {
    if(!audio) return;
    if(Number.isFinite(audio.duration)) {
        audio.currentTime = pct * audio.duration;
    }
}

export function isPlaying() {
    return audio && !audio.paused;
}

export function getFreqData() {
    const arr = new Uint8Array(128);
    
    if (mode === 'HiFi' && analyser) {
        analyser.getByteFrequencyData(arr);
    } else if (mode === 'Stream' && isPlaying()) {
        // SYNTHETIC VISUALIZATION
        // Generate fake beat data based on time to keep the visualizer alive
        const t = performance.now() / 1000;
        const beat = Math.sin(t * 10) * 0.5 + 0.5; // Simulate bass
        const hihat = Math.random() * 0.5;
        
        for(let i=0; i<128; i++) {
            if(i < 10) arr[i] = beat * 200; // Bass range
            else if(i > 100) arr[i] = hihat * 100; // Treble
            else arr[i] = Math.max(0, beat * 100 - i);
        }
    }
    
    return arr;
}