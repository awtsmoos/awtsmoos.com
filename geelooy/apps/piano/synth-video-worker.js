/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: This is the definitive, timing-accurate build. It fixes a critical flaw in how
             simultaneous events (e.g., a key up and key down at the exact same timestamp) were
             processed. The new logic groups all events at a single point in time, renders the
             state LEADING UP TO that time, and only then updates the state. This guarantees
             no visual state changes are ever skipped, ensuring perfect sync.
VERSION 55.0 - The "Simultaneous Event" Definitive Build
*/

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State & Constants (Unchanged) ---
let keyPressHistory = [];
let scrollHistory = [];
let workerConfig = null;
let masterKeyboardLayout = null;
let keyCache = {};
let starfield = [];
let baseOffset_Bottom = 0;
let baseOffset_Top = 0;
const UI_STYLE = { BACKGROUND_COLOR: '#000000', STAR_COLOR: 'rgba(220, 235, 255, 0.8)', WHITE_KEY_FILL: '#dfe2e8', WHITE_KEY_AO: 'rgba(0, 0, 0, 0.25)', BLACK_KEY_FILL: '#121317', ACTIVE_KEY_BASE_COLOR: '#00ffff', LABEL_COLOR_WHITE_KEY: '#707080', LABEL_COLOR_BLACK_KEY: '#a0a0b0', ACTIVE_LABEL_COLOR: '#000000' };
const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MIDI_NOTE_START = 21;
const MIDI_NOTE_END = 108;

// --- Utility Functions (Unchanged) ---
function calculateMasterLayout(whiteKeyWidth) {
    const layout = new Map();
    let whiteKeyX = 0;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    for (let midi = MIDI_NOTE_START; midi <= MIDI_NOTE_END; midi++) {
        const noteName = NOTE_NAMES_SHARP[midi % 12] + (Math.floor(midi / 12) - 1);
        const isBlack = noteName.includes('#');
        const x = isBlack ? whiteKeyX - (blackKeyWidth / 2) : whiteKeyX;
        layout.set(noteName, { note: noteName, isBlack, x, width: isBlack ? blackKeyWidth : whiteKeyWidth });
        if (!isBlack) { whiteKeyX += whiteKeyWidth; }
    }
    return layout;
}
function cacheKeyRenders(whiteKeyWidth, whiteKeyHeight) { const blackKeyWidth = whiteKeyWidth * 0.6, blackKeyHeight = whiteKeyHeight * 0.65; const wCanvas = new OffscreenCanvas(whiteKeyWidth, whiteKeyHeight); const wCtx = wCanvas.getContext('2d'); wCtx.fillStyle = UI_STYLE.WHITE_KEY_FILL; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight); const aoGradient = wCtx.createLinearGradient(0, 0, whiteKeyWidth, 0); aoGradient.addColorStop(0, UI_STYLE.WHITE_KEY_AO); aoGradient.addColorStop(0.1, 'transparent'); aoGradient.addColorStop(0.9, 'transparent'); aoGradient.addColorStop(1, UI_STYLE.WHITE_KEY_AO); wCtx.fillStyle = aoGradient; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight); keyCache['white_default'] = wCanvas; const bCanvas = new OffscreenCanvas(blackKeyWidth, blackKeyHeight); const bCtx = bCanvas.getContext('2d'); bCtx.fillStyle = UI_STYLE.BLACK_KEY_FILL; bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight); keyCache['black_default'] = bCanvas; }


// --- Frame Drawing Function (Unchanged) ---
function drawKeyboardFrame(workerContext, framePayload) {
    const { payload: config, ctx } = workerContext;
    const { duration: deltaTime, activeKeys, scrollX, scrollX2 } = framePayload;
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
        const pressAnimation = isActive ? 1.0 : 0.0;
        const whiteKeyHeight = unscaledRowHeight * 0.95, blackKeyHeight = whiteKeyHeight * 0.65;
        const pressDepth = pressAnimation * 4, yPos = yStart + (key.isBlack ? 0 : unscaledRowHeight - whiteKeyHeight), height = key.isBlack ? blackKeyHeight : whiteKeyHeight;
        ctx.drawImage(keyCache[`${key.isBlack ? 'black' : 'white'}_default`], keyScreenX, yPos + pressDepth);
        if (pressAnimation > 0) { ctx.fillStyle = UI_STYLE.ACTIVE_KEY_BASE_COLOR; ctx.fillRect(keyScreenX, yPos + pressDepth, key.width, height); }
        ctx.font = `bold ${config.style.userKeyWidth * 0.22}px sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = isActive ? UI_STYLE.ACTIVE_LABEL_COLOR : (key.isBlack ? UI_STYLE.LABEL_COLOR_BLACK_KEY : UI_STYLE.LABEL_COLOR_WHITE_KEY);
        if (key.isBlack) { ctx.textBaseline = 'middle'; ctx.fillText(key.note.slice(0, -1), keyScreenX + key.width / 2, yPos + height * 0.8); } else { ctx.textBaseline = 'bottom'; ctx.fillText(key.note, keyScreenX + key.width / 2, yStart + unscaledRowHeight - (unscaledRowHeight * 0.05)); }
    };
    const renderRow = (layout, yStart, scroll) => { layout.forEach(key => { if (!key.isBlack) { const keyScreenX = key.x - scroll; if (keyScreenX + key.width > 0 && keyScreenX < config.style.userViewportWidth) renderKey(key, keyScreenX, yStart); } }); layout.forEach(key => { if (key.isBlack) { const keyScreenX = key.x - scroll; if (keyScreenX + key.width > 0 && keyScreenX < config.style.userViewportWidth) renderKey(key, keyScreenX, yStart); } }); };
    renderRow(masterKeyboardLayout, isDualView ? unscaledRowHeight : 0, finalScroll_Bottom);
    if (isDualView) renderRow(masterKeyboardLayout, 0, finalScroll_Top);
    ctx.restore();
}

// --- Main Worker Control Logic ---
self.onmessage = async (e) => {
    const { type, payload } = e.data;
    switch (type) {
        // STAGE 1: Collect data (Unchanged)
        case 'INITIALIZE_RENDERER': workerConfig = payload; scrollHistory = [{ time: 0, scrollX: payload.initialScrollX, scrollX2: payload.initialScrollX2 }]; keyPressHistory = []; break;
        case 'ADD_KEY_EVENT': keyPressHistory.push(payload); break;
        case 'UPDATE_SCROLL': scrollHistory.push(payload); break;

        // STAGE 2: Render video using the new robust timeline processor.
        case 'FINALIZE_MUXING':
            if (!workerConfig) { console.error("Worker not initialized!"); return; }

            const renderer = new MediaBunnyBase(workerConfig, drawKeyboardFrame, { libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' });
            await renderer.start();
            
            masterKeyboardLayout = calculateMasterLayout(workerConfig.style.userKeyWidth);
            baseOffset_Bottom = masterKeyboardLayout.get(`C${parseInt(workerConfig.startOctave)}`)?.x || 0;
            baseOffset_Top = workerConfig.independentScroll ? masterKeyboardLayout.get(`C${parseInt(workerConfig.startOctave) + 4}`)?.x || 0 : baseOffset_Bottom - workerConfig.style.userViewportWidth;
            
            const zoomFactor = workerConfig.resolution.width / workerConfig.style.userViewportWidth;
            const unscaledRowHeight = (workerConfig.resolution.height / zoomFactor) / ((workerConfig.alwaysDual || workerConfig.isVertical) ? 2 : 1);
            cacheKeyRenders(workerConfig.style.userKeyWidth, unscaledRowHeight * 0.95);
            for (let i = 0; i < 600; i++) starfield.push({ x: Math.random() * workerConfig.resolution.width, y: Math.random() * workerConfig.resolution.height, speed: Math.random() * 20 + 5, size: Math.random() * 2 + 0.5 });
            
            // ================== ROBUST STATE-MACHINE RENDER LOGIC ==================
            
            // 1. Deconstruct all events into a single timeline, and also create a map of events grouped by timestamp.
            const eventMap = new Map();
            const addEvent = (time, event) => {
                if (!eventMap.has(time)) eventMap.set(time, []);
                eventMap.get(time).push(event);
            };
            
            keyPressHistory.forEach(k => {
                addEvent(k.start, { type: 'KEY_DOWN', note: k.note });
                addEvent(k.end, { type: 'KEY_UP', note: k.note });
            });
            scrollHistory.forEach(s => {
                addEvent(s.time, { type: 'SCROLL_UPDATE', scrollX: s.scrollX, scrollX2: s.scrollX2 });
            });

            // 2. Get a sorted list of unique timestamps where state changes occur.
            const sortedTimestamps = [0, ...eventMap.keys()].sort((a, b) => a - b);
            const uniqueTimestamps = [...new Set(sortedTimestamps)];

            // 3. Initialize the starting state.
            let lastTime = 0;
            const currentState = {
                activeKeys: new Set(),
                scrollX: workerConfig.initialScrollX,
                scrollX2: workerConfig.initialScrollX2
            };

            // 4. Process the timeline, timestamp by timestamp.
            for (const currentTime of uniqueTimestamps) {
                const duration = currentTime - lastTime;

                // Render a frame for the duration the PREVIOUS state was held.
                if (duration > 0.00001) {
                    await renderer.addFrame({
                        time: lastTime,
                        duration: duration,
                        activeKeys: new Set(currentState.activeKeys),
                        scrollX: currentState.scrollX,
                        scrollX2: currentState.scrollX2
                    });
                }
                
                // AFTER rendering, process ALL events at the current timestamp to create the NEXT state.
                const eventsAtThisTime = eventMap.get(currentTime) || [];
                for (const event of eventsAtThisTime) {
                     switch(event.type) {
                        case 'KEY_DOWN': currentState.activeKeys.add(event.note); break;
                        case 'KEY_UP': currentState.activeKeys.delete(event.note); break;
                        case 'SCROLL_UPDATE': currentState.scrollX = event.scrollX; currentState.scrollX2 = event.scrollX2; break;
                    }
                }
                
                lastTime = currentTime;
            }
            
            // 5. Render the final frame, holding the last known state until the audio ends.
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