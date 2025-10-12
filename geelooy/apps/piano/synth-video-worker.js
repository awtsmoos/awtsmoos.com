/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: A high-performance, visually stunning piano renderer.
VERSION 3.0 - "Insane" visual overhaul and bug fixes.
*/

// Import the base worker library
importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State ---
let currentActiveKeys = new Set();
let currentScrollX = 0;
let currentScrollX2 = 0;
let bottomKeyboardLayout = null;
let topKeyboardLayout = null;

// --- Advanced Effects State ---
let particles = [];
let backgroundAngle = 0; // For animated background

// --- CINEMATIC VISUAL STYLE ---
const UI_STYLE = {
    // A dark, moody background with a dynamic radial highlight
    BACKGROUND_COLOR: '#0a0a0c',
    BACKGROUND_GLOW_INNER: 'rgba(30, 80, 150, 0.2)',
    BACKGROUND_GLOW_OUTER: 'rgba(10, 10, 12, 0)',

    // Keys with a 3D, material feel
    WHITE_KEY_FILL: '#f0f0f0',
    WHITE_KEY_STROKE: '#c0c0c0',
    WHITE_KEY_SHADOW: 'rgba(0, 0, 0, 0.3)',
    BLACK_KEY_GRADIENT_START: '#3a3a3a',
    BLACK_KEY_GRADIENT_END: '#111111',
    BLACK_KEY_SHADOW: 'rgba(0, 0, 0, 0.7)',

    // Key press effects that feel powerful
    ACTIVE_KEY_COLOR: '#00ffff', // Electric Cyan
    ACTIVE_KEY_GLOW: 'rgba(0, 255, 255, 0.7)',
    ACTIVE_KEY_SHOCKWAVE: 'rgba(0, 255, 255, 0.3)',
    
    // Elegant labels
    LABEL_COLOR: '#888888',
    ACTIVE_LABEL_COLOR: '#000000',

    KEY_HEIGHT_RATIO: 0.6
};

const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// --- Utility Functions ---

function calculateKeyLayout(startOctave, numOctaves, whiteKeyWidth) {
    const layout = [];
    let whiteKeyX = 0;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const baseOctave = parseInt(startOctave);

    for (let oct = baseOctave; oct < baseOctave + numOctaves; oct++) {
        NOTE_NAMES_FLAT.forEach(note => {
            const isBlack = note.includes('b');
            const noteName = (isBlack ? note.replace('b', '#') : note) + oct;
            layout.push({
                note: noteName, isBlack: isBlack,
                x: isBlack ? whiteKeyX - (blackKeyWidth / 2) : whiteKeyX,
                width: isBlack ? blackKeyWidth : whiteKeyWidth,
                pressTime: -1 // Used for animations
            });
            if (!isBlack) whiteKeyX += whiteKeyWidth;
        });
    }
    return layout;
}

// Upgraded particle system for a "spark" effect
function createParticles(x, y) {
    for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 250 + 50;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: Math.random() * 1.0 + 0.5,
            radius: Math.random() * 2.5 + 1,
            alpha: 1
        });
    }
}


// --- The Core Drawing Logic ---

async function drawKeyboardFrame(workerContext, framePayload) {
    const { payload, ctx, canvas } = workerContext;
    const { resolution, style, alwaysDual, independentScroll, isVertical, startOctave } = payload;
    const deltaTime = framePayload ? framePayload.duration : (1 / 30);
    const isDualView = alwaysDual || isVertical;

    // --- State Update ---
    if (framePayload) {
        if (framePayload.newlyPressedKeys) {
            const allLayouts = [bottomKeyboardLayout, topKeyboardLayout].filter(Boolean);
            framePayload.newlyPressedKeys.forEach(note => {
                for (const layout of allLayouts) {
                    const key = layout.find(k => k.note === note);
                    if (key) key.pressTime = 0; // Start animation
                }
            });
        }
        currentActiveKeys = new Set(framePayload.keys);
        currentScrollX = framePayload.scrollX;
        currentScrollX2 = framePayload.scrollX2;
    }

    // --- Initialize Layouts ---
    if (bottomKeyboardLayout === null) {
        const bottomOctaves = isDualView && independentScroll ? 4 : 8;
        bottomKeyboardLayout = calculateKeyLayout(startOctave, bottomOctaves, style.whiteKeyWidth);
        if (isDualView) {
            const topStartOctave = independentScroll ? (parseInt(startOctave) + 4) : parseInt(startOctave);
            topKeyboardLayout = calculateKeyLayout(topStartOctave, bottomOctaves, style.whiteKeyWidth);
        }
    }

    // --- Drawing Layers ---

    // 1. Animated Background
    backgroundAngle += deltaTime * 0.2;
    const centerX = resolution.width / 2;
    const centerY = resolution.height / 2;
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, resolution.width * 0.8);
    bgGradient.addColorStop(0, UI_STYLE.BACKGROUND_GLOW_INNER);
    bgGradient.addColorStop(1, UI_STYLE.BACKGROUND_GLOW_OUTER);
    ctx.fillStyle = UI_STYLE.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, resolution.width, resolution.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(backgroundAngle);
    ctx.translate(-centerX, -centerY);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, resolution.width, resolution.height);
    ctx.restore();

    // 2. Render Keys (with a single, correct renderKey function)
    const rowHeight = resolution.height / (isDualView ? 2 : 1);
    
    // THIS IS THE FIX: 'renderKey' is defined only ONCE inside this scope.
    const renderKey = (key, keyScreenX, yStart, rowH, isTopRow) => {
        if (keyScreenX + key.width < 0 || keyScreenX > resolution.width) return;

        const isActive = currentActiveKeys.has(key.note);
        if (isActive && key.pressTime >= 0) {
            key.pressTime += deltaTime;
        } else {
            key.pressTime = -1;
        }

        const whiteKeyHeight = rowH * 0.95;
        const blackKeyHeight = whiteKeyHeight * UI_STYLE.KEY_HEIGHT_RATIO;
        const pressDepth = isActive ? 5 : 0; // Key "press down" effect

        const yPos = isTopRow ? yStart : yStart + rowH - whiteKeyHeight;
        const keyY = yPos + pressDepth;
        const keyH = key.isBlack ? blackKeyHeight : whiteKeyHeight;
        
        if (key.pressTime === 0) createParticles(keyScreenX + key.width / 2, keyY + keyH * 0.9);

        // Key Body
        ctx.save();
        ctx.shadowColor = key.isBlack ? UI_STYLE.BLACK_KEY_SHADOW : UI_STYLE.WHITE_KEY_SHADOW;
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 8;
        if (key.isBlack) {
            const gradient = ctx.createLinearGradient(keyScreenX, keyY, keyScreenX, keyY + keyH);
            gradient.addColorStop(0, UI_STYLE.BLACK_KEY_GRADIENT_START);
            gradient.addColorStop(1, UI_STYLE.BLACK_KEY_GRADIENT_END);
            ctx.fillStyle = gradient;
            ctx.fillRect(keyScreenX, keyY, key.width, keyH);
        } else {
            ctx.fillStyle = UI_STYLE.WHITE_KEY_FILL;
            ctx.strokeStyle = UI_STYLE.WHITE_KEY_STROKE;
            ctx.lineWidth = 1;
            ctx.fillRect(keyScreenX, keyY, key.width, keyH);
            ctx.strokeRect(keyScreenX, keyY, key.width, keyH);
        }
        ctx.restore();

        // Active Key Lighting Effects
        if (isActive) {
            const shockwaveRadius = Math.min(key.pressTime * 400, key.width * 2);
            const shockwaveGradient = ctx.createRadialGradient(keyScreenX + key.width / 2, keyY + keyH, 0, keyScreenX + key.width / 2, keyY + keyH, shockwaveRadius);
            shockwaveGradient.addColorStop(0, UI_STYLE.ACTIVE_KEY_SHOCKWAVE);
            shockwaveGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
            ctx.fillStyle = shockwaveGradient;
            ctx.fillRect(keyScreenX - shockwaveRadius, keyY, key.width + shockwaveRadius*2, keyH);
            
            ctx.fillStyle = UI_STYLE.ACTIVE_KEY_COLOR;
            ctx.globalAlpha = 0.8;
            ctx.fillRect(keyScreenX, keyY, key.width, keyH);
            ctx.globalAlpha = 1;
        }

        // Labels
        if (!key.isBlack) {
            ctx.fillStyle = isActive ? UI_STYLE.ACTIVE_LABEL_COLOR : UI_STYLE.LABEL_COLOR;
            ctx.font = `bold ${style.whiteKeyWidth * 0.3}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(key.note, keyScreenX + key.width / 2, yPos + whiteKeyHeight - 10);
        }
    };

    const renderRow = (layout, yStart, scroll) => {
        const renderPass = (isBlackPass) => layout.forEach(key => (key.isBlack === isBlackPass) && renderKey(key, key.x - scroll, yStart, rowHeight, yStart === 0));
        renderPass(false);
        renderPass(true);
    };

    renderRow(bottomKeyboardLayout, isDualView ? rowHeight : 0, currentScrollX);
    if (isDualView) renderRow(topKeyboardLayout, 0, independentScroll ? currentScrollX2 : currentScrollX);

    // 3. Particles (drawn on top of keys)
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += 200 * deltaTime; // Gravity
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.life -= deltaTime;
        p.alpha = Math.max(0, p.life / 1.5);

        if (p.life <= 0) particles.splice(i, 1);
        else {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = UI_STYLE.ACTIVE_KEY_COLOR;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.globalAlpha = 1;

    // 4. Separator Line
    if (isDualView) { /* ... Unchanged ... */ }
}

// --- Bootstrap the Worker ---
if (typeof self !== 'undefined' && self.bootstrapMediabunnyWorker) {
    self.bootstrapMediabunnyWorker(drawKeyboardFrame, {
        libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js'
    });
}