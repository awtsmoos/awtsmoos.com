/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: A high-performance, visually stunning piano renderer.
VERSION 2.0 - Corrected dual-keyboard and scrolling logic.
*/

// Import the base worker library
importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State ---
let currentActiveKeys = new Set();
let currentScrollX = 0;
let currentScrollX2 = 0;
// NEW: Separate layouts for each row for clean logic
let bottomKeyboardLayout = null;
let topKeyboardLayout = null;

// --- Particle System & Style Constants (Unchanged) ---
let particles = [];
const PARTICLE_LIFESPAN = 0.8;
const PARTICLE_COUNT = 30;
const PARTICLE_SPEED = 150;
const UI_STYLE = { /* ... Your beautiful style constants ... */ };
UI_STYLE.BACKGROUND_GRADIENT_START = '#1a1c20';
UI_STYLE.BACKGROUND_GRADIENT_END = '#2c2f36';
UI_STYLE.SEPARATOR_LINE = 'rgba(255, 255, 255, 0.1)';
UI_STYLE.WHITE_KEY_GRADIENT_START = '#FFFFFF';
UI_STYLE.WHITE_KEY_GRADIENT_END = '#E8E8E8';
UI_STYLE.WHITE_KEY_SHADOW = 'rgba(0, 0, 0, 0.4)';
UI_STYLE.ACTIVE_WHITE_KEY_GRADIENT_START = '#4a90e2';
UI_STYLE.ACTIVE_WHITE_KEY_GRADIENT_END = '#3a7bc8';
UI_STYLE.BLACK_KEY_GRADIENT_START = '#282828';
UI_STYLE.BLACK_KEY_GRADIENT_END = '#1a1a1a';
UI_STYLE.BLACK_KEY_SHADOW = 'rgba(0, 0, 0, 0.6)';
UI_STYLE.ACTIVE_BLACK_KEY_GRADIENT_START = '#333333';
UI_STYLE.ACTIVE_BLACK_KEY_GRADIENT_END = '#222222';
UI_STYLE.ACTIVE_KEY_GLOW = 'rgba(74, 144, 226, 0.7)';
UI_STYLE.LABEL_COLOR = '#555555';
UI_STYLE.ACTIVE_LABEL_COLOR = '#FFFFFF';
UI_STYLE.KEY_HEIGHT_RATIO = 0.6;
const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// --- Utility Functions ---

/**
 * REWRITTEN: Now generates a keyboard layout for a specific start octave and number of octaves.
 * This is the key to having separate layouts for each row.
 */
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
                note: noteName,
                isBlack: isBlack,
                x: isBlack ? whiteKeyX - (blackKeyWidth / 2) : whiteKeyX,
                width: isBlack ? blackKeyWidth : whiteKeyWidth,
                justPressed: false
            });

            if (!isBlack) whiteKeyX += whiteKeyWidth;
        });
    }
    return layout;
}

function createParticles(x, y, isBlackKey) { /* ... Unchanged ... */ }
function createParticles(x, y, isBlackKey) {
    const color = isBlackKey ? `rgba(200, 200, 255, 0.9)` : `rgba(74, 144, 226, 0.9)`;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * PARTICLE_SPEED;
        particles.push({
            x: x, y: y,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            life: PARTICLE_LIFESPAN, radius: Math.random() * 2 + 1, color: color
        });
    }
}


// --- The Core Drawing Logic ---

/**
 * REWRITTEN: The main drawing function with corrected logic.
 */
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
                    if (key) {
                        key.justPressed = true;
                        break;
                    }
                }
            });
        }
        currentActiveKeys = new Set(framePayload.keys);
        currentScrollX = framePayload.scrollX;
        currentScrollX2 = framePayload.scrollX2;
    }

    // --- CRITICAL FIX: Generate layouts ONCE based on payload ---
    if (bottomKeyboardLayout === null) {
        const bottomOctaves = isDualView && independentScroll ? 4 : 8;
        bottomKeyboardLayout = calculateKeyLayout(startOctave, bottomOctaves, style.whiteKeyWidth);
        if (isDualView) {
            const topStartOctave = independentScroll ? (parseInt(startOctave) + 4) : parseInt(startOctave);
            topKeyboardLayout = calculateKeyLayout(topStartOctave, bottomOctaves, style.whiteKeyWidth);
        }
    }

    // --- Drawing Setup ---
    const rowHeight = resolution.height / (isDualView ? 2 : 1);

    // 1. Draw Background & Particles (Unchanged)
    const bgGradient = ctx.createLinearGradient(0, 0, 0, resolution.height);
    bgGradient.addColorStop(0, UI_STYLE.BACKGROUND_GRADIENT_START);
    bgGradient.addColorStop(1, UI_STYLE.BACKGROUND_GRADIENT_END);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, resolution.width, resolution.height);
    for (let i = particles.length - 1; i >= 0; i--) { /* ... Particle logic ... */ }
        const p = particles[i]; p.x += p.vx * deltaTime; p.y += p.vy * deltaTime; p.life -= deltaTime;
        if (p.life <= 0) { particles.splice(i, 1); } else {
            ctx.globalAlpha = p.life / PARTICLE_LIFESPAN; ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
        }
    ctx.globalAlpha = 1;


    // --- 2. Render Keys (SIMPLIFIED AND CORRECTED) ---
    const renderRow = (layout, yStart, scroll) => {
        const renderPass = (isBlackPass) => {
            layout.forEach(key => {
                if (key.isBlack !== isBlackPass) return;
                renderKey(key, key.x - scroll, yStart, rowHeight, yStart === 0);
            });
        };
        renderPass(false); // White keys first
        renderPass(true);  // Black keys on top
    };

    const yStartBottom = isDualView ? rowHeight : 0;
    renderRow(bottomKeyboardLayout, yStartBottom, currentScrollX);
    if (isDualView) {
        const topScroll = independentScroll ? currentScrollX2 : currentScrollX;
        renderRow(topKeyboardLayout, 0, topScroll);
    }

    // Key rendering function (mostly unchanged)
    const renderKey = (key, keyScreenX, yStart, rowH, isTopRow) => { /* ... Your beautiful key rendering logic ... */ };
    const renderKey = (key, keyScreenX, yStart, rowH, isTopRow) => {
        if (keyScreenX + key.width < 0 || keyScreenX > resolution.width) return;
        const isActive = currentActiveKeys.has(key.note);
        const whiteKeyHeight = rowH * 0.95;
        const blackKeyHeight = whiteKeyHeight * UI_STYLE.KEY_HEIGHT_RATIO;
        const keyY = (isTopRow ? yStart : yStart + rowH - whiteKeyHeight) + (key.isBlack ? 0 : blackKeyHeight * 0.02);
        const keyH = key.isBlack ? blackKeyHeight : whiteKeyHeight;
        if (key.justPressed) { createParticles(keyScreenX + key.width / 2, keyY + keyH * 0.8, key.isBlack); key.justPressed = false; }
        ctx.save();
        ctx.shadowColor = key.isBlack ? UI_STYLE.BLACK_KEY_SHADOW : UI_STYLE.WHITE_KEY_SHADOW;
        ctx.shadowBlur = key.isBlack ? 12 : 8; ctx.shadowOffsetY = key.isBlack ? 6 : 4;
        const gradient = ctx.createLinearGradient(keyScreenX, keyY, keyScreenX, keyY + keyH);
        if (key.isBlack) { gradient.addColorStop(0, isActive ? UI_STYLE.ACTIVE_BLACK_KEY_GRADIENT_START : UI_STYLE.BLACK_KEY_GRADIENT_START); gradient.addColorStop(1, isActive ? UI_STYLE.ACTIVE_BLACK_KEY_GRADIENT_END : UI_STYLE.BLACK_KEY_GRADIENT_END);
        } else { gradient.addColorStop(0, isActive ? UI_STYLE.ACTIVE_WHITE_KEY_GRADIENT_START : UI_STYLE.WHITE_KEY_GRADIENT_START); gradient.addColorStop(1, isActive ? UI_STYLE.ACTIVE_WHITE_KEY_GRADIENT_END : UI_STYLE.WHITE_KEY_GRADIENT_END); }
        ctx.fillStyle = gradient; ctx.fillRect(keyScreenX, keyY, key.width, keyH);
        ctx.restore();
        if (isActive) { ctx.save(); ctx.shadowColor = UI_STYLE.ACTIVE_KEY_GLOW; ctx.shadowBlur = 25; ctx.fillStyle = UI_STYLE.ACTIVE_KEY_GLOW; ctx.fillRect(keyScreenX, keyY, key.width, keyH); ctx.restore(); }
        if (!key.isBlack) { ctx.fillStyle = isActive ? UI_STYLE.ACTIVE_LABEL_COLOR : UI_STYLE.LABEL_COLOR; ctx.font = `bold ${style.whiteKeyWidth * 0.3}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(key.note, keyScreenX + key.width / 2, keyY + keyH - 10); }
    };


    // --- 3. Draw Separator Line ---
    if (isDualView) {
        ctx.strokeStyle = UI_STYLE.SEPARATOR_LINE;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, rowHeight);
        ctx.lineTo(resolution.width, rowHeight);
        ctx.stroke();
    }
}

// --- Bootstrap the Worker ---
if (typeof self !== 'undefined' && self.bootstrapMediabunnyWorker) {
    self.bootstrapMediabunnyWorker(drawKeyboardFrame, {
        libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js'
    });
}