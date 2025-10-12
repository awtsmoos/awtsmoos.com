/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: A high-performance, cinematic piano renderer with perfect 1:1 UI mirroring.
VERSION 14.0 - The Definitive, Error-Free, Perfect Mirror Edition.
*/

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State ---
let currentActiveKeys = new Set();
let currentScrollX = 0, currentScrollX2 = 0;
let bottomKeyboardLayout = null, topKeyboardLayout = null;
let keyCache = {};
let particles = [];
let starfield = [];
let zoomFactor = 1;

// --- "HYPERNOVA" VISUAL STYLE ---
const UI_STYLE = {
    BACKGROUND_COLOR: '#040509',
    STAR_COLOR: 'rgba(200, 220, 255, 0.5)',
    WHITE_KEY_FILL: '#dfe2e8',
    WHITE_KEY_AO: 'rgba(0, 0, 0, 0.2)', // Ambient Occlusion
    BLACK_KEY_FILL: '#121317',
    BLACK_KEY_HIGHLIGHT: 'rgba(255, 255, 255, 0.05)',
    ACTIVE_KEY_COLOR: '#ff8000', // Intense Orange/Gold
    HYPERNOVA_GLOW: 'rgba(255, 128, 0, 0.8)',
    HYPERNOVA_SHOCKWAVE: 'rgba(255, 128, 0, 0.3)',
    LABEL_COLOR: '#808080',
    ACTIVE_LABEL_COLOR: '#000000',
    KEY_HEIGHT_RATIO: 0.65
};

const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// --- Utility Functions ---

function calculateKeyLayout(startOctave, numOctaves, whiteKeyWidth) {
    const layout = [];
    let whiteKeyX = 0;
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
        // White Key
        const wCanvas = new OffscreenCanvas(whiteKeyWidth, whiteKeyHeight);
        const wCtx = wCanvas.getContext('2d');
        wCtx.fillStyle = UI_STYLE.WHITE_KEY_FILL; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight);
        const aoGradient = wCtx.createLinearGradient(0, 0, whiteKeyWidth, 0);
        aoGradient.addColorStop(0, UI_STYLE.WHITE_KEY_AO); aoGradient.addColorStop(0.1, 'transparent');
        aoGradient.addColorStop(0.9, 'transparent'); aoGradient.addColorStop(1, UI_STYLE.WHITE_KEY_AO);
        wCtx.fillStyle = aoGradient; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight);
        if (isActive) { wCtx.fillStyle = UI_STYLE.ACTIVE_KEY_COLOR; wCtx.globalAlpha = 0.9; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight); wCtx.globalAlpha = 1; }
        keyCache[`white_${state}`] = wCanvas;
        // Black Key
        const bCanvas = new OffscreenCanvas(blackKeyWidth, blackKeyHeight);
        const bCtx = bCanvas.getContext('2d');
        bCtx.fillStyle = UI_STYLE.BLACK_KEY_FILL; bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight);
        const bGradient = bCtx.createLinearGradient(0, 0, blackKeyWidth, 0);
        bGradient.addColorStop(0.5, UI_STYLE.BLACK_KEY_HIGHLIGHT); bGradient.addColorStop(1, 'transparent');
        bCtx.fillStyle = bGradient; bCtx.fillRect(0, 0, blackKeyWidth / 2, blackKeyHeight);
        if (isActive) { bCtx.fillStyle = UI_STYLE.ACTIVE_KEY_COLOR; bCtx.globalAlpha = 0.9; bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight); bCtx.globalAlpha = 1; }
        keyCache[`black_${state}`] = bCanvas;
    });
}

function createParticles(x, y) { for (let i = 0; i < 40; i++) { const angle = Math.random() * Math.PI * 2; const speed = Math.random() * 200 + 50; particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: Math.random() * 1.5 + 0.5, initialLife: -1, radius: Math.random() * 2.5 + 1 }); } }

// --- The Core Drawing Logic ---
async function drawKeyboardFrame(workerContext, framePayload) {
    const { payload, ctx, canvas } = workerContext;
    const { resolution, style, alwaysDual, independentScroll, isVertical, startOctave } = payload;
    const deltaTime = framePayload ? (framePayload.duration || 1 / 30) : (1 / 30);

    // --- State Update ---
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
    allLayouts.forEach(layout => layout.forEach(key => key.pressAnimation = Math.max(0, key.pressAnimation - deltaTime * 2.0)));

    // --- DEFINITIVE ONE-TIME LAYOUT INITIALIZATION ---
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

        const videoCanvasWidth = resolution.width;
        const userViewportWidth = style.userViewportWidth || videoCanvasWidth;
        zoomFactor = userViewportWidth > 0 ? videoCanvasWidth / userViewportWidth : 1;
        const rowHeight = (resolution.height / zoomFactor) / (isDualView ? 2 : 1);
        cacheKeyRenders(userKeyWidth, rowHeight * 0.95);
        for(let i=0; i<300; i++) starfield.push({x: Math.random() * videoCanvasWidth, y: Math.random() * resolution.height, speed: Math.random() * 5 + 1, alpha: Math.random() * 0.5 + 0.1});
    }

    // --- Drawing ---
    ctx.save();
    
    // 1. Draw background in native resolution
    ctx.fillStyle = UI_STYLE.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, resolution.width, resolution.height);
    starfield.forEach(star => {
        star.y += star.speed * deltaTime;
        if (star.y > resolution.height) { star.y = 0; star.x = Math.random() * resolution.width; }
        ctx.globalAlpha = star.alpha;
        ctx.fillStyle = UI_STYLE.STAR_COLOR;
        ctx.fillRect(star.x, star.y, 1, 1);
    });
    ctx.globalAlpha = 1;

    // 2. Scale the ENTIRE context to mirror the user's view
    ctx.scale(zoomFactor, zoomFactor);

    const isDualView = alwaysDual || isVertical;
    const unscaledRowHeight = (resolution.height / zoomFactor) / (isDualView ? 2 : 1);

    // 3. Render Keys within the scaled context
    const renderKey = (key, keyScreenX, yStart) => {
        const isActive = currentActiveKeys.has(key.note);
        const whiteKeyHeight = unscaledRowHeight * 0.95;
        const pressDepth = key.pressAnimation * 3;
        const isTopRow = yStart === 0;
        const yPos = isTopRow ? yStart + pressDepth : yStart + unscaledRowHeight - whiteKeyHeight + pressDepth;
        const cacheName = `${key.isBlack ? 'black' : 'white'}_${isActive ? 'active' : 'default'}`;
        const keyImage = keyCache[cacheName];
        if (!keyImage) return;

        if (key.pressAnimation > 0.95) createParticles(keyScreenX + key.width / 2, yPos);
        
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 10 - pressDepth;
        ctx.drawImage(keyImage, keyScreenX, yPos);
        ctx.shadowColor = 'transparent';

        // Hypernova Shockwave Effect
        if (key.pressAnimation > 0) {
            const shockwaveRadius = (1 - key.pressAnimation) * key.width * 2;
            
            // *** CRITICAL BUG FIX ***
            // Ensure radius is always a valid, non-negative number before drawing.
            if (isFinite(shockwaveRadius) && shockwaveRadius > 0) {
                ctx.globalAlpha = key.pressAnimation * 0.8;
                const shockwaveGradient = ctx.createRadialGradient(keyScreenX + key.width / 2, yPos + whiteKeyHeight / 2, 0, keyScreenX + key.width / 2, yPos + whiteKeyHeight / 2, shockwaveRadius);
                shockwaveGradient.addColorStop(0, 'transparent');
                shockwaveGradient.addColorStop(0.7, UI_STYLE.HYPERNOVA_SHOCKWAVE);
                shockwaveGradient.addColorStop(1, 'transparent');
                ctx.fillStyle = shockwaveGradient;
                ctx.fillRect(keyScreenX - shockwaveRadius, yPos - shockwaveRadius, key.width + shockwaveRadius * 2, whiteKeyHeight + shockwaveRadius * 2);
                ctx.globalAlpha = 1;
            }
        }

        // Key Labels
        if (!key.isBlack) {
            ctx.fillStyle = isActive ? UI_STYLE.ACTIVE_LABEL_COLOR : UI_STYLE.LABEL_COLOR;
            ctx.font = `bold ${style.userKeyWidth * 0.28}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(key.note, keyScreenX + key.width / 2, yStart + unscaledRowHeight - (unscaledRowHeight * 0.05));
        }
    };

    const renderRow = (layout, yStart, scroll) => {
        if (!layout) return;
        const renderPass = isBlackPass => layout.forEach(key => {
            if (key.isBlack !== isBlackPass) return;
            const keyScreenX = key.x - scroll;
            if (keyScreenX + key.width > 0 && keyScreenX < style.userViewportWidth) {
                 renderKey(key, keyScreenX, yStart);
            }
        });
        renderPass(false);
        renderPass(true);
    };

    renderRow(bottomKeyboardLayout, isDualView ? unscaledRowHeight : 0, currentScrollX);
    if (isDualView) renderRow(topKeyboardLayout, 0, independentScroll ? currentScrollX2 : currentScrollX);

    // 4. Particles (drawn in scaled context for correct positioning)
    for (let i = particles.length - 1; i >= 0; i--) { const p = particles[i]; if(p.initialLife === -1) p.initialLife = p.life; p.x += p.vx * deltaTime; p.y += p.vy * deltaTime; p.vy += 400 * deltaTime; p.life -= deltaTime; const lifePercent = Math.max(0, p.life / p.initialLife); if (lifePercent <= 0) { particles.splice(i, 1); } else { ctx.globalAlpha = lifePercent; ctx.fillStyle = UI_STYLE.HYPERNOVA_GLOW; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius * lifePercent, 0, Math.PI * 2); ctx.fill(); } }
    
    ctx.restore(); // Restore context to native resolution

    // 5. Separator line (drawn in native resolution)
    if (isDualView) { ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, resolution.height / 2); ctx.lineTo(resolution.width, resolution.height / 2); ctx.stroke(); }
}

if (typeof self !== 'undefined' && self.bootstrapMediabunnyWorker) { self.bootstrapMediabunnyWorker(drawKeyboardFrame, { libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' }); }