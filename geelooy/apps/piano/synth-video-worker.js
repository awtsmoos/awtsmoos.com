/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: A complete rewrite that correctly mirrors the main application's rendering logic.
             1) In Linked Mode, the top keyboard is offset by exactly one viewport width to the left.
             2) This build uses pixel-perfect logic, not flawed musical note calculations.
             3) Includes Hebrew Letter particle explosion effect.
VERSION 52.0 - The "Holy Sparks" Build
*/

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State ---
let keyPressHistory = [];
let scrollHistory = [];
let workerConfig = null;

let masterKeyboardLayout = null; // The single source-of-truth for all notes.
let keyCache = {};
let particles = [];
let starfield = [];

// The starting x-positions (offsets) of the two "viewports" into the master layout.
let baseOffset_Bottom = 0;
let baseOffset_Top = 0;

// --- Visuals & Constants ---
const UI_STYLE = { BACKGROUND_COLOR: '#000000', GRID_COLOR: 'rgba(0, 150, 255, 0.1)', STAR_COLOR: 'rgba(220, 235, 255, 0.8)', WHITE_KEY_FILL: '#dfe2e8', WHITE_KEY_AO: 'rgba(0, 0, 0, 0.25)', BLACK_KEY_FILL: '#121317', BLACK_KEY_HIGHLIGHT: 'rgba(255, 255, 255, 0.1)', ACTIVE_KEY_BASE_COLOR: '#00ffff', ACTIVE_KEY_GLOW_COLOR: 'rgba(0, 255, 255, 0.7)', SHOCKWAVE_COLOR: 'rgba(0, 255, 255, 0.6)', TOUCH_POINT_COLOR: 'rgba(0, 255, 255, 0.9)', LABEL_COLOR_WHITE_KEY: '#707080', LABEL_COLOR_BLACK_KEY: '#a0a0b0', ACTIVE_LABEL_COLOR: '#000000' };
const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const HEBREW_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];
const MIDI_NOTE_START = 21; // A0
const MIDI_NOTE_END = 108;   // C8

// --- Utility Functions ---
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
        
        layout.set(noteName, { note: noteName, isBlack, x, width: isBlack ? blackKeyWidth : whiteKeyWidth, pressAnimation: 0 });

        if (!isBlack) {
            whiteKeyX += whiteKeyWidth;
        }
    }
    return layout;
}

function cacheKeyRenders(whiteKeyWidth, whiteKeyHeight) { const blackKeyWidth = whiteKeyWidth * 0.6, blackKeyHeight = whiteKeyHeight * 0.65; const wCanvas = new OffscreenCanvas(whiteKeyWidth, whiteKeyHeight); const wCtx = wCanvas.getContext('2d'); wCtx.fillStyle = UI_STYLE.WHITE_KEY_FILL; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight); const aoGradient = wCtx.createLinearGradient(0, 0, whiteKeyWidth, 0); aoGradient.addColorStop(0, UI_STYLE.WHITE_KEY_AO); aoGradient.addColorStop(0.1, 'transparent'); aoGradient.addColorStop(0.9, 'transparent'); aoGradient.addColorStop(1, UI_STYLE.WHITE_KEY_AO); wCtx.fillStyle = aoGradient; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight); keyCache['white_default'] = wCanvas; const bCanvas = new OffscreenCanvas(blackKeyWidth, blackKeyHeight); const bCtx = bCanvas.getContext('2d'); bCtx.fillStyle = UI_STYLE.BLACK_KEY_FILL; bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight); keyCache['black_default'] = bCanvas; }

function createParticles(x, y) {
    for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 250 + 75;
        const letter = HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)];
        const color = `hsl(${Math.random() * 360}, 100%, 75%)`; // Random vibrant color

        particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: Math.random() * 2.0 + 0.8,
            initialLife: -1,
            radius: Math.random() * 3.5 + 2, // Controls font size
            letter: letter,
            color: color
        });
    }
}


// --- The Frame Drawing Function ---
function drawKeyboardFrame(workerContext, framePayload) {
    const { payload: config, ctx } = workerContext;
    const { time, duration: deltaTime } = framePayload;

    const relevantScroll = scrollHistory.slice().reverse().find(s => s.time <= time) || scrollHistory[0];
    const activeKeys = new Set();
    keyPressHistory.forEach(k => { if (time >= k.start && time < k.end) { activeKeys.add(k.note); } });

    const finalScroll_Bottom = baseOffset_Bottom + relevantScroll.scrollX;
    const finalScroll_Top = baseOffset_Top + (config.independentScroll ? relevantScroll.scrollX2 : relevantScroll.scrollX);

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
        if (config.effectMode === 'explosion' && isActive && eventData && !eventData.effectTriggered) { const effectX = keyScreenX + (eventData.x / zoomFactor); const effectY = yStart + (eventData.y / zoomFactor); createParticles(effectX, effectY); eventData.effectTriggered = true; }
        const whiteKeyHeight = unscaledRowHeight * 0.95, blackKeyHeight = whiteKeyHeight * 0.65;
        const pressDepth = key.pressAnimation * 4, yPos = yStart + (key.isBlack ? 0 : unscaledRowHeight - whiteKeyHeight), height = key.isBlack ? blackKeyHeight : whiteKeyHeight;
        ctx.drawImage(keyCache[`${key.isBlack ? 'black' : 'white'}_default`], keyScreenX, yPos + pressDepth);
        if (key.pressAnimation > 0) { ctx.globalAlpha = key.pressAnimation; ctx.fillStyle = UI_STYLE.ACTIVE_KEY_BASE_COLOR; ctx.fillRect(keyScreenX, yPos + pressDepth, key.width, height); ctx.globalAlpha = 1; }
        const isHighlight = key.pressAnimation > 0.5; ctx.font = `bold ${config.style.userKeyWidth * 0.22}px sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = isHighlight ? UI_STYLE.ACTIVE_LABEL_COLOR : (key.isBlack ? UI_STYLE.LABEL_COLOR_BLACK_KEY : UI_STYLE.LABEL_COLOR_WHITE_KEY);
        if (key.isBlack) { ctx.textBaseline = 'middle'; ctx.fillText(key.note.slice(0, -1), keyScreenX + key.width / 2, yPos + height * 0.8); } else { ctx.textBaseline = 'bottom'; ctx.fillText(key.note, keyScreenX + key.width / 2, yStart + unscaledRowHeight - (unscaledRowHeight * 0.05)); }
    };

    const renderRow = (layout, yStart, scroll) => { if (!layout) return; ['white', 'black'].forEach(type => { layout.forEach(key => { if ((type === 'black') === key.isBlack) { const keyScreenX = key.x - scroll; if (keyScreenX + key.width > 0 && keyScreenX < config.style.userViewportWidth) renderKey(key, keyScreenX, yStart); } }); }); };

    renderRow(masterKeyboardLayout, isDualView ? unscaledRowHeight : 0, finalScroll_Bottom);
    if (isDualView) renderRow(masterKeyboardLayout, 0, finalScroll_Top);

    // Particle effect rendering (now with Hebrew letters)
    if (config.effectMode === 'explosion') {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.vy += 400 * deltaTime; // Gravity
            p.life -= deltaTime;

            if (p.life <= 0) {
                particles.splice(i, 1);
            } else {
                if (p.initialLife === -1) p.initialLife = p.life; // Set initial life once
                ctx.globalAlpha = p.life / p.initialLife;
                ctx.fillStyle = p.color;
                ctx.font = `bold ${p.radius * 8}px sans-serif`; // Font size based on radius
                ctx.fillText(p.letter, p.x, p.y);
            }
        }
        ctx.globalAlpha = 1; // Reset alpha
    }

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
            payload.effectTriggered = false;
            keyPressHistory.push(payload);
            break;

        case 'UPDATE_SCROLL':
            scrollHistory.push(payload);
            break;

        case 'FINALIZE_MUXING':
            if (!workerConfig) { console.error("Worker not initialized!"); return; }

            const renderer = new MediaBunnyBase(workerConfig, drawKeyboardFrame, { libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' });
            await renderer.start();
            
            masterKeyboardLayout = calculateMasterLayout(workerConfig.style.userKeyWidth);

            const uiStartOctave = parseInt(workerConfig.startOctave);
            const bottomStartNote = `C${uiStartOctave}`;
            baseOffset_Bottom = masterKeyboardLayout.get(bottomStartNote)?.x || 0;

            if (workerConfig.independentScroll) {
                const topStartNote = `C${uiStartOctave + 4}`;
                baseOffset_Top = masterKeyboardLayout.get(topStartNote)?.x || 0;
            } else {
                const viewportWidth = workerConfig.style.userViewportWidth;
                baseOffset_Top = baseOffset_Bottom - viewportWidth;
            }
            
            const zoomFactor = workerConfig.resolution.width / workerConfig.style.userViewportWidth;
            const unscaledRowHeight = (workerConfig.resolution.height / zoomFactor) / ((workerConfig.alwaysDual || workerConfig.isVertical) ? 2 : 1);
            cacheKeyRenders(workerConfig.style.userKeyWidth, unscaledRowHeight * 0.95);
            for (let i = 0; i < 600; i++) starfield.push({ x: Math.random() * workerConfig.resolution.width, y: Math.random() * workerConfig.resolution.height, speed: Math.random() * 20 + 5, size: Math.random() * 2 + 0.5 });

            // Render every frame, with progress feedback
            const finalDuration = payload.audioBufferShim.duration;
            const deltaTime = 1 / workerConfig.outputFormat.fps;
            const totalFrames = Math.floor(finalDuration / deltaTime);
            let lastReportedProgress = -1;

            for (let i = 0; i < totalFrames; i++) {
                const time = i * deltaTime;
                await renderer.addFrame({ time, duration: deltaTime });

                const progress = Math.floor((i / totalFrames) * 100);
                if (progress > lastReportedProgress) {
                    self.postMessage({ type: 'RENDER_PROGRESS', progress: progress });
                    lastReportedProgress = progress;
                }
            }

            self.postMessage({ type: 'RENDER_PROGRESS', progress: 100 });
            const blob = await renderer.finalize(payload.audioBufferShim);
            renderer._postComplete(blob, { download: true, fileName: `BH-WebSynth-Video-${Date.now()}.mp4` });
            break;
    }
};