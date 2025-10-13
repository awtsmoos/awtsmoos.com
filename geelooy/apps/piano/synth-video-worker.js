/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: A robust, offline renderer that correctly implements the user's explicit
             "Linked Mode" logic: The bottom keyboard is always one octave higher than the top,
             and they scroll together. This is the definitive build.
VERSION 43.0 - The "Literal Rule" Definitive Build
*/

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State ---
let keyPressHistory = [];
let scrollHistory = [];
let workerConfig = null;

let bottomKeyboardLayout = null;
let topKeyboardLayout = null;
let keyCache = {};
let particles = [];
let starfield = [];

// Two unique base offsets. Their values will be determined by the one, simple rule.
let baseScrollOffset_Bottom = 0;
let baseScrollOffset_Top = 0;

// --- Visuals & Constants ---
const UI_STYLE = { BACKGROUND_COLOR: '#000000', GRID_COLOR: 'rgba(0, 150, 255, 0.1)', STAR_COLOR: 'rgba(220, 235, 255, 0.8)', WHITE_KEY_FILL: '#dfe2e8', WHITE_KEY_AO: 'rgba(0, 0, 0, 0.25)', BLACK_KEY_FILL: '#121317', BLACK_KEY_HIGHLIGHT: 'rgba(255, 255, 255, 0.1)', ACTIVE_KEY_BASE_COLOR: '#00ffff', ACTIVE_KEY_GLOW_COLOR: 'rgba(0, 255, 255, 0.7)', SHOCKWAVE_COLOR: 'rgba(0, 255, 255, 0.6)', PARTICLE_COLOR: '#ffffff', TOUCH_POINT_COLOR: 'rgba(0, 255, 255, 0.9)', LABEL_COLOR_WHITE_KEY: '#707080', LABEL_COLOR_BLACK_KEY: '#a0a0b0', ACTIVE_LABEL_COLOR: '#000000' };
const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MIDI_NOTE_START = 21; // A0
const MIDI_NOTE_END = 108;   // C8

// --- Utility Functions ---
function midiToNoteName(midi) { const octave = Math.floor(midi / 12) - 1; const noteIndex = midi % 12; return NOTE_NAMES_SHARP[noteIndex] + octave; }
function calculateKeyLayout(whiteKeyWidth) { const layout = new Map(); let whiteKeyX = 0; const blackKeyWidth = whiteKeyWidth * 0.6; for (let midi = MIDI_NOTE_START; midi <= MIDI_NOTE_END; midi++) { const noteName = midiToNoteName(midi); if (!noteName) continue; const isBlack = noteName.includes('#'); const x = isBlack ? whiteKeyX - (blackKeyWidth / 2) : whiteKeyX; layout.set(noteName, { note: noteName, isBlack, x, width: isBlack ? blackKeyWidth : whiteKeyWidth, pressAnimation: 0 }); if (!isBlack) whiteKeyX += whiteKeyWidth; } return layout; }
function cacheKeyRenders(whiteKeyWidth, whiteKeyHeight) { const blackKeyWidth = whiteKeyWidth * 0.6, blackKeyHeight = whiteKeyHeight * 0.65; const wCanvas = new OffscreenCanvas(whiteKeyWidth, whiteKeyHeight); const wCtx = wCanvas.getContext('2d'); wCtx.fillStyle = UI_STYLE.WHITE_KEY_FILL; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight); const aoGradient = wCtx.createLinearGradient(0, 0, whiteKeyWidth, 0); aoGradient.addColorStop(0, UI_STYLE.WHITE_KEY_AO); aoGradient.addColorStop(0.1, 'transparent'); aoGradient.addColorStop(0.9, 'transparent'); aoGradient.addColorStop(1, UI_STYLE.WHITE_KEY_AO); wCtx.fillStyle = aoGradient; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight); keyCache['white_default'] = wCanvas; const bCanvas = new OffscreenCanvas(blackKeyWidth, blackKeyHeight); const bCtx = bCanvas.getContext('2d'); bCtx.fillStyle = UI_STYLE.BLACK_KEY_FILL; bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight); keyCache['black_default'] = bCanvas; }
function createParticles(x, y) { for (let i = 0; i < 80; i++) { const angle = Math.random() * Math.PI * 2; const speed = Math.random() * 250 + 75; particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: Math.random() * 2.0 + 0.8, initialLife: -1, radius: Math.random() * 2.5 + 1 }); } }


// --- The Frame Drawing Function ---
function drawKeyboardFrame(workerContext, framePayload) {
    const { payload: config, ctx } = workerContext;
    const { time, duration: deltaTime } = framePayload;

    const relevantScroll = scrollHistory.slice().reverse().find(s => s.time <= time) || scrollHistory[0];
    const activeKeys = new Set();
    keyPressHistory.forEach(k => { if (time >= k.start && time < k.end) { activeKeys.add(k.note); } });

    // **THE DEFINITIVE FIX IN ACTION**: Calculate the final scroll for each keyboard
    // using the simple, correct logic.
    const finalScrollX_Bottom = baseScrollOffset_Bottom + relevantScroll.scrollX;
    let finalScrollX_Top;

    if (config.independentScroll) {
        // INDEPENDENT MODE: Top uses its own offset and its own scroll data (scrollX2).
        finalScrollX_Top = baseScrollOffset_Top + relevantScroll.scrollX2;
    } else {
        // LINKED MODE: Top uses its own offset (one octave lower) and the SAME scroll data as the bottom.
        // This makes them scroll together, maintaining their fixed octave relationship.
        finalScrollX_Top = baseScrollOffset_Top + relevantScroll.scrollX;
    }

    // --- Drawing Logic ---
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
        const eventData = isActive ? keyPressHistory.find(e => e.note === key.note && time >= e.start && time < e.end) : null;
        const targetAnimation = isActive ? 1.0 : 0.0;
        if (Math.abs(key.pressAnimation - targetAnimation) > 0.01) { key.pressAnimation += (targetAnimation - key.pressAnimation) * 12.0 * deltaTime; } else { key.pressAnimation = targetAnimation; }
        if (config.renderMode === 'explosion' && isActive && eventData && !eventData.effectTriggered) { createParticles(keyScreenX + (eventData.x / zoomFactor), yStart + (eventData.y / zoomFactor)); eventData.effectTriggered = true; }
        const whiteKeyHeight = unscaledRowHeight * 0.95, blackKeyHeight = whiteKeyHeight * 0.65;
        const pressDepth = key.pressAnimation * 4, yPos = yStart + (key.isBlack ? 0 : unscaledRowHeight - whiteKeyHeight), height = key.isBlack ? blackKeyHeight : whiteKeyHeight;
        ctx.drawImage(keyCache[`${key.isBlack ? 'black' : 'white'}_default`], keyScreenX, yPos + pressDepth);
        if (key.pressAnimation > 0) { ctx.globalAlpha = key.pressAnimation; ctx.fillStyle = UI_STYLE.ACTIVE_KEY_BASE_COLOR; ctx.fillRect(keyScreenX, yPos + pressDepth, key.width, height); ctx.globalAlpha = 1; }
        const isHighlight = key.pressAnimation > 0.5; ctx.font = `bold ${config.style.userKeyWidth * 0.22}px sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = isHighlight ? UI_STYLE.ACTIVE_LABEL_COLOR : (key.isBlack ? UI_STYLE.LABEL_COLOR_BLACK_KEY : UI_STYLE.LABEL_COLOR_WHITE_KEY);
        if (key.isBlack) { ctx.textBaseline = 'middle'; ctx.fillText(key.note.slice(0, -1), keyScreenX + key.width / 2, yPos + height * 0.8); } else { ctx.textBaseline = 'bottom'; ctx.fillText(key.note, keyScreenX + key.width / 2, yStart + unscaledRowHeight - (unscaledRowHeight * 0.05)); }
    };

    const renderRow = (layout, yStart, scroll) => { if (!layout) return; ['white', 'black'].forEach(type => { layout.forEach(key => { if ((type === 'black') === key.isBlack) { const keyScreenX = key.x - scroll; if (keyScreenX + key.width > 0 && keyScreenX < config.style.userViewportWidth) renderKey(key, keyScreenX, yStart); } }); }); };

    renderRow(bottomKeyboardLayout, isDualView ? unscaledRowHeight : 0, finalScrollX_Bottom);
    if (isDualView) renderRow(topKeyboardLayout, 0, finalScrollX_Top);

    if (config.renderMode === 'explosion') { for (let i = particles.length - 1; i >= 0; i--) { const p = particles[i]; p.x += p.vx * deltaTime; p.y += p.vy * deltaTime; p.vy += 400 * deltaTime; p.life -= deltaTime; if (p.life <= 0) { particles.splice(i, 1); } else { ctx.globalAlpha = p.life / (p.initialLife || p.life); ctx.fillStyle = UI_STYLE.PARTICLE_COLOR; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); } } }

    ctx.restore();
}

// --- Main Worker Control Logic ---
self.onmessage = async (e) => {
    const { type, payload } = e.data;
    switch (type) {
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

        case 'FINALIZE_MUXING':
            if (!workerConfig) { console.error("Worker not initialized!"); return; }

            const renderer = new MediaBunnyBase(workerConfig, drawKeyboardFrame, { libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' });
            await renderer.start();
            
            bottomKeyboardLayout = calculateKeyLayout(workerConfig.style.userKeyWidth);
            if (workerConfig.alwaysDual || workerConfig.isVertical) topKeyboardLayout = calculateKeyLayout(workerConfig.style.userKeyWidth);

            // **THE DEFINITIVE FIX IMPLEMENTATION**: Calculate the two separate base offsets
            // by literally implementing the user's correct description of the behavior.
            const startOctaveNum = parseInt(workerConfig.startOctave);

            // The bottom keyboard starts at the octave selected in the UI.
            baseScrollOffset_Bottom = bottomKeyboardLayout.get(`C${startOctaveNum}`)?.x || 0;

            if (workerConfig.independentScroll) {
                // INDEPENDENT MODE: The main script starts the top keyboard 4 octaves higher.
                const topStartOctave = startOctaveNum + 4;
                baseScrollOffset_Top = topKeyboardLayout.get(`C${topStartOctave}`)?.x || 0;
            } else {
                // LINKED MODE: The user has clarified the top keyboard is ONE octave lower than the bottom.
                const topStartOctave = startOctaveNum - 1;
                baseScrollOffset_Top = topKeyboardLayout.get(`C${topStartOctave}`)?.x || 0;
            }

            const zoomFactor = workerConfig.resolution.width / workerConfig.style.userViewportWidth;
            const unscaledRowHeight = (workerConfig.resolution.height / zoomFactor) / ((workerConfig.alwaysDual || workerConfig.isVertical) ? 2 : 1);
            cacheKeyRenders(workerConfig.style.userKeyWidth, unscaledRowHeight * 0.95);
            for (let i = 0; i < 600; i++) starfield.push({ x: Math.random() * workerConfig.resolution.width, y: Math.random() * workerConfig.resolution.height, speed: Math.random() * 20 + 5, size: Math.random() * 2 + 0.5 });

            const finalDuration = payload.audioBufferShim.duration;
            const deltaTime = 1 / workerConfig.outputFormat.fps;
            for (let time = 0; time < finalDuration; time += deltaTime) {
                await renderer.addFrame({ time, duration: deltaTime });
            }

            const blob = await renderer.finalize(payload.audioBufferShim);
            renderer._postComplete(blob, { download: true, fileName: `BH-Piano-Render-${Date.now()}.mp4` });
            break;
    }
};