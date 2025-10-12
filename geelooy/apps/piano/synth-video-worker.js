/*
 ב"ה 

B"H 
File: /scripts/awtsmoos/video/synth-video-worker.js
*/

// Import the base worker library (Using the user-specified path)
importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');
console.log("worker loaded")
// --- Global Worker State ---
let workerContext = null;
let lastFrameTime = 0;
const FRAME_RATE = 30; 
const FRAME_DURATION = 1 / FRAME_RATE;
let currentActiveKeys = new Set();
let currentScrollX = 0;
let currentScrollX2 = 0;


// --- Project-Specific Drawing Constants (Improved Styles) ---
const UI_COLOR = {
    // General
    BACKGROUND: 'rgb(20, 20, 20)', 
    BORDER: 'rgba(0, 0, 0, 0.5)',
    KEY_THICKNESS: 0.98, // Keys are slightly thinner than the row height
    
    // White Keys
    WHITE_KEY_BASE: 'rgb(255, 255, 255)',
    WHITE_KEY_HIGHLIGHT: 'rgb(245, 245, 245)',
    ACTIVE_WHITE_BASE: 'rgb(220, 220, 220)',
    ACTIVE_WHITE_HIGHLIGHT: 'rgb(240, 240, 240)',
    
    // Black Keys
    BLACK_KEY_BASE: 'rgb(10, 10, 10)',
    BLACK_KEY_HIGHLIGHT: 'rgb(40, 40, 40)',
    ACTIVE_BLACK_BASE: 'rgb(60, 60, 60)',
    ACTIVE_BLACK_HIGHLIGHT: 'rgb(90, 90, 90)',
    
    // Effects
    ACTIVE_GLOW: 'rgba(0, 123, 255, 0.8)', // Brighter blue flash
    LABEL: 'rgb(0, 0, 0)',
    KEY_HEIGHT_RATIO: 0.6 
};

const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Calculates the full 8-octave layout from the starting C.
 */
function calculateKeyLayout(startOctave, whiteKeyWidth) {
    const layout = [];
    let whiteKeyX = 0;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const baseStartOctave = startOctave;

    for (let oct = baseStartOctave; oct < baseStartOctave + 8; oct++) { 
        NOTE_NAMES_FLAT.forEach(note => { 
            if (oct + (NOTE_NAMES_FLAT.indexOf(note)/12) > 8.5) return; 

            const isBlack = note.includes('b');
            const noteName = (isBlack ? note.replace('b', '#') : note) + oct;

            let keyX;
            if (isBlack) { 
                keyX = whiteKeyX - (blackKeyWidth / 2);
            } else { 
                keyX = whiteKeyX;
                whiteKeyX += whiteKeyWidth;
            } 
            
            layout.push({
                note: noteName,
                isBlack: isBlack,
                x: keyX, 
                width: isBlack ? blackKeyWidth : whiteKeyWidth,
                octave: oct
            });
        }); 
    }
    return { layout, totalWidth: whiteKeyX };
}


/**
 * The core video rendering logic function. It now draws the current state 
 * and waits for the next command.
 */
async function renderCurrentFrame(time, keys, scrollX, scrollX2) {
    
    // Update global state
    currentActiveKeys = new Set(keys);
    currentScrollX = scrollX;
    currentScrollX2 = scrollX2;
    
    // Muxing logic: if time is significantly past lastFrameTime, fill the gap
    const timeDelta = time - lastFrameTime;
    let framesToRender = 1;
    let timePerFrame = timeDelta;

    // Only render extra frames if a large time jump occurred (to fill animation gap)
    if (timeDelta > FRAME_DURATION * 1.5) {
        framesToRender = Math.ceil(timeDelta / FRAME_DURATION);
        timePerFrame = timeDelta / framesToRender;
    }

    // Render the required frames
    for (let i = 0; i < framesToRender; i++) {
        await drawKeyboard();
        const frameTime = lastFrameTime + (i * timePerFrame);
        await workerContext.canvasSource.add(frameTime, timePerFrame);
    }
    
    lastFrameTime = time;
}

/**
 * The actual drawing function that uses the global state.
 */
async function drawKeyboard() {
    // Access context and payload properties
    const { payload, ctx, canvas } = workerContext;
    const { resolution, style, alwaysDual, independentScroll, isVertical, startOctave } = payload;
    
    const isDualView = alwaysDual || isVertical;
    const bottomStartOctave = parseInt(startOctave || 1);
    
    // Calculate dimensions
    const rowHeight = resolution.height / (isDualView ? 2 : 1);
    const totalKeyAreaHeight = rowHeight * UI_COLOR.KEY_THICKNESS;
    const whiteKeyHeight = totalKeyAreaHeight;
    const blackKeyHeight = whiteKeyHeight * UI_COLOR.KEY_HEIGHT_RATIO;
    const { layout: fullKeyboardLayout } = calculateKeyLayout(bottomStartOctave, style.whiteKeyWidth);
    
    // Clear background
    ctx.fillStyle = UI_COLOR.BACKGROUND;
    ctx.fillRect(0, 0, resolution.width, resolution.height);

    // Get the X-position of the C5 key for top row alignment
    const C5_KEY = fullKeyboardLayout.find(k => k.note === `C${bottomStartOctave + 4}`);
    const C5_X_POS = C5_KEY ? C5_KEY.x : 0;
    
    
    const renderKey = (key, keyLayoutX, yStart, rowHeight, isTopRow) => {
        const isActive = currentActiveKeys.has(key.note);
        const width = key.width;
        
        const verticalPadding = (rowHeight - whiteKeyHeight) / 2;
        
        // White Key Y Position (Reference point for black keys)
        let wKeyYPos;
        if (isTopRow) {
            wKeyYPos = yStart + verticalPadding; 
        } else {
            // Keys rest on the bottom of the row area
            wKeyYPos = yStart + rowHeight - whiteKeyHeight - verticalPadding; 
        }

        // Key's actual drawing rectangle
        let keyRectY = wKeyYPos;
        let keyRectH = whiteKeyHeight;
        
        if (key.isBlack) {
            keyRectH = blackKeyHeight;
        }
        
        // Skip if key is entirely off-screen
        if (keyLayoutX + width < 0 || keyLayoutX > resolution.width) return;

        // Draw Order: White Keys first, then Black Keys to ensure Z-index is correct
        if (key.isBlack) {
             // Pass 1: Black Keys
             
             ctx.save();
             ctx.beginPath();
             ctx.rect(keyLayoutX, keyRectY, width, keyRectH);
             ctx.clip(); 
             
             // Key Body Fill
             let baseColor = isActive ? UI_COLOR.ACTIVE_BLACK_BASE : UI_COLOR.BLACK_KEY_BASE;
             let highlightColor = isActive ? UI_COLOR.ACTIVE_BLACK_HIGHLIGHT : UI_COLOR.BLACK_KEY_HIGHLIGHT;
             
             let gradient = ctx.createLinearGradient(keyLayoutX, keyRectY, keyLayoutX, keyRectY + keyRectH);
             gradient.addColorStop(0, highlightColor); 
             gradient.addColorStop(0.9, baseColor); 
             ctx.fillStyle = gradient;
             ctx.fill();

             // Active Light
             if (isActive) {
                 ctx.fillStyle = UI_COLOR.ACTIVE_GLOW;
                 ctx.fillRect(keyLayoutX, keyRectY + keyRectH - 8, width, 8); 
             }
             
             ctx.restore();
             
        } else {
            // Pass 2: White Keys
            
            ctx.save();
            ctx.beginPath();
            ctx.rect(keyLayoutX, keyRectY, width, keyRectH);
            ctx.clip(); 

            // Key Body Fill
            let baseColor = isActive ? UI_COLOR.ACTIVE_WHITE_BASE : UI_COLOR.WHITE_KEY_BASE;
            let highlightColor = isActive ? UI_COLOR.ACTIVE_WHITE_HIGHLIGHT : UI_COLOR.WHITE_KEY_HIGHLIGHT;
            
            let gradient = ctx.createLinearGradient(keyLayoutX, keyRectY, keyLayoutX, keyRectY + keyRectH);
            gradient.addColorStop(0, highlightColor); 
            gradient.addColorStop(0.9, baseColor); 
            ctx.fillStyle = gradient;
            ctx.fill();

            // Border/Shadow
            ctx.strokeStyle = UI_COLOR.BORDER;
            ctx.lineWidth = 1;
            ctx.strokeRect(keyLayoutX, keyRectY, width, keyRectH);
            
            // Key Label
            ctx.fillStyle = UI_COLOR.LABEL;
            ctx.font = `24px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(key.note, keyLayoutX + width / 2, wKeyYPos + whiteKeyHeight - 10);
            
            ctx.restore();
        }
    };

    // --- DRAW LOGIC: The loop must run twice to handle Z-index (White then Black) ---

    const yStartBottom = isDualView ? rowHeight : 0; 

    // --- PASS 1: WHITE KEYS ---
    fullKeyboardLayout.forEach(key => {
        if (key.isBlack) return;
        const keyLayoutX = key.x - currentScrollX;
        renderKey(key, keyLayoutX, yStartBottom, rowHeight, false); // Bottom White

        if (isDualView) {
            const actualTopScroll = independentScroll ? currentScrollX2 : currentScrollX;
            const drawOffset = C5_X_POS - actualTopScroll;
            const keyOctave = parseInt(key.note.match(/\d+/g));
            
            if (keyOctave >= bottomStartOctave + 4) {
                 const keyLayoutX = key.x - drawOffset;
                 renderKey(key, keyLayoutX, 0, rowHeight, true); // Top White
            }
        }
    });

    // --- PASS 2: BLACK KEYS ---
    fullKeyboardLayout.forEach(key => {
        if (!key.isBlack) return;
        const keyLayoutX = key.x - currentScrollX;
        renderKey(key, keyLayoutX, yStartBottom, rowHeight, false); // Bottom Black

        if (isDualView) {
            const actualTopScroll = independentScroll ? currentScrollX2 : currentScrollX;
            const drawOffset = C5_X_POS - actualTopScroll;
            const keyOctave = parseInt(key.note.match(/\d+/g));
            
            if (keyOctave >= bottomStartOctave + 4) {
                 const keyLayoutX = key.x - drawOffset;
                 renderKey(key, keyLayoutX, 0, rowHeight, true); // Top Black
            }
        }
    });


    // Separator line (Drawn between the two passes for correct Z-index)
    if (isDualView) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, rowHeight);
        ctx.lineTo(resolution.width, rowHeight);
        ctx.stroke();
    }
}


/**
 * The main bootstrap function for the worker.
 */
function initializeSynthWorker(workerLogic, options = {}) {
console.log("about to start loading")
    self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'awtsmoosing...' } });
    
  //  return;
    if (typeof self !== 'undefined' && self.importScripts) {

        const libraryPath = options.libraryPath || './mediabunny-library.js';
        self.AudioBuffer = createAudioBufferPolyfill();

        let mediabunny = null;
        try {
            self.exports = {};
            self.importScripts(libraryPath);
            mediabunny = self.exports;
            
            if (typeof mediabunny === 'undefined' || !mediabunny.Output) {
                throw new Error("Mediabunny library failed to load or expose 'Output' class.");
            }
        } catch (e) {
            self.postMessage({
                type: 'FATAL_ERROR',
                payload: { message: `FATAL: Could not load mediabunny library from ${libraryPath}.`, error: e }
            });
            return;
        }
        console.log("passed media Bunny", mediabunny)

        self.onmessage = async (event) => {
            const data = event.data;
            console.log("days",data)
            
            if (data.type === 'INITIALIZE_RENDERER') {
                const payload = data.payload;
                const { resolution } = payload;
                
                // Initialization (Same logic as provided working structure)
                try {
                    self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Initializing video encoder...' } });

                    const output = new mediabunny.Output({ format: new mediabunny.Mp4OutputFormat(), target: new mediabunny.BufferTarget() });
                    
                    // --- CRITICAL MIRRORING: ORIGINAL VIDEO CODEC NEGOTIATION ---
                    let videoCodec = 'avc1.42001E'; 
                    try {
                        videoCodec = await mediabunny.getFirstEncodableVideoCodec(output.format.getSupportedVideoCodecs(), { width: resolution.width, height: resolution.height });
                    } catch (e) { 
                        console.warn("Codec check failed, using default (which previously caused an error).", e.message); 
                    }
                    
                    const renderCanvas = new OffscreenCanvas(resolution.width, resolution.height);
                    const ctx = renderCanvas.getContext('2d', { alpha: false });
                    const canvasSource = new mediabunny.CanvasSource(renderCanvas, { codec: videoCodec, bitrate: 4_000_000 });
                    output.addVideoTrack(canvasSource);
                    
                    await output.start();
                    
                    workerContext = new RenderingContext(payload, output, canvasSource, null, renderCanvas, ctx);

                    self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Renderer Ready.' } });

                } catch (e) {
                    self.postMessage({ type: 'FATAL_ERROR', payload: { message: `Worker initialization failed: ${e.message}`, error: e } });
                }

            } else if (data.type === 'RENDER_FRAME' && workerContext) {
                // Real-time rendering
                const { time, keys, scrollX, scrollX2 } = data.payload;
                await renderCurrentFrame(time, keys, scrollX, scrollX2);
                
            } else if (data.type === 'FINALIZE_MUXING' && workerContext) {
                const { audioBufferShim } = data.payload;
                
                try {
                    // --- VIDEO TRACK COMPLETION ---
                    const totalDuration = audioBufferShim.duration;
                    const timeRemaining = totalDuration - lastFrameTime;
                    console.log("setting up")
                    if (timeRemaining > 0.001) { 
                        await drawKeyboard(); 
                        await workerContext.canvasSource.add(lastFrameTime, timeRemaining);
                    }
                    workerContext.canvasSource.close();
                    console.log("drawn")
                    self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Initializing Audio Encoder...' } });
                    
                    // 2. AUDIO TRACK SETUP AND MUXING (The original batch method)
                    self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Initializing Audio Encoder...' } });
                    
                    const audioBufferSource = new mediabunny.AudioBufferSource({});
                    const finalAudioBufferShim = new self.AudioBuffer(audioBufferShim);
                    
                    // --- CRITICAL MIRRORING: ORIGINAL AUDIO CODEC NEGOTIATION ---
                    let audioCodec = 'aac'; 
                    try {
                        audioCodec = await mediabunny.getFirstEncodableAudioCodec(workerContext.output.format.getSupportedAudioCodecs(), finalAudioBufferShim);
                    } catch (e) {
                         // The fallback must be retained for non-hanging operation
                         console.warn(`Audio Codec negotiation failed: ${e.message}. Using default 'aac'.`);
                         audioCodec = 'aac'; 
                    }

                    audioBufferSource.codec = audioCodec;
                    
                    // This is the key: The AudioTrack is ADDED NOW, right before encoding
                    workerContext.output.addAudioTrack(audioBufferSource); 
                    
                    
                    
                    self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Encoding audio...' } });
                    
                    // --- THE HANG FIX: Adding audio as a single, batch operation ---
                    console.log("adding")
                    await audioBufferSource.add(finalAudioBufferShim); 
                    console.log("added")
                    audioBufferSource.close();
                    console.log("closed")
                    self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Finalizing video file...' } });
                    await workerContext.output.finalize();

                    self.postMessage({ 
                        type: 'VIDEO_COMPLETE', 
                        payload: { 
                            blob: new Blob([workerContext.output.target.buffer], { 
                                type: workerContext.output.format.mimeType 
                            }) 
                        } 
                    });

                } catch (e) {
                    self.postMessage({ type: 'FATAL_ERROR', payload: { message: `Finalization failed: ${e.message}`, error: e } });
                }
            }
        };

    } else {
        console.error("bootstrapMediabunnyWorker must be run in a Web Worker environment.");
    }
}


// Expose the bootstrap function globally 
if (typeof self !== 'undefined') {
	//self.bootstrapMediabunnyWorker = bootstrapMediabunnyWorker;
    // Call bootstrap with the project-specific logic
    console.log("have self",self,"about to call boot")
    initializeSynthWorker(renderCurrentFrame, {
        libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' // Use the correct library path
    });
} else {console.log("no self")}

console.log("end of worker")