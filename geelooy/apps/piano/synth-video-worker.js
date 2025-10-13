/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: A complete redesign of the rendering logic to use a state-machine approach. This is the most
             robust method. It builds a timeline of all discrete events (key down, key up, scroll),
             processes them in order, and renders a frame for the exact duration each keyboard state
             is maintained. This guarantees every single key press and release is rendered correctly.
VERSION 53.0 - The "State-Machine Accuracy" Build
*/

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State & Constants (Unchanged) ---
let keyPressHistory = [];
let scrollHistory = [];
let workerConfig = null;
let masterKeyboardLayout = null;
let keyCache = {};
let particles = [];
let starfield = [];
let baseOffset_Bottom = 0;
let baseOffset_Top = 0;
const UI_STYLE = { BACKGROUND_COLOR: '#000000', GRID_COLOR: 'rgba(0, 150, 255, 0.1)', STAR_COLOR: 'rgba(220, 235, 255, 0.8)', WHITE_KEY_FILL: '#dfe2e8', WHITE_KEY_AO: 'rgba(0, 0, 0, 0.25)', BLACK_KEY_FILL: '#121317', BLACK_KEY_HIGHLIGHT: 'rgba(255, 255, 255, 0.1)', ACTIVE_KEY_BASE_COLOR: '#00ffff', ACTIVE_KEY_GLOW_COLOR: 'rgba(0, 255, 255, 0.7)', SHOCKWAVE_COLOR: 'rgba(0, 255, 255, 0.6)', PARTICLE_COLOR: '#ffffff', TOUCH_POINT_COLOR: 'rgba(0, 255, 255, 0.9)', LABEL_COLOR_WHITE_KEY: '#707080', LABEL_COLOR_BLACK_KEY: '#a0a0b0', ACTIVE_LABEL_COLOR: '#000000' };
const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MIDI_NOTE_START = 21;
const MIDI_NOTE_END = 108;

// --- Utility Functions (Unchanged) ---
function calculateMasterLayout(whiteKeyWidth) {
    const layout = new Map();
    let whiteKeyX = 0;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    for (let midi = MIDI_NOTE_START; midi <= MIDI_NOTE_END; midi++) {
        const octave = Math.floor(midi / 12) - 1;
        const note = NOTE_NAMES_SHARP[midi % 12];
        const noteName = note + octave;
        const isBlack = note.includes('#');
        const x = isBlack ? whiteKeyX - (blackKeyWidth / 2) : whiteKeyX;
        layout.set(noteName, { note: noteName, isBlack, x, width: isBlack ? blackKeyWidth : whiteKeyWidth });
        if (!isBlack) { whiteKeyX += whiteKeyWidth; }
    }
    return layout;
}
function cacheKeyRenders(whiteKeyWidth, whiteKeyHeight) { const blackKeyWidth = whiteKeyWidth * 0.6, blackKeyHeight = whiteKeyHeight * 0.65; const wCanvas = new OffscreenCanvas(whiteKeyWidth, whiteKeyHeight); const wCtx = wCanvas.getContext('2d'); wCtx.fillStyle = UI_STYLE.WHITE_KEY_FILL; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight); const aoGradient = wCtx.createLinearGradient(0, 0, whiteKeyWidth, 0); aoGradient.addColorStop(0, UI_STYLE.WHITE_KEY_AO); aoGradient.addColorStop(0.1, 'transparent'); aoGradient.addColorStop(0.9, 'transparent'); aoGradient.addColorStop(1, UI_STYLE.WHITE_KEY_AO); wCtx.fillStyle = aoGradient; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight); keyCache['white_default'] = wCanvas; const bCanvas = new OffscreenCanvas(blackKeyWidth, blackKeyHeight); const bCtx = bCanvas.getContext('2d'); bCtx.fillStyle = UI_STYLE.BLACK_KEY_FILL; bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight); keyCache['black_default'] = bCanvas; }
function createParticles(x, y) { for (let i = 0; i < 80; i++) { const angle = Math.random() * Math.PI * 2; const speed = Math.random() * 250 + 75; particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: Math.random() * 2.0 + 0.8, initialLife: -1, radius: Math.random() * 2.5 + 1 }); } }


// --- Frame Drawing Function (Simplified) ---
// This function is now "dumber" and more reliable. It no longer calculates state,
// it just draws the state that is passed to it from the main rendering loop.
function drawKeyboardFrame(workerContext, framePayload) {
    const { payload: config, ctx } = workerContext;
    // The state for this frame is passed directly in the payload
    const { time, duration: deltaTime, activeKeys, scrollX, scrollX2 } = framePayload;

    const finalScroll_Bottom = baseOffset_Bottom + scrollX;
    const finalScroll_Top = baseOffset_Top + (config.independentScroll ? scrollX2 : scrollX);

    ctx.fillStyle = UI_STYLE.BACKGROUND_COLOR; ctx.fillRect(0, 0, config.resolution.width, config.resolution.height);
    starfield.forEach(star => { star.y += star.speed * deltaTime; if (star.y > config.resolution.height) { star.y = 0; star.x = Math.random() * config.resolution.width; } });
    ctx.fillStyle = UI_STYLE.STAR_COLOR; starfield.forEach(star => ctx.fillRect(star.x, star.y, star.size, star.size));
    ctx.save();
    const zoomFactor = config.resolution.width / config.style.userViewportWidth;
    ctx.scale(zoomFactor, zoomFactor);
    const isDualView = config.alwaysDual || config.isVertical;
    const unscaledRowHeight = (config.resolution.height / zoomFactor) / (isDualView ? 2 : 1);
    
    const renderKey = (key, keyScreenX, yStart) => {
        const isActive = activeKeys.has(key.note);
        const pressAnimation = isActive ? 1.0 : 0.0; // Direct state, no interpolation

        const whiteKeyHeight = unscaledRowHeight * 0.95, blackKeyHeight = whiteKeyHeight * 0.65;
        const pressDepth = pressAnimation * 4, yPos = yStart + (key.isBlack ? 0 : unscaledRowHeight - whiteKeyHeight), height = key.isBlack ? blackKeyHeight : whiteKeyHeight;
        ctx.drawImage(keyCache[`${key.isBlack ? 'black' : 'white'}_default`], keyScreenX, yPos + pressDepth);
        if (pressAnimation > 0) { ctx.fillStyle = UI_STYLE.ACTIVE_KEY_BASE_COLOR; ctx.fillRect(keyScreenX, yPos + pressDepth, key.width, height); }
        ctx.font = `bold ${config.style.userKeyWidth * 0.22}px sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = isActive ? UI_STYLE.ACTIVE_LABEL_COLOR : (key.isBlack ? UI_STYLE.LABEL_COLOR_BLACK_KEY : UI_STYLE.LABEL_COLOR_WHITE_KEY);
        if (key.isBlack) { ctx.textBaseline = 'middle'; ctx.fillText(key.note.slice(0, -1), keyScreenX + key.width / 2, yPos + height * 0.8); } else { ctx.textBaseline = 'bottom'; ctx.fillText(key.note, keyScreenX + key.width / 2, yStart + unscaledRowHeight - (unscaledRowHeight * 0.05)); }
    };
    
    const renderRow = (layout, yStart, scroll) => { if (!layout) return; ['white', 'black'].forEach(type => { layout.forEach(key => { if ((type === 'black') === key.isBlack) { const keyScreenX = key.x - scroll; if (keyScreenX + key.width > 0 && keyScreenX < config.style.userViewportWidth) renderKey(key, keyScreenX, yStart); } }); }); };
    renderRow(masterKeyboardLayout, isDualView ? unscaledRowHeight : 0, finalScroll_Bottom);
    if (isDualView) renderRow(masterKeyboardLayout, 0, finalScroll_Top);
    ctx.restore();
}

// --- Main Worker Control Logic ---
self.onmessage = async (e) => {
    const { type, payload } = e.data;
    switch (type) {
        // STAGE 1: Collect all event data (Unchanged)
        case 'INITIALIZE_RENDERER':
            workerConfig = payload;
            scrollHistory = [{ time: 0, scrollX: payload.initialScrollX, scrollX2: payload.initialScrollX2 }];
            keyPressHistory = [];
            break;
        case 'ADD_KEY_EVENT':
            keyPressHistory.push(payload);
            break;
        case 'UPDATE_SCROLL':
            scrollHistory.push(payload);
            break;

        // STAGE 2: Build and render the video using the new state-machine method.
        case 'FINALIZE_MUXING':
            if (!workerConfig) { console.error("Worker not initialized!"); return; }

            const renderer = new MediaBunnyBase(workerConfig, drawKeyboardFrame, { libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' });
            await renderer.start();
            
            masterKeyboardLayout = calculateMasterLayout(workerConfig.style.userKeyWidth);
            
            const uiStartOctave = parseInt(workerConfig.startOctave);
            baseOffset_Bottom = masterKeyboardLayout.get(`C${uiStartOctave}`)?.x || 0;
            if (workerConfig.independentScroll) {
                baseOffset_Top = masterKeyboardLayout.get(`C${uiStartOctave + 4}`)?.x || 0;
            } else {
                baseOffset_Top = baseOffset_Bottom - workerConfig.style.userViewportWidth;
            }

            const zoomFactor = workerConfig.resolution.width / workerConfig.style.userViewportWidth;
            const unscaledRowHeight = (workerConfig.resolution.height / zoomFactor) / ((workerConfig.alwaysDual || workerConfig.isVertical) ? 2 : 1);
            cacheKeyRenders(workerConfig.style.userKeyWidth, unscaledRowHeight * 0.95);
            for (let i = 0; i < 600; i++) starfield.push({ x: Math.random() * workerConfig.resolution.width, y: Math.random() * workerConfig.resolution.height, speed: Math.random() * 20 + 5, size: Math.random() * 2 + 0.5 });
            
            // ================== NEW STATE-MACHINE RENDER LOGIC ==================
            
            // 1. Deconstruct all histories into a single, unified timeline of events.
            const events = [];
            keyPressHistory.forEach(k => {
                events.push({ time: k.start, type: 'KEY_DOWN', note: k.note });
                events.push({ time: k.end, type: 'KEY_UP', note: k.note });
            });
            scrollHistory.forEach(s => {
                events.push({ time: s.time, type: 'SCROLL_UPDATE', scrollX: s.scrollX, scrollX2: s.scrollX2 });
            });
            
            // 2. Sort the timeline chronologically. This is the master sequence of changes.
            events.sort((a, b) => a.time - b.time);
            
            // 3. Initialize the starting state of the keyboard.
            let lastTime = 0;
            const currentState = {
                activeKeys: new Set(),
                scrollX: workerConfig.initialScrollX,
                scrollX2: workerConfig.initialScrollX2
            };

            // 4. Process the timeline event by event.
            for (const event of events) {
                const eventTime = event.time;
                // Calculate the duration the previous state was held.
                const duration = eventTime - lastTime;

                // If the state was held for a positive amount of time, render a frame for it.
                if (duration > 0.00001) { // Use a small epsilon to avoid zero-duration frames
                    await renderer.addFrame({
                        time: lastTime,
                        duration: duration,
                        // Pass a copy of the state to the drawing function
                        activeKeys: new Set(currentState.activeKeys),
                        scrollX: currentState.scrollX,
                        scrollX2: currentState.scrollX2
                    });
                }
                
                // Now, update the state based on the current event.
                switch(event.type) {
                    case 'KEY_DOWN':
                        currentState.activeKeys.add(event.note);
                        break;
                    case 'KEY_UP':
                        currentState.activeKeys.delete(event.note);
                        break;
                    case 'SCROLL_UPDATE':
                        currentState.scrollX = event.scrollX;
                        currentState.scrollX2 = event.scrollX2;
                        break;
                }
                
                // Move the timeline forward.
                lastTime = eventTime;
            }
            
            // 5. Render the final frame, from the last event to the end of the audio.
            const finalAudioDuration = payload.audioBufferShim.duration;
            if (finalAudioDuration > lastTime) {
                await renderer.addFrame({
                    time: lastTime,
                    duration: finalAudioDuration - lastTime,
                    activeKeys: new Set(currentState.activeKeys),
                    scrollX: currentState.scrollX,
                    scrollX2: currentState.scrollX2
                });
            }
            
            // ======================= END OF NEW LOGIC ========================

            const blob = await renderer.finalize(payload.audioBufferShim);
            renderer._postComplete(blob, { download: true, fileName: `BH-WebSynth-Video-${Date.now()}.mp4` });
            break;
    }
};