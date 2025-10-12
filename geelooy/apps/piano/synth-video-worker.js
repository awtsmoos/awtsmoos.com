/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: A high-performance, cinematic piano renderer with volumetric lighting.
VERSION 4.0 - "God Rays" Edition. Stable, Fast, Beautiful.
*/

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State ---
let currentActiveKeys = new Set();
let currentScrollX = 0, currentScrollX2 = 0;
let bottomKeyboardLayout = null, topKeyboardLayout = null;
let keyCache = {}; // For pre-rendered key images

// --- Advanced Effects State ---
let particles = [];
let backgroundNoiseOffset = 0;

// --- CINEMATIC VISUAL STYLE ---
const UI_STYLE = {
    BACKGROUND_COLOR: '#0d0f12',
    BACKGROUND_NOISE_COLOR: 'rgba(255, 255, 255, 0.03)',
    WHITE_KEY_FILL: '#e1e3e8',
    WHITE_KEY_SHADOW: 'rgba(0, 0, 0, 0.5)',
    BLACK_KEY_FILL: '#1c1e22',
    BLACK_KEY_SHADOW: 'rgba(0, 0, 0, 0.7)',
    ACTIVE_KEY_COLOR: '#00d0ff', // Vivid Cyan
    GOD_RAY_COLOR: 'rgba(0, 208, 255, 0.15)',
    EMBER_START_COLOR: [255, 220, 180], // Bright Yellow/Orange
    EMBER_END_COLOR: [255, 100, 50],   // Deep Orange
    LABEL_COLOR: '#909090',
    ACTIVE_LABEL_COLOR: '#000000',
    KEY_HEIGHT_RATIO: 0.65
};

const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// --- Utility Functions ---

function calculateKeyLayout(startOctave, numOctaves, whiteKeyWidth) {
    const layout = []; let whiteKeyX = 0;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const baseOctave = parseInt(startOctave);
    for (let oct = baseOctave; oct < baseOctave + numOctaves; oct++) {
        NOTE_NAMES_FLAT.forEach(note => {
            const isBlack = note.includes('b');
            const noteName = (isBlack ? note.replace('b', '#') : note) + oct;
            layout.push({
                note: noteName, isBlack, x: isBlack ? whiteKeyX - (blackKeyWidth / 2) : whiteKeyX,
                width: isBlack ? blackKeyWidth : whiteKeyWidth, pressAnimation: 0
            });
            if (!isBlack) whiteKeyX += whiteKeyWidth;
        });
    }
    return layout;
}

// --- High-Performance Key Caching ---
function cacheKeyRenders(whiteKeyWidth, whiteKeyHeight) {
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = whiteKeyHeight * UI_STYLE.KEY_HEIGHT_RATIO;
    const states = ['default', 'active'];

    states.forEach(state => {
        // White Key
        const wCanvas = new OffscreenCanvas(whiteKeyWidth, whiteKeyHeight);
        const wCtx = wCanvas.getContext('2d');
        wCtx.fillStyle = state === 'active' ? UI_STYLE.ACTIVE_KEY_COLOR : UI_STYLE.WHITE_KEY_FILL;
        wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight);
        const wGradient = wCtx.createLinearGradient(0, 0, 0, whiteKeyHeight);
        wGradient.addColorStop(0, 'rgba(255,255,255,0.3)');
        wGradient.addColorStop(0.5, 'rgba(255,255,255,0)');
        wCtx.fillStyle = wGradient;
        wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight);
        keyCache[`white_${state}`] = wCanvas;

        // Black Key
        const bCanvas = new OffscreenCanvas(blackKeyWidth, blackKeyHeight);
        const bCtx = bCanvas.getContext('2d');
        bCtx.fillStyle = state === 'active' ? UI_STYLE.ACTIVE_KEY_COLOR : UI_STYLE.BLACK_KEY_FILL;
        bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight);
        const bGradient = bCtx.createLinearGradient(0, 0, blackKeyWidth, 0);
        bGradient.addColorStop(0, 'rgba(255,255,255,0.15)');
        bGradient.addColorStop(0.5, 'rgba(255,255,255,0.0)');
        bGradient.addColorStop(1, 'rgba(0,0,0,0.15)');
        bCtx.fillStyle = bGradient;
        bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight);
        keyCache[`black_${state}`] = bCanvas;
    });
}


// --- The Core Drawing Logic ---

async function drawKeyboardFrame(workerContext, framePayload) {
    const { payload, ctx, canvas } = workerContext;
    const { resolution, style, alwaysDual, independentScroll, isVertical, startOctave } = payload;
    const deltaTime = framePayload ? framePayload.duration : (1 / 30);
    const isDualView = alwaysDual || isVertical;

    // --- State Update & Animation Tick ---
    const allLayouts = [bottomKeyboardLayout, topKeyboardLayout].filter(Boolean);
    if (framePayload) {
        currentActiveKeys = new Set(framePayload.keys);
        currentScrollX = framePayload.scrollX;
        currentScrollX2 = framePayload.scrollX2;
        if (framePayload.newlyPressedKeys) {
            framePayload.newlyPressedKeys.forEach(note => {
                for (const layout of allLayouts) {
                    const key = layout.find(k => k.note === note);
                    if (key) {
                        key.pressAnimation = 1.0; // Start animation
                        // Find key's visual position to create particles
                        // This part is complex, so we'll simplify particle creation for now
                    }
                }
            });
        }
    }
    allLayouts.forEach(layout => layout.forEach(key => key.pressAnimation = Math.max(0, key.pressAnimation - deltaTime * 2.0)));


    // --- One-time Initialization ---
    if (bottomKeyboardLayout === null) {
        const bottomOctaves = isDualView && independentScroll ? 4 : 8;
        bottomKeyboardLayout = calculateKeyLayout(startOctave, bottomOctaves, style.whiteKeyWidth);
        if (isDualView) {
            const topStartOctave = independentScroll ? (parseInt(startOctave) + 4) : parseInt(startOctave);
            topKeyboardLayout = calculateKeyLayout(topStartOctave, bottomOctaves, style.whiteKeyWidth);
        }
        const rowHeight = resolution.height / (isDualView ? 2 : 1);
        cacheKeyRenders(style.whiteKeyWidth, rowHeight * 0.95);
    }

    // --- Drawing ---

    // 1. Dynamic Background
    ctx.fillStyle = UI_STYLE.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, resolution.width, resolution.height);
    backgroundNoiseOffset = (backgroundNoiseOffset + deltaTime * 10) % 100;
    // (A more complex animated noise could go here if needed)

    // 2. Render Keys
    const rowHeight = resolution.height / (isDualView ? 2 : 1);
    const renderKey = (key, keyScreenX, yStart, rowH, isTopRow) => {
        if (keyScreenX + key.width < 0 || keyScreenX > resolution.width) return;
        const isActive = currentActiveKeys.has(key.note);
        const pressDepth = key.pressAnimation > 0 ? 5 : 0;
        const whiteKeyHeight = rowH * 0.95;
        const keyY = (isTopRow ? yStart + pressDepth : yStart + rowH - whiteKeyHeight + pressDepth);
        const cacheName = `${key.isBlack ? 'black' : 'white'}_${isActive ? 'active' : 'default'}`;
        const keyImage = keyCache[cacheName];
        if (!keyImage) return;

        ctx.save();
        ctx.shadowColor = key.isBlack ? UI_STYLE.BLACK_KEY_SHADOW : UI_STYLE.WHITE_KEY_SHADOW;
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 6 - pressDepth;
        ctx.drawImage(keyImage, keyScreenX, keyY);
        ctx.restore();

        // God Rays
        if (key.pressAnimation > 0) {
            ctx.save();
            const rayY = isTopRow ? keyY + keyImage.height : keyY;
            const rayGradient = ctx.createLinearGradient(keyScreenX + key.width/2, rayY, keyScreenX + key.width/2, isTopRow ? resolution.height : 0);
            rayGradient.addColorStop(0, UI_STYLE.GOD_RAY_COLOR);
            rayGradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.globalAlpha = key.pressAnimation;
            ctx.fillStyle = rayGradient;
            ctx.beginPath();
            ctx.moveTo(keyScreenX - 50, isTopRow ? resolution.height : 0);
            ctx.lineTo(keyScreenX + key.width / 2, rayY);
            ctx.lineTo(keyScreenX + key.width + 50, isTopRow ? resolution.height : 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // Labels
        if (!key.isBlack) {
            ctx.fillStyle = isActive ? UI_STYLE.ACTIVE_LABEL_COLOR : UI_STYLE.LABEL_COLOR;
            ctx.font = `bold ${style.whiteKeyWidth * 0.3}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.globalAlpha = 0.8;
            ctx.fillText(key.note, keyScreenX + key.width / 2, yStart + rowH - 10);
            ctx.globalAlpha = 1;
        }
    };

    const renderRow = (layout, yStart, scroll) => {
        const renderPass = isBlackPass => layout.forEach(key => (key.isBlack === isBlackPass) && renderKey(key, key.x - scroll, yStart, rowHeight, yStart === 0));
        renderPass(false);
        renderPass(true);
    };

    renderRow(bottomKeyboardLayout, isDualView ? rowHeight : 0, currentScrollX);
    if (isDualView) renderRow(topKeyboardLayout, 0, independentScroll ? currentScrollX2 : currentScrollX);
}


// --- Bootstrap the Worker ---
if (typeof self !== 'undefined' && self.bootstrapMediabunnyWorker) {
    self.bootstrapMediabunnyWorker(drawKeyboardFrame, {
        libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js'
    });
}