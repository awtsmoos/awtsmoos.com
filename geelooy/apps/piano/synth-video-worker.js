/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: A high-performance, cinematic piano renderer with perfect 1:1 UI mirroring.
VERSION 19.2 - The "Corrected Bootstrap" Edition (Stable Architecture)
*/

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State ---
let keyEvents = [];
let scrollEvents = [{ time: 0, scrollX: 0, scrollX2: 0 }]; // Initial scroll state
let bottomKeyboardLayout = null, topKeyboardLayout = null;
let keyCache = {};
let particles = [];
let starfield = [];
let zoomFactor = 1;

// --- "NOVA" VISUAL STYLE ---
const UI_STYLE = {
    BACKGROUND_COLOR: '#010103',
    STAR_COLOR: 'rgba(200, 220, 255, 0.6)',
    WHITE_KEY_FILL: '#dfe2e8',
    WHITE_KEY_AO: 'rgba(0, 0, 0, 0.25)',
    BLACK_KEY_FILL: '#121317',
    BLACK_KEY_HIGHLIGHT: 'rgba(255, 255, 255, 0.1)',
    ACTIVE_KEY_COLOR: '#ff33cc',
    PARTICLE_COLOR: 'rgba(255, 100, 220, 0.9)',
    LABEL_COLOR_WHITE_KEY: '#707080',
    LABEL_COLOR_BLACK_KEY: '#a0a0b0',
    ACTIVE_LABEL_COLOR: '#FFFFFF'
};

const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// --- Utility Functions (Restored to original working logic) ---
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
    const blackKeyHeight = whiteKeyHeight * 0.65;
    const wCanvas = new OffscreenCanvas(whiteKeyWidth, whiteKeyHeight);
    const wCtx = wCanvas.getContext('2d');
    wCtx.fillStyle = UI_STYLE.WHITE_KEY_FILL;
    wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight);
    const aoGradient = wCtx.createLinearGradient(0, 0, whiteKeyWidth, 0);
    aoGradient.addColorStop(0, UI_STYLE.WHITE_KEY_AO); aoGradient.addColorStop(0.1, 'transparent');
    aoGradient.addColorStop(0.9, 'transparent'); aoGradient.addColorStop(1, UI_STYLE.WHITE_KEY_AO);
    wCtx.fillStyle = aoGradient; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight);
    keyCache['white_default'] = wCanvas;

    const bCanvas = new OffscreenCanvas(blackKeyWidth, blackKeyHeight);
    const bCtx = bCanvas.getContext('2d');
    bCtx.fillStyle = UI_STYLE.BLACK_KEY_FILL; bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight);
    const bGradient = bCtx.createLinearGradient(0, 0, blackKeyWidth, 0);
    bGradient.addColorStop(0, UI_STYLE.BLACK_KEY_HIGHLIGHT); bGradient.addColorStop(0.5, 'transparent');
    bCtx.fillStyle = bGradient; bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight);
    keyCache['black_default'] = bCanvas;
}

function createParticles(x, y) {
    for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 200 + 50;
        particles.push({
            x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            life: Math.random() * 1.5 + 0.5, initialLife: -1, radius: Math.random() * 2 + 1
        });
    }
}

// --- The Core Drawing Logic ---
// This function is the callback for the bootstrap and runs for every frame.
async function drawKeyboardFrame(workerContext, framePayload) {
    const { payload, ctx, canvas } = workerContext;
    const { resolution, style, alwaysDual, independentScroll, isVertical, startOctave } = payload;
    const frameTime = framePayload.time;
    const deltaTime = framePayload.duration;

    // --- ONE-TIME LAYOUT INITIALIZATION (As per original script) ---
    if (bottomKeyboardLayout === null) {
        const baseStartOctave = parseInt(startOctave);
        const userKeyWidth = style.userKeyWidth;
        const isDualView = alwaysDual || isVertical;
        
        // This logic was correct and is restored
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
        for(let i=0; i<500; i++) starfield.push({x: Math.random() * resolution.width, y: Math.random() * resolution.height, speed: Math.random() * 15 + 2, size: Math.random() * 1.5 + 0.5});
    }

    // --- STATE DETERMINATION FROM EVENT LOGS ---
    const activeKeys = new Set();
    keyEvents.forEach(event => {
        if (frameTime >= event.start && frameTime < event.end) {
            activeKeys.add(event.note);
        }
    });

    const relevantScrollEvent = scrollEvents.slice().reverse().find(e => e.time <= frameTime);
    const currentScrollX = relevantScrollEvent.scrollX;
    const currentScrollX2 = relevantScrollEvent.scrollX2;

    // --- ANIMATION & DRAWING LOGIC (With Visual Upgrades) ---
    // (This part is largely the same as the previous attempt, as it was logically sound)
    ctx.save();
    ctx.fillStyle = UI_STYLE.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, resolution.width, resolution.height);
    starfield.forEach(star => { star.y += star.speed * deltaTime; if(star.y > resolution.height) {star.y=0; star.x=Math.random()*resolution.width;} });
    ctx.fillStyle = UI_STYLE.STAR_COLOR;
    starfield.forEach(star => ctx.fillRect(star.x, star.y, star.size, star.size));
    ctx.scale(zoomFactor, zoomFactor);
    
    const isDualView = alwaysDual || isVertical;
    const unscaledRowHeight = (resolution.height / zoomFactor) / (isDualView ? 2 : 1);

    const renderKey = (key, keyScreenX, yStart) => {
        const whiteKeyHeight = unscaledRowHeight * 0.95;
        const blackKeyHeight = whiteKeyHeight * 0.65;
        const isActive = activeKeys.has(key.note);
        
        // Smooth animation logic
        const targetAnimation = isActive ? 1.0 : 0.0;
        if (Math.abs(key.pressAnimation - targetAnimation) > 0.01) {
            key.pressAnimation += (targetAnimation - key.pressAnimation) * 8.0 * deltaTime;
        } else {
            key.pressAnimation = targetAnimation;
        }

        const pressDepth = key.pressAnimation * 4;
        const yPos = yStart + (key.isBlack ? 0 : unscaledRowHeight - whiteKeyHeight);
        const height = key.isBlack ? blackKeyHeight : whiteKeyHeight;
        const keyImage = keyCache[`${key.isBlack ? 'black' : 'white'}_default`];
        if (!keyImage) return;

        ctx.drawImage(keyImage, keyScreenX, yPos + pressDepth);
        
        if (key.pressAnimation > 0) {
            ctx.globalAlpha = key.pressAnimation;
            ctx.fillStyle = UI_STYLE.ACTIVE_KEY_COLOR;
            ctx.fillRect(keyScreenX, yPos + pressDepth, key.width, height);
            ctx.globalAlpha = 1;
        }
        
        const isHighlight = key.pressAnimation > 0.5;
        ctx.font = `bold ${style.userKeyWidth * 0.22}px sans-serif`;
        ctx.textAlign = 'center';
        if (key.isBlack) {
            ctx.fillStyle = isHighlight ? UI_STYLE.ACTIVE_LABEL_COLOR : UI_STYLE.LABEL_COLOR_BLACK_KEY;
            ctx.textBaseline = 'middle';
            ctx.fillText(key.note.slice(0,-1), keyScreenX + key.width / 2, yPos + height * 0.8);
        } else {
            ctx.fillStyle = isHighlight ? UI_STYLE.ACTIVE_LABEL_COLOR : UI_STYLE.LABEL_COLOR_WHITE_KEY;
            ctx.textBaseline = 'bottom';
            ctx.fillText(key.note, keyScreenX + key.width / 2, yStart + unscaledRowHeight - (unscaledRowHeight * 0.05));
        }
    };

    const renderRow = (layout, yStart, transform) => {
        if (!layout) return;
        const renderPass = isBlackPass => layout.forEach(key => {
            if (key.isBlack !== isBlackPass) return;
            const keyScreenX = key.x + transform;
            if (keyScreenX + key.width > 0 && keyScreenX < style.userViewportWidth) {
                 renderKey(key, keyScreenX, yStart);
            }
        });
        renderPass(false); // White keys first
        renderPass(true);  // Black keys on top
    };

    renderRow(bottomKeyboardLayout, isDualView ? unscaledRowHeight : 0, -currentScrollX);
    if (isDualView) {
        renderRow(topKeyboardLayout, 0, independentScroll ? -currentScrollX2 : (style.userViewportWidth - currentScrollX));
    }
    
    ctx.restore();
    if (isDualView) { ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, resolution.height / 2); ctx.lineTo(resolution.width, resolution.height / 2); ctx.stroke(); }
}


// --- DEDICATED EVENT LISTENER ---
// This safely listens for our custom messages and populates the event arrays.
// It does NOT interfere with the bootstrap's own message handling.
self.addEventListener('message', (e) => {
    const { type, payload } = e.data;
    switch (type) {
        case 'ADD_KEY_EVENT':
            keyEvents.push(payload);
            break;
        case 'UPDATE_SCROLL':
            scrollEvents.push(payload);
            break;
    }
});


// --- RESTORED BOOTSTRAP INITIALIZATION ---
// This is the correct, original way to start the worker. It will handle
// its own messages for initialization and finalization.
if (typeof self !== 'undefined' && self.bootstrapMediabunnyWorker) {
    self.bootstrapMediabunnyWorker(drawKeyboardFrame, {
        libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js'
    });
}