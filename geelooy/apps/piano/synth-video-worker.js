/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: A high-performance, visually stunning piano renderer.
*/

// Import the NEW, refactored base worker library
importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State ---
// These variables will store the latest known state of the piano.
let currentActiveKeys = new Set();
let currentScrollX = 0;
let currentScrollX2 = 0;
let fullKeyboardLayout = []; // Cache the calculated layout

// --- Particle System for Touch Effects ---
let particles = [];
const PARTICLE_LIFESPAN = 0.8; // in seconds
const PARTICLE_COUNT = 30;
const PARTICLE_SPEED = 150; // pixels per second

// --- Enhanced Visual Style ---
const UI_STYLE = {
    BACKGROUND_GRADIENT_START: '#1a1c20',
    BACKGROUND_GRADIENT_END: '#2c2f36',
    SEPARATOR_LINE: 'rgba(255, 255, 255, 0.1)',

    // White Keys
    WHITE_KEY_GRADIENT_START: '#FFFFFF',
    WHITE_KEY_GRADIENT_END: '#E8E8E8',
    WHITE_KEY_SHADOW: 'rgba(0, 0, 0, 0.4)',
    ACTIVE_WHITE_KEY_GRADIENT_START: '#4a90e2', // A pleasant blue
    ACTIVE_WHITE_KEY_GRADIENT_END: '#3a7bc8',

    // Black Keys
    BLACK_KEY_GRADIENT_START: '#282828',
    BLACK_KEY_GRADIENT_END: '#1a1a1a',
    BLACK_KEY_SHADOW: 'rgba(0, 0, 0, 0.6)',
    ACTIVE_BLACK_KEY_GRADIENT_START: '#333333',
    ACTIVE_BLACK_KEY_GRADIENT_END: '#222222',

    // Effects
    ACTIVE_KEY_GLOW: 'rgba(74, 144, 226, 0.7)',
    LABEL_COLOR: '#555555',
    ACTIVE_LABEL_COLOR: '#FFFFFF',
    KEY_HEIGHT_RATIO: 0.6
};

const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// --- Utility Functions ---

function calculateKeyLayout(startOctave, whiteKeyWidth, numOctaves) {
    const layout = [];
    let whiteKeyX = 0;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const baseStartOctave = parseInt(startOctave);

    for (let oct = baseStartOctave; oct < baseStartOctave + numOctaves; oct++) {
        NOTE_NAMES_FLAT.forEach(note => {
            if (oct + (NOTE_NAMES_FLAT.indexOf(note) / 12) > 9.0) return;

            const isBlack = note.includes('b');
            const noteName = (isBlack ? note.replace('b', '#') : note) + oct;

            layout.push({
                note: noteName,
                isBlack: isBlack,
                x: isBlack ? whiteKeyX - (blackKeyWidth / 2) : whiteKeyX,
                width: isBlack ? blackKeyWidth : whiteKeyWidth,
                octave: oct,
                justPressed: false // For animations
            });

            if (!isBlack) whiteKeyX += whiteKeyWidth;
        });
    }
    return layout;
}

function createParticles(x, y, isBlackKey) {
    const color = isBlackKey ? `rgba(200, 200, 255, 0.9)` : `rgba(74, 144, 226, 0.9)`;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * PARTICLE_SPEED;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: PARTICLE_LIFESPAN,
            radius: Math.random() * 2 + 1,
            color: color
        });
    }
}

// --- The Core Drawing Logic ---

/**
 * This is our dedicated frame drawing function.
 * It's passed to the bootstrap function and called for every frame.
 * @param {object} workerContext - The context from the base worker.
 * @param {object} framePayload - The payload from the 'RENDER_FRAME' message.
 */
async function drawKeyboardFrame(workerContext, framePayload) {
    const { payload, ctx, canvas } = workerContext;
    const { resolution, style, alwaysDual, independentScroll, isVertical, startOctave, numOctaves} = payload;
    const deltaTime = framePayload ? framePayload.duration : (1 / 30);

    // --- State Update ---
    if (framePayload) {
        if (framePayload.newlyPressedKeys) {
            framePayload.newlyPressedKeys.forEach(note => {
                const key = fullKeyboardLayout.find(k => k.note === note);
                if (key) key.justPressed = true;
            });
        }

        currentActiveKeys = new Set(framePayload.keys);
        currentScrollX = framePayload.scrollX;
        currentScrollX2 = framePayload.scrollX2;
    }

    // --- Recalculate layout only if it's not cached ---
    if (fullKeyboardLayout.length === 0) {
        fullKeyboardLayout = calculateKeyLayout(startOctave, style.whiteKeyWidth, numOctaves);
    }
    
    // --- Drawing Setup ---
    const isDualView = alwaysDual || isVertical;
    const rowHeight = resolution.height / (isDualView ? 2 : 1);
    const whiteKeyHeight = rowHeight * 0.95;
    const blackKeyHeight = whiteKeyHeight * UI_STYLE.KEY_HEIGHT_RATIO;
    const C5_KEY = fullKeyboardLayout.find(k => k.note === `C${parseInt(startOctave) + 4}`);
    const C5_X_POS = C5_KEY ? C5_KEY.x : 0;

    // --- 1. Draw Background ---
    const bgGradient = ctx.createLinearGradient(0, 0, 0, resolution.height);
    bgGradient.addColorStop(0, UI_STYLE.BACKGROUND_GRADIENT_START);
    bgGradient.addColorStop(1, UI_STYLE.BACKGROUND_GRADIENT_END);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, resolution.width, resolution.height);

    // --- 2. Update and Draw Particles ---
    ctx.fillStyle = 'white'; // default particle color
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.life -= deltaTime;

        if (p.life <= 0) {
            particles.splice(i, 1);
        } else {
            ctx.globalAlpha = p.life / PARTICLE_LIFESPAN;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.globalAlpha = 1;

    // --- 3. Render Keys (in two passes for correct layering) ---
    const yStartBottom = isDualView ? rowHeight : 0;
    const renderPass = (isBlackPass) => {
        fullKeyboardLayout.forEach(key => {
            if (key.isBlack !== isBlackPass) return;

            // --- Bottom Keyboard ---
            renderKey(key, key.x - currentScrollX, yStartBottom, rowHeight, false);
            
            // --- Top Keyboard (if dual view) ---
            if (isDualView) {
                const keyOctave = parseInt(key.note.match(/\d+/g));
                if (keyOctave >= parseInt(startOctave) + 4) {
                    const actualTopScroll = independentScroll ? currentScrollX2 : currentScrollX;
                    const topX = key.x - (C5_X_POS - actualTopScroll);
                    renderKey(key, topX, 0, rowHeight, true);
                }
            }
        });
    };

    const renderKey = (key, keyScreenX, yStart, rowH, isTopRow) => {
        if (keyScreenX + key.width < 0 || keyScreenX > resolution.width) return; // Cull off-screen keys

        const isActive = currentActiveKeys.has(key.note);
        const verticalPadding = (rowH - whiteKeyHeight) / 2;
        const keyY = (isTopRow ? yStart + verticalPadding : yStart + rowH - whiteKeyHeight - verticalPadding) + (key.isBlack ? 0 : blackKeyHeight * 0.02);
        const keyH = key.isBlack ? blackKeyHeight : whiteKeyHeight;
        
        // --- Key Press Animation Trigger ---
        if (key.justPressed) {
            createParticles(keyScreenX + key.width / 2, keyY + keyH * 0.8, key.isBlack);
            key.justPressed = false;
        }

        // --- Key Body and Shadow ---
        ctx.save();
        if (!key.isBlack) {
            ctx.shadowColor = UI_STYLE.WHITE_KEY_SHADOW;
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 4;
        } else {
            ctx.shadowColor = UI_STYLE.BLACK_KEY_SHADOW;
            ctx.shadowBlur = 12;
            ctx.shadowOffsetY = 6;
        }
        
        const gradient = ctx.createLinearGradient(keyScreenX, keyY, keyScreenX, keyY + keyH);
        if (key.isBlack) {
            gradient.addColorStop(0, isActive ? UI_STYLE.ACTIVE_BLACK_KEY_GRADIENT_START : UI_STYLE.BLACK_KEY_GRADIENT_START);
            gradient.addColorStop(1, isActive ? UI_STYLE.ACTIVE_BLACK_KEY_GRADIENT_END : UI_STYLE.BLACK_KEY_GRADIENT_END);
        } else {
            gradient.addColorStop(0, isActive ? UI_STYLE.ACTIVE_WHITE_KEY_GRADIENT_START : UI_STYLE.WHITE_KEY_GRADIENT_START);
            gradient.addColorStop(1, isActive ? UI_STYLE.ACTIVE_WHITE_KEY_GRADIENT_END : UI_STYLE.WHITE_KEY_GRADIENT_END);
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(keyScreenX, keyY, key.width, keyH);
        ctx.restore();

        // --- Active Key Glow ---
        if (isActive) {
            ctx.save();
            ctx.shadowColor = UI_STYLE.ACTIVE_KEY_GLOW;
            ctx.shadowBlur = 25;
            ctx.fillStyle = UI_STYLE.ACTIVE_KEY_GLOW;
            ctx.fillRect(keyScreenX, keyY, key.width, keyH);
            ctx.restore();
        }

        // --- Key Label (for white keys) ---
        if (!key.isBlack) {
            ctx.fillStyle = isActive ? UI_STYLE.ACTIVE_LABEL_COLOR : UI_STYLE.LABEL_COLOR;
            ctx.font = `bold ${style.whiteKeyWidth * 0.3}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(key.note, keyScreenX + key.width / 2, keyY + keyH - 10);
        }
    };
    
    renderPass(false); // Draw all white keys first
    renderPass(true);  // Then draw all black keys on top

    // --- 4. Draw Separator Line ---
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