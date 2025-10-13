/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: A dual-mode, position-aware renderer with a clean main-thread and a worker-side loop.
VERSION 27.0 - The "Loop-Free Main Thread" Final Edition
*/

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State ---
let keyEvents = new Map(); // Use Map for efficient lookup and storing coord data
let scrollEvents = [{ time: 0, scrollX: 0, scrollX2: 0 }];
let bottomKeyboardLayout = null, topKeyboardLayout = null, keyCache = {};
let particles = [], starfield = [], zoomFactor = 1;
let renderer = null, renderMode = 'explosion';

// --- Visuals & Constants ---
const UI_STYLE = {
    BACKGROUND_COLOR: '#000000',
    GRID_COLOR: 'rgba(0, 150, 255, 0.1)',
    STAR_COLOR: 'rgba(220, 235, 255, 0.8)',
    WHITE_KEY_FILL: '#dfe2e8',
    WHITE_KEY_AO: 'rgba(0, 0, 0, 0.25)',
    BLACK_KEY_FILL: '#121317',
    BLACK_KEY_HIGHLIGHT: 'rgba(255, 255, 255, 0.1)',
    ACTIVE_KEY_BASE_COLOR: '#00ffff',
    ACTIVE_KEY_GLOW_COLOR: 'rgba(0, 255, 255, 0.7)',
    SHOCKWAVE_COLOR: 'rgba(0, 255, 255, 0.6)',
    PARTICLE_COLOR: '#ffffff',
    TOUCH_POINT_COLOR: 'rgba(0, 255, 255, 0.8)',
    LABEL_COLOR_WHITE_KEY: '#707080',
    LABEL_COLOR_BLACK_KEY: '#a0a0b0',
    ACTIVE_LABEL_COLOR: '#000000'
};
const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const flatToSharpMap = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };

// --- Utility Functions ---
function calculateKeyLayout(startOctave, numOctaves, whiteKeyWidth) {
    const layout = [];
    let whiteKeyX = 0;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    for (let oct = startOctave; oct < startOctave + numOctaves; oct++) {
        NOTE_NAMES_FLAT.forEach(note => {
            const isBlack = note.includes('b');
            const noteNameWithSharp = isBlack ? flatToSharpMap[note] : note;
            const finalNoteName = noteNameWithSharp + oct;
            layout.push({
                note: finalNoteName, isBlack, x: isBlack ? whiteKeyX - (blackKeyWidth / 2) : whiteKeyX,
                width: isBlack ? blackKeyWidth : whiteKeyWidth, pressAnimation: 0
            });
            if (!isBlack) whiteKeyX += whiteKeyWidth;
        });
    }
    return layout;
}

function cacheKeyRenders(whiteKeyWidth, whiteKeyHeight) {
    const blackKeyWidth = whiteKeyWidth * 0.6, blackKeyHeight = whiteKeyHeight * 0.65;
    const wCanvas = new OffscreenCanvas(whiteKeyWidth, whiteKeyHeight);
    const wCtx = wCanvas.getContext('2d');
    wCtx.fillStyle = UI_STYLE.WHITE_KEY_FILL;
    wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight);
    const aoGradient = wCtx.createLinearGradient(0, 0, whiteKeyWidth, 0);
    aoGradient.addColorStop(0, UI_STYLE.WHITE_KEY_AO); aoGradient.addColorStop(0.1, 'transparent');
    aoGradient.addColorStop(0.9, 'transparent'); aoGradient.addColorStop(1, UI_STYLE.WHITE_KEY_AO);
    wCtx.fillStyle = aoGradient;
    wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight);
    keyCache['white_default'] = wCanvas;

    const bCanvas = new OffscreenCanvas(blackKeyWidth, blackKeyHeight);
    const bCtx = bCanvas.getContext('2d');
    bCtx.fillStyle = UI_STYLE.BLACK_KEY_FILL;
    bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight);
    const bGradient = bCtx.createLinearGradient(0, 0, blackKeyWidth, 0);
    bGradient.addColorStop(0, UI_STYLE.BLACK_KEY_HIGHLIGHT);
    bGradient.addColorStop(0.5, 'transparent');
    bCtx.fillStyle = bGradient;
    bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight);
    keyCache['black_default'] = bCanvas;
}

function createParticles(x, y) {
    for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 250 + 75;
        particles.push({
            x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            life: Math.random() * 2.0 + 0.8, initialLife: -1, radius: Math.random() * 2.5 + 1
        });
    }
}

// --- The Frame Drawing Function ---
function drawKeyboardFrame(workerContext, framePayload) {
    const { payload, ctx, canvas } = workerContext;
    const { resolution, style, alwaysDual, independentScroll, isVertical, startOctave } = payload;

    if (bottomKeyboardLayout === null) {
        const baseStartOctave = parseInt(startOctave);
        const userKeyWidth = style.userKeyWidth;
        const isDualView = alwaysDual || isVertical;
        if (isDualView) {
            const octaves = independentScroll ? 4 : 8;
            const topStartOctaveOffset = independentScroll ? 4 : 0;
            bottomKeyboardLayout = calculateKeyLayout(baseStartOctave, octaves, userKeyWidth);
            topKeyboardLayout = calculateKeyLayout(baseStartOctave + topStartOctaveOffset, octaves, userKeyWidth);
        } else {
            bottomKeyboardLayout = calculateKeyLayout(baseStartOctave, 8, userKeyWidth);
            topKeyboardLayout = null;
        }
        const userViewportWidth = style.userViewportWidth || resolution.width;
        zoomFactor = userViewportWidth > 0 ? resolution.width / userViewportWidth : 1;
        const rowHeight = (resolution.height / zoomFactor) / (isDualView ? 2 : 1);
        cacheKeyRenders(userKeyWidth, rowHeight * 0.95);
        for (let i = 0; i < 600; i++) {
            starfield.push({ x: Math.random() * resolution.width, y: Math.random() * resolution.height, speed: Math.random() * 20 + 5, size: Math.random() * 2 + 0.5 });
        }
    }

    const frameTime = framePayload.time;
    const deltaTime = framePayload.duration;

    const activeKeys = new Set();
    keyEvents.forEach((event, note) => {
        if (renderMode === 'explosion' && frameTime >= event.start && frameTime < event.end) {
            activeKeys.add(note);
        } else if (renderMode === 'touchpoint') {
            activeKeys.add(note); // In touchpoint mode, if it's in the map, it's active.
        }
    });
    const relevantScrollEvent = scrollEvents.slice().reverse().find(e => e.time <= frameTime);
    const currentScrollX = relevantScrollEvent.scrollX, currentScrollX2 = relevantScrollEvent.scrollX2;

    ctx.save();
    ctx.fillStyle = UI_STYLE.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, resolution.width, resolution.height);
    for (let i = 0; i < resolution.width; i += 50) { ctx.fillStyle = UI_STYLE.GRID_COLOR; ctx.fillRect(i, 0, 1, resolution.height); }
    for (let i = 0; i < resolution.height; i += 50) { ctx.fillStyle = UI_STYLE.GRID_COLOR; ctx.fillRect(0, i, resolution.width, 1); }
    starfield.forEach(star => { star.y += star.speed * deltaTime; if (star.y > resolution.height) { star.y = 0; star.x = Math.random() * resolution.width; } });
    ctx.fillStyle = UI_STYLE.STAR_COLOR;
    starfield.forEach(star => ctx.fillRect(star.x, star.y, star.size, star.size));

    ctx.scale(zoomFactor, zoomFactor);
    const isDualView = alwaysDual || isVertical;
    const unscaledRowHeight = (resolution.height / zoomFactor) / (isDualView ? 2 : 1);

    const renderKey = (key, keyScreenX, yStart) => {
        const whiteKeyHeight = unscaledRowHeight * 0.95, blackKeyHeight = whiteKeyHeight * 0.65;
        const isActive = activeKeys.has(key.note);
        const eventData = keyEvents.get(key.note);

        if (renderMode === 'explosion' && isActive && key.pressAnimation < 0.5 && eventData) {
            const effectX = keyScreenX + (eventData.x / zoomFactor);
            const effectY = yStart + (key.isBlack ? 0 : unscaledRowHeight - whiteKeyHeight) + (eventData.y / zoomFactor);
            createParticles(effectX, effectY);
        }

        const targetAnimation = isActive ? 1.0 : 0.0;
        if (Math.abs(key.pressAnimation - targetAnimation) > 0.01) {
            key.pressAnimation += (targetAnimation - key.pressAnimation) * 12.0 * deltaTime;
        } else {
            key.pressAnimation = targetAnimation;
        }

        const pressDepth = key.pressAnimation * 4;
        const yPos = yStart + (key.isBlack ? 0 : unscaledRowHeight - whiteKeyHeight);
        const height = key.isBlack ? blackKeyHeight : whiteKeyHeight;

        ctx.drawImage(keyCache[`${key.isBlack ? 'black' : 'white'}_default`], keyScreenX, yPos + pressDepth);

        if (key.pressAnimation > 0) {
            ctx.globalAlpha = key.pressAnimation;
            ctx.shadowColor = UI_STYLE.ACTIVE_KEY_GLOW_COLOR;
            ctx.shadowBlur = 30;
            ctx.fillStyle = UI_STYLE.ACTIVE_KEY_BASE_COLOR;
            ctx.fillRect(keyScreenX, yPos + pressDepth, key.width, height);
            ctx.shadowBlur = 0;
            if (renderMode === 'explosion') {
                const shockwaveRadius = (1 - Math.cos(key.pressAnimation * Math.PI / 2)) * key.width;
                ctx.globalAlpha = (1 - key.pressAnimation) * key.pressAnimation * 4;
                ctx.strokeStyle = UI_STYLE.SHOCKWAVE_COLOR;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.arc(keyScreenX + key.width / 2, yPos + pressDepth + height / 2, shockwaveRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
            ct