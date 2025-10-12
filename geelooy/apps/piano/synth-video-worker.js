/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: A high-performance, cinematic piano renderer with "Aurora Flow" visuals.
VERSION 9.0 - Definitive UI Mirroring Logic.
*/

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State & Style Constants ---
let currentActiveKeys = new Set();
let currentScrollX = 0, currentScrollX2 = 0;
let bottomKeyboardLayout = null, topKeyboardLayout = null;
let keyCache = {};
let particles = [];
let backgroundOffset = { x: 0, y: 0 };
const UI_STYLE = {
    BACKGROUND_GRADIENT_START: '#0a0a0f', BACKGROUND_GRADIENT_END: '#1a1a2a',
    NEBULA_COLOR_1: 'rgba(50, 80, 180, 0.2)', NEBULA_COLOR_2: 'rgba(150, 50, 180, 0.15)',
    WHITE_KEY_FILL: 'rgba(240, 240, 255, 0.9)', WHITE_KEY_SHADOW: 'rgba(0, 0, 0, 0.4)',
    BLACK_KEY_FILL: 'rgba(20, 20, 30, 0.85)', BLACK_KEY_SHADOW: 'rgba(0, 0, 0, 0.7)',
    AURORA_COLOR: '#00eaff', AURORA_GLOW: 'rgba(0, 234, 255, 0.8)',
    AURORA_TRAIL: 'rgba(0, 234, 255, 0.2)', LABEL_COLOR: 'rgba(0, 0, 0, 0.4)',
    ACTIVE_LABEL_COLOR: 'rgba(0, 0, 0, 0.9)', KEY_HEIGHT_RATIO: 0.65
};
const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// --- Utility Functions ---
function calculateKeyLayout(startOctave, numOctaves, whiteKeyWidth) {
    const layout = []; let whiteKeyX = 0;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    for (let oct = startOctave; oct < startOctave + numOctaves; oct++) {
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

function cacheKeyRenders(whiteKeyWidth, whiteKeyHeight) {
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = whiteKeyHeight * UI_STYLE.KEY_HEIGHT_RATIO;
    ['default', 'active'].forEach(state => {
        const isActive = state === 'active';
        const wCanvas = new OffscreenCanvas(whiteKeyWidth, whiteKeyHeight);
        const wCtx = wCanvas.getContext('2d');
        wCtx.fillStyle = UI_STYLE.WHITE_KEY_FILL; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight);
        const wGradient = wCtx.createLinearGradient(0, 0, whiteKeyWidth, 0);
        wGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)'); wGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.0)');
        wCtx.fillStyle = wGradient; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight);
        if (isActive) { wCtx.fillStyle = UI_STYLE.AURORA_COLOR; wCtx.globalAlpha = 0.8; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight); wCtx.globalAlpha = 1; }
        keyCache[`white_${state}`] = wCanvas;
        const bCanvas = new OffscreenCanvas(blackKeyWidth, blackKeyHeight);
        const bCtx = bCanvas.getContext('2d');
        bCtx.fillStyle = UI_STYLE.BLACK_KEY_FILL; bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight);
        const bGradient = bCtx.createLinearGradient(0, 0, blackKeyWidth * 0.5, 0);
        bGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)'); bGradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
        bCtx.fillStyle = bGradient; bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight);
        if (isActive) { bCtx.fillStyle = UI_STYLE.AURORA_COLOR; bCtx.globalAlpha = 0.8; bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight); bCtx.globalAlpha = 1; }
        keyCache[`black_${state}`] = bCanvas;
    });
}

function createParticles(x, y) { for (let i = 0; i < 25; i++) { const angle = Math.random() * Math.PI * 2; const speed = Math.random() * 100 + 50; particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: Math.random() * 1.2 + 0.6, initialLife: Math.random() * 1.2 + 0.6, radius: Math.random() * 2 + 1 }); } }

// --- The Core Drawing Logic ---
async function drawKeyboardFrame(workerContext, framePayload) {
    const { payload, ctx, canvas } = workerContext;
    const { resolution, style, alwaysDual, independentScroll, isVertical, startOctave, numOctaves } = payload;
    const deltaTime = framePayload ? (framePayload.duration || 1 / 30) : (1 / 30);
    const isDualView = alwaysDual || isVertical;

    if (framePayload) {
        currentActiveKeys = new Set(framePayload.keys);
        currentScrollX = framePayload.scrollX;
        currentScrollX2 = framePayload.scrollX2;
        if (framePayload.newlyPressedKeys) {
            const allLayouts = [bottomKeyboardLayout, topKeyboardLayout].filter(Boolean);
            framePayload.newlyPressedKeys.forEach(note => {
                for (const layout of allLayouts) { const key = layout.find(k => k.note === note); if (key) key.pressAnimation = 1.0; }
            });
        }
    }
    const allLayouts = [bottomKeyboardLayout, topKeyboardLayout].filter(Boolean);
    allLayouts.forEach(layout => layout.forEach(key => key.pressAnimation = Math.max(0, key.pressAnimation - deltaTime * 1.5)));

    if (bottomKeyboardLayout === null) {
        const baseStartOctave = parseInt(startOctave);
        bottomKeyboardLayout = calculateKeyLayout(baseStartOctave, numOctaves, style.whiteKeyWidth);
        if (isDualView) {
            const topStartOctave = baseStartOctave + 4; // ALWAYS 4 octaves higher in dual view for clarity
            topKeyboardLayout = calculateKeyLayout(topStartOctave, numOctaves, style.whiteKeyWidth);
        } else {
            topKeyboardLayout = null;
        }
        const rowHeight = resolution.height / (isDualView ? 2 : 1);
        cacheKeyRenders(style.whiteKeyWidth, rowHeight * 0.95);
    }

    const bgGradient = ctx.createLinearGradient(0, 0, 0, resolution.height);
    bgGradient.addColorStop(0, UI_STYLE.BACKGROUND_GRADIENT_START); bgGradient.addColorStop(1, UI_STYLE.BACKGROUND_GRADIENT_END);
    ctx.fillStyle = bgGradient; ctx.fillRect(0, 0, resolution.width, resolution.height);
    backgroundOffset.x += deltaTime * 5; backgroundOffset.y += deltaTime * 3;
    const nebulaGradient = ctx.createRadialGradient(resolution.width / 2 + Math.sin(backgroundOffset.x / 10) * 200, resolution.height / 2 + Math.cos(backgroundOffset.y / 10) * 150, 0, resolution.width / 2, resolution.height / 2, Math.max(resolution.width, resolution.height));
    nebulaGradient.addColorStop(0, UI_STYLE.NEBULA_COLOR_1); nebulaGradient.addColorStop(1, UI_STYLE.NEBULA_COLOR_2);
    ctx.fillStyle = nebulaGradient; ctx.fillRect(0, 0, resolution.width, resolution.height);

    const rowHeight = resolution.height / (isDualView ? 2 : 1);
    const renderKey = (key, keyScreenX, yStart, rowH, isTopRow) => {
        if (keyScreenX + key.width < 0 || keyScreenX > resolution.width) return;
        const isActive = currentActiveKeys.has(key.note);
        const whiteKeyHeight = rowH * 0.95;
        const pressDepth = key.pressAnimation * 4;
        const yPos = isTopRow ? yStart + pressDepth : yStart + rowH - whiteKeyHeight + pressDepth;
        const cacheName = `${key.isBlack ? 'black' : 'white'}_${isActive ? 'active' : 'default'}`;
        const keyImage = keyCache[cacheName];
        if (!keyImage) return;
        if (key.pressAnimation > 0.95) createParticles(keyScreenX + key.width / 2, yPos);
        ctx.shadowColor = key.isBlack ? UI_STYLE.BLACK_KEY_SHADOW : UI_STYLE.WHITE_KEY_SHADOW;
        ctx.shadowBlur = 20; ctx.shadowOffsetY = 10 - pressDepth;
        ctx.drawImage(keyImage, keyScreenX, yPos);
        ctx.shadowColor = 'transparent';
        if (key.pressAnimation > 0) {
            const auroraHeight = whiteKeyHeight * 1.5;
            const auroraY = isTopRow ? yPos + whiteKeyHeight : yPos - auroraHeight / 2;
            const auroraGradient = ctx.createLinearGradient(0, auroraY, 0, isTopRow ? auroraY + auroraHeight : auroraY - auroraHeight);
            auroraGradient.addColorStop(0, 'transparent'); auroraGradient.addColorStop(0.5, UI_STYLE.AURORA_TRAIL); auroraGradient.addColorStop(1, 'transparent');
            ctx.globalAlpha = key.pressAnimation; ctx.fillStyle = auroraGradient;
            ctx.fillRect(keyScreenX, isTopRow ? yPos : auroraY - auroraHeight, key.width, auroraHeight * 2);
            ctx.globalAlpha = 1;
        }
        if (!key.isBlack) {
            ctx.fillStyle = isActive ? UI_STYLE.ACTIVE_LABEL_COLOR : UI_STYLE.LABEL_COLOR;
            ctx.font = `bold ${style.whiteKeyWidth * 0.28}px sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
            ctx.globalAlpha = 0.9; ctx.fillText(key.note, keyScreenX + key.width / 2, yStart + rowH - (rowH * 0.05));
            ctx.globalAlpha = 1;
        }
    };
    const renderRow = (layout, yStart, scroll) => {
        if (!layout) return;
        const renderPass = isBlackPass => layout.forEach(key => (key.isBlack === isBlackPass) && renderKey(key, key.x - scroll, yStart, rowHeight, yStart === 0));
        renderPass(false); renderPass(true);
    };

    renderRow(bottomKeyboardLayout, isDualView ? rowHeight : 0, currentScrollX);
    if (isDualView) renderRow(topKeyboardLayout, 0, independentScroll ? currentScrollX2 : currentScrollX);

    for (let i = particles.length - 1; i >= 0; i--) { const p = particles[i]; p.x += p.vx * deltaTime; p.y += p.vy * deltaTime; p.life -= deltaTime; const lifePercent = Math.max(0, p.life / p.initialLife); if (lifePercent <= 0) { particles.splice(i, 1); } else { ctx.globalAlpha = lifePercent; ctx.fillStyle = UI_STYLE.AURORA_COLOR; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius * lifePercent, 0, Math.PI * 2); ctx.fill(); } }
    ctx.globalAlpha = 1;

    if (isDualView) { ctx.strokeStyle = UI_STYLE.SEPARATOR_LINE; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, rowHeight); ctx.lineTo(resolution.width, rowHeight); ctx.stroke(); }
}

if (typeof self !== 'undefined' && self.bootstrapMediabunnyWorker) { self.bootstrapMediabunnyWorker(drawKeyboardFrame, { libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' }); }