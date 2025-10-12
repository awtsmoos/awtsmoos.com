/*
 ב"ה 

B"H 
File: /scripts/awtsmoos/video/synth-video-worker.js
*/

// Import the base worker library
importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global Worker State ---
let workerContext = null;
let lastFrameTime = 0;
const FRAME_RATE = 30; 
const FRAME_DURATION = 1 / FRAME_RATE;
let currentActiveKeys = new Set();
let currentScrollX = 0;
let currentScrollX2 = 0;


// --- Project-Specific Drawing Constants (Same as previous step, good styles) ---
const UI_COLOR = {
    BACKGROUND: 'rgb(20, 20, 20)', 
    BORDER: 'rgba(0, 0, 0, 0.5)',
    KEY_THICKNESS: 0.98, 
    WHITE_KEY_BASE: 'rgb(255, 255, 255)',
    WHITE_KEY_HIGHLIGHT: 'rgb(245, 245, 245)',
    ACTIVE_WHITE_BASE: 'rgb(220, 220, 220)',
    ACTIVE_WHITE_HIGHLIGHT: 'rgb(240, 240, 240)',
    BLACK_KEY_BASE: 'rgb(10, 10, 10)',
    BLACK_KEY_HIGHLIGHT: 'rgb(40, 40, 40)',
    ACTIVE_BLACK_BASE: 'rgb(60, 60, 60)',
    ACTIVE_BLACK_HIGHLIGHT: 'rgb(90, 90, 90)',
    ACTIVE_GLOW: 'rgba(0, 123, 255, 0.8)', 
    LABEL: 'rgb(0, 0, 0)',
    KEY_HEIGHT_RATIO: 0.6 
};

const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Function to pre-calculate all key positions (UNCHANGED)
function calculateKeyLayout(startOctave, whiteKeyWidth) {
    // ... (logic is the same, calculates 8 octaves) ...
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
    const { payload, canvasSource, ctx, canvas } = workerContext;
    const { resolution, style, alwaysDual, independentScroll, isVertical, startOctave } = payload;
    
    const isDualView = alwaysDual || isVertical;
    const bottomStartOctave = parseInt(startOctave || 1);
    
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
        
        let wKeyYPos;
        if (isTopRow) {
            wKeyYPos = yStart + verticalPadding; 
        } else {
            wKeyYPos = yStart + rowHeight - whiteKeyHeight - verticalPadding; 
        }

        let keyRectY = wKeyYPos;
        let keyRectH = whiteKeyHeight;
        
        if (key.isBlack) {
            keyRectH = blackKeyHeight;
        }
        
        // Skip if key is entirely off-screen
        if (keyLayoutX + width < 0 || keyLayoutX > resolution.width) return;

        ctx.save();
        ctx.beginPath();
        ctx.rect(keyLayoutX, keyRectY, width, keyRectH);
        ctx.clip(); 

        // Key Body Fill
        let baseColor, highlightColor;
        if (key.isBlack) {
            baseColor = isActive ? UI_COLOR.ACTIVE_BLACK_BASE : UI_COLOR.BLACK_KEY_BASE;
            highlightColor = isActive ? UI_COLOR.ACTIVE_BLACK_HIGHLIGHT : UI_COLOR.BLACK_KEY_HIGHLIGHT;
        } else {
            baseColor = isActive ? UI_COLOR.ACTIVE_WHITE_BASE : UI_COLOR.WHITE_KEY_BASE;
            highlightColor = isActive ? UI_COLOR.ACTIVE_WHITE_HIGHLIGHT : UI_COLOR.WHITE_KEY_HIGHLIGHT;
        }
        
        let gradient = ctx.createLinearGradient(keyLayoutX, keyRectY, keyLayoutX, keyRectY + keyRectH);
        gradient.addColorStop(0, highlightColor); 
        gradient.addColorStop(0.9, baseColor); 
        ctx.fillStyle = gradient;
        ctx.fill();

        // Border/Shadow
        if (!key.isBlack) {
            ctx.strokeStyle = UI_COLOR.BORDER;
            ctx.lineWidth = 1;
            ctx.strokeRect(keyLayoutX, keyRectY, width, keyRectH);
        }
        
        // Active Light
        if (isActive) {
            ctx.fillStyle = UI_COLOR.ACTIVE_GLOW;
            ctx.fillRect(keyLayoutX, keyRectY + keyRectH - 8, width, 8); 
        }
        
        // Key Label
        if (!key.isBlack) { 
            ctx.fillStyle = UI_COLOR.LABEL;
            ctx.font = `24px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(key.note, keyLayoutX + width / 2, wKeyYPos + whiteKeyHeight - 10);
        }
        
        ctx.restore();
    };


    // --- DRAW BOTTOM/SINGLE KEYBOARD (Logical Index 0) ---
    const scrollX0 = currentScrollX;
    const yStartBottom = isDualView ? rowHeight : 0; 
    
    fullKeyboardLayout.forEach(key => {
        const keyLayoutX = key.x - scrollX0;
        renderKey(key, keyLayoutX, yStartBottom, rowHeight, false);
    });

    // --- DRAW TOP KEYBOARD (Logical Index 1) ---
    if (isDualView) {
         const scrollX1 = currentScrollX2;
         const yStartTop = 0; 
         
         const actualTopScroll = independentScroll ? scrollX1 : scrollX0;
         const drawOffset = C5_X_POS - actualTopScroll;

         fullKeyboardLayout.forEach(key => {
             const keyOctave = parseInt(key.note.match(/\d+/g));
             
             if (keyOctave >= bottomStartOctave + 4) {
                 const keyLayoutX = key.x - drawOffset;
                 renderKey(key, keyLayoutX, yStartTop, rowHeight, true); 
             }
         });

         // Separator line
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
function bootstrapMediabunnyWorker(workerLogic, options = {}) {
    // ... (This function is the same as the base worker, but we modify self.onmessage)
    // to handle the new messaging structure.
    
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

        self.onmessage = async (event) => {
            const data = event.data;
            
            if (data.type === 'INITIALIZE_RENDERER') {
                const payload = data.payload;
                const { resolution } = payload;
                
                // Initialize the Muxer and Context (same as the old START_RENDERING logic)
                try {
                    self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Initializing video encoder...' } });

                    const output = new mediabunny.Output({ format: new mediabunny.Mp4OutputFormat(), target: new mediabunny.BufferTarget() });
                    let videoCodec = 'avc1.42001E'; 
                    try {
                        videoCodec = await mediabunny.getFirstEncodableVideoCodec(output.format.getSupportedVideoCodecs(), { width: resolution.width, height: resolution.height });
                    } catch (e) { console.warn("Codec check failed, using default.", e.message); }

                    const renderCanvas = new OffscreenCanvas(resolution.width, resolution.height);
                    const ctx = renderCanvas.getContext('2d', { alpha: false });
                    const canvasSource = new mediabunny.CanvasSource(renderCanvas, { codec: videoCodec, bitrate: 4_000_000 });
                    output.addVideoTrack(canvasSource);
                    
                    await output.start();
                    
                    // Create the persistent worker context
                    workerContext = new RenderingContext(payload, output, canvasSource, null, renderCanvas, ctx);

                    self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Renderer Ready.' } });

                } catch (e) {
                    self.postMessage({ type: 'FATAL_ERROR', payload: { message: `Worker initialization failed: ${e.message}`, error: e } });
                }

            } else if (data.type === 'RENDER_FRAME' && workerContext) {
                // Real-time rendering: only update the frame using current state
                const { time, keys, scrollX, scrollX2 } = data.payload;
                await renderCurrentFrame(time, keys, scrollX, scrollX2);
                
            } else if (data.type === 'FINALIZE_MUXING' && workerContext) {
                // Finalization: Mux audio and close file
                const { audioBufferShim } = data.payload;
                
                try {
                const totalDuration = audioBufferShim.duration;
                    const timeRemaining = totalDuration - lastFrameTime;
                    if (timeRemaining > 0.001) { 
                        // Render the last known visual state (already in global state)
                        // This fills the time gap between the last key press/scroll and the audio end.
                        await drawKeyboard(); 
                        await workerContext.canvasSource.add(lastFrameTime, timeRemaining);
                    }
                    // Now, close the video source, signaling to the muxer that the video track is complete.
                    workerContext.canvasSource.close();
                    
                    
                    ;
                    
                    // Audio Muxing
                    const audioBufferSource = new mediabunny.AudioBufferSource({});
                    const finalAudioBufferShim = new self.AudioBuffer(audioBufferShim);
                    
                    const audioCodec = await mediabunny.getFirstEncodableAudioCodec(workerContext.output.format.getSupportedAudioCodecs(), finalAudioBufferShim);
                    audioBufferSource.codec = audioCodec;
                    workerContext.output.addAudioTrack(audioBufferSource); // Add track now that we have the codec
                    
                    self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Encoding audio...' } });
                    await audioBufferSource.add(finalAudioBufferShim);
                    
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
	self.bootstrapMediabunnyWorker = bootstrapMediabunnyWorker;
    // Call bootstrap with the project-specific logic
    self.bootstrapMediabunnyWorker(renderCurrentFrame, {
        libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' 
    });
}