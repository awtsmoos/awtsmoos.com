/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: A high-performance, cinematic piano renderer with volumetric lighting.
VERSION 6.0 - The Definitive, Bug-Free, and Visually Enhanced Edition.
*/

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State ---
let currentActiveKeys = new Set();
let currentScrollX = 0, currentScrollX2 = 0;
let bottomKeyboardLayout = null, topKeyboardLayout = null;
let keyCache = {}; // For high-performance pre-rendered key images
let particles = [];

// --- CINEMATIC "NEON NOIR" VISUAL STYLE ---
const UI_STYLE = {
    BACKGROUND_COLOR: '#0c0d10',
    SEPARATOR_LINE: 'rgba(255, 255, 255, 0.1)',
    
    // Keys with a clean, 3D feel
    WHITE_KEY_FILL: '#e8e9ed',
    WHITE_KEY_SHADOW: 'rgba(0, 0, 0, 0.4)',
    BLACK_KEY_FILL: '#1a1c20',
    BLACK_KEY_SHADOW: 'rgba(0, 0, 0, 0.6)',
    
    // Powerful, electric key press effects
    ACTIVE_KEY_COLOR: '#00e0ff', // Vivid Cyan
    GOD_RAY_COLOR: 'rgba(0, 224, 255, 0.12)',
    
    // Elegant labels
    LABEL_COLOR: '#a0a0a0',
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

// Pre-renders key states to offscreen canvases for a massive performance boost
function cacheKeyRenders(whiteKeyWidth, whiteKeyHeight) {
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = whiteKeyHeight * UI_STYLE.KEY_HEIGHT_RATIO;
    const states = ['default', 'active'];

    states.forEach(state => {
        // --- White Key Cache ---
        const wCanvas = new OffscreenCanvas(whiteKeyWidth, whiteKeyHeight);
        const wCtx = wCanvas.getContext('2d');
        wCtx.fillStyle = state === 'active' ? UI_STYLE.ACTIVE_KEY_COLOR : UI_STYLE.WHITE_KEY_FILL;
        wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight);
        // Add a subtle inner gradient for 3D effect
        const wGradient = wCtx.createLinearGradient(0, 0, 0, whiteKeyHeight);
        wGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        wGradient.addColorStop(0.2, 'rgba(255, 255, 255, 0)');
        wCtx.fillStyle = wGradient;
        wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight);
        keyCache[`white_${state}`] = wCanvas;

        // --- Black Key Cache ---
        const bCanvas = new OffscreenCanvas(blackKeyWidth, blackKeyHeight);
        const bCtx = bCanvas.getContext('2d');
        bCtx.fillStyle = state === 'active' ? UI_STYLE.ACTIVE_KEY_COLOR : UI_STYLE.BLACK_KEY_FILL;
        bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight);
        // Add a subtle highlight for a rounded look
        const bGradient = bCtx.createLinearGradient(0, 0, blackKeyWidth, 0);
        bGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        bGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
        bGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        bCtx.fillStyle = bGradient;
        bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight);
        keyCache[`black_${state}`] = bCanvas;
    });
}

// "Digital Dissolve" particle system
function createParticles(x, y) {
    const count = 30;
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const speed = Math.random() * 80 + 20;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: Math.random() * 0.8 + 0.4,
            initialLife: 1 // Will be set on first update
        });
    }
}


// --- The Core Drawing Logic ---

async function drawKeyboardFrame(workerContext, framePayload) {
    const { payload, ctx, canvas } = workerContext;
    const { resolution, style, alwaysDual, independentScroll, isVertical, startOctave, numOctaves } = payload;
    const deltaTime = framePayload ? framePayload.duration : (1 / 30);
    const isDualView = alwaysDual || isVertical;

    // --- State Update & Animation Tick ---
    if (framePayload) {
        currentActiveKeys = new Set(framePayload.keys);
        currentScrollX = framePayload.scrollX;
        currentScrollX2 = framePayload.scrollX2;
        if (framePayload.newlyPressedKeys) {
            const allLayouts = [bottomKeyboardLayout, topKeyboardLayout].filter(Boolean);
            framePayload.newlyPressedKeys.forEach(note => {
                for (const layout of allLayouts) {
                    const key = layout.find(k => k.note === note);
                    if (key) key.pressAnimation = 1.0;
                }
            });
        }
    }
    const allLayouts = [bottomKeyboardLayout, topKeyboardLayout].filter(Boolean);
    allLayouts.forEach(layout => layout.forEach(key => key.pressAnimation = Math.max(0, key.pressAnimation - deltaTime * 2.5)));

    // --- One-Time Initialization ---
    if (bottomKeyboardLayout === null) {
        bottomKeyboardLayout = calculateKeyLayout(startOctave, numOctaves, style.whiteKeyWidth);
        if (isDualView) {
            const topStartOctave = independentScroll ? (parseInt(startOctave) + 4) : parseInt(startOctave);
            topKeyboardLayout = calculateKeyLayout(topStartOctave, numOctaves, style.whiteKeyWidth);
        }
        const rowHeight = resolution.height / (isDualView ? 2 : 1);
        cacheKeyRenders(style.whiteKeyWidth, rowHeight * 0.95);
    }

    // --- Drawing ---

    // 1. Background
    ctx.fillStyle = UI_STYLE.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, resolution.width, resolution.height);

    // 2. Render Keys
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
        
        // Trigger particles on the first frame of animation
        if (key.pressAnimation > 0.95) createParticles(keyScreenX + key.width / 2, yPos + (isTopRow ? keyImage.height * 0.9 : keyImage.height * 0.1));

        // Draw Shadow
        ctx.shadowColor = key.isBlack ? UI_STYLE.BLACK_KEY_SHADOW : UI_STYLE.WHITE_KEY_SHADOW;
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 8 - pressDepth;
        
        // Draw pre-rendered key from cache (FAST)
        ctx.drawImage(keyImage, keyScreenX, yPos);
        ctx.shadowColor = 'transparent'; // Reset shadow for other elements

        // God Rays Effect
        if (key.pressAnimation > 0) {
            const rayY = isTopRow ? yPos + keyImage.height : yPos;
            // Use LinearGradient for stability and appearance
            const rayGradient = ctx.createLinearGradient(0, rayY, 0, isTopRow ? rayY + 300 : rayY - 300);
            rayGradient.addColorStop(0, UI_STYLE.GOD_RAY_COLOR);
            rayGradient.addColorStop(1, 'rgba(0, 224, 255, 0)');
            
            ctx.globalAlpha = key.pressAnimation;
            ctx.fillStyle = rayGradient;
            ctx.beginPath();
            ctx.moveTo(keyScreenX - key.width, isTopRow ? rayY : rayY + 2);
            ctx.lineTo(keyScreenX + key.width / 2, isTopRow ? resolution.height : 0);
            ctx.lineTo(keyScreenX + key.width * 2, isTopRow ? rayY : rayY + 2);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Labels
        if (!key.isBlack) {
            ctx.fillStyle = isActive ? UI_STYLE.ACTIVE_LABEL_COLOR : UI_STYLE.LABEL_COLOR;
            ctx.font = `bold ${style.whiteKeyWidth * 0.28}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(key.note, keyScreenX + key.width / 2, yStart + rowH - (rowH * 0.05));
        }
    };

    const renderRow = (layout, yStart, scroll) => {
        const renderPass = isBlackPass => layout.forEach(key => (key.isBlack === isBlackPass) && renderKey(key, key.x - scroll, yStart, rowHeight, yStart === 0));
        renderPass(false); // White keys first for correct layering
        renderPass(true);
    };

    renderRow(bottomKeyboardLayout, isDualView ? rowHeight : 0, currentScrollX);
    if (isDualView) renderRow(topKeyboardLayout, 0, independentScroll ? currentScrollX2 : currentScrollX);

    // 3. Particles (Drawn on top of everything)
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.initialLife === 1) p.initialLife = p.life; // Set initial life on first frame
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.vy += 20 * deltaTime; // Slight drift
        p.life -= deltaTime;
        const lifePercent = Math.max(0, p.life / p.initialLife);

        if (lifePercent <= 0) {
            particles.splice(i, 1);
        } else {
            ctx.globalAlpha = lifePercent * 0.8;
            ctx.fillStyle = UI_STYLE.ACTIVE_KEY_COLOR;
            ctx.beginPath();
            ctx.arc(p.x, p.y, lifePercent * 2.5, 0, Math.PI * 2); // Particles shrink over time
            ctx.fill();
        }
    }
    ctx.globalAlpha = 1;

    // 4. Separator Line
    if (isDualView) {
        ctx.strokeStyle = UI_STYLE.SEPARATOR_LINE;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 10]);
        ctx.beginPath();
        ctx.moveTo(0, rowHeight);
        ctx.lineTo(resolution.width, rowHeight);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

// --- Bootstrap the Worker ---
if (typeof self !== 'undefined' && self.bootstrapMediabunnyWorker) {
    self.bootstrapMediabunnyWorker(drawKeyboardFrame, {
        libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js'
    });
}