/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: A high-performance, cinematic piano renderer with perfect 1:1 UI mirroring.
VERSION 20.0 - The "Cyberpunk Nebula" Final Edition (Stable & Intense)
*/

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State ---
let keyEvents = [];
let scrollEvents = [{ time: 0, scrollX: 0, scrollX2: 0 }]; // Initial state is required
let bottomKeyboardLayout = null, topKeyboardLayout = null;
let keyCache = {};
let particles = [];
let starfield = [];
let zoomFactor = 1;

// --- "CYBERPUNK NEBULA" VISUAL STYLE ---
const UI_STYLE = {
    BACKGROUND_GRADIENT_START: '#020024',
    BACKGROUND_GRADIENT_END: '#0d0d2e',
    STAR_COLOR: 'rgba(200, 220, 255, 0.7)',
    WHITE_KEY_FILL: '#dfe2e8',
    WHITE_KEY_AO: 'rgba(0, 0, 0, 0.25)',
    BLACK_KEY_FILL: '#121317',
    BLACK_KEY_HIGHLIGHT: 'rgba(255, 255, 255, 0.1)',
    
    // Insane Active Key Effects
    ACTIVE_KEY_BASE_COLOR: '#ff00d4',
    ACTIVE_KEY_PULSE_COLOR: '#ffffff',
    ACTIVE_KEY_GLOW_COLOR: 'rgba(255, 0, 212, 0.6)',
    SHOCKWAVE_COLOR: 'rgba(0, 255, 255, 0.5)',
    PARTICLE_COLOR_1: '#00ffff',
    PARTICLE_COLOR_2: '#ff00d4',

    // High Contrast Labels
    LABEL_COLOR_WHITE_KEY: '#707080',
    LABEL_COLOR_BLACK_KEY: '#a0a0b0',
    ACTIVE_LABEL_COLOR: '#FFFFFF'
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
    for (let i = 0; i < 80; i++) { // More particles
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 250 + 75;
        particles.push({
            x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            life: Math.random() * 2.0 + 0.8, initialLife: -1, radius: Math.random() * 2.5 + 1,
            color: Math.random() > 0.5 ? UI_STYLE.PARTICLE_COLOR_1 : UI_STYLE.PARTICLE_COLOR_2
        });
    }
}

// --- The Core Drawing Logic ---
async function drawKeyboardFrame(workerContext, framePayload) {
    const { payload, ctx, canvas } = workerContext;
    const { resolution, style, alwaysDual, independentScroll, isVertical, startOctave } = payload;

    // --- ONE-TIME LAYOUT INITIALIZATION ---
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
        for(let i=0; i<600; i++) starfield.push({x: Math.random() * resolution.width, y: Math.random() * resolution.height, speed: Math.random() * 20 + 5, size: Math.random() * 2 + 0.5});
    }

    // --- DATA COLLECTION PHASE ---
    if (framePayload && framePayload.dataType) {
        if (framePayload.dataType === 'KEY_EVENT') keyEvents.push(framePayload.event);
        else if (framePayload.dataType === 'SCROLL_UPDATE') scrollEvents.push(framePayload.scroll);
        return; // Exit early after collecting data
    }
    
    // --- DEFENSIVE CHECK & FRAME TIME CALCULATION ---
    if (!framePayload || typeof framePayload.time === 'undefined') {
        ctx.fillStyle = UI_STYLE.BACKGROUND_GRADIENT_START;
        ctx.fillRect(0, 0, resolution.width, resolution.height);
        return;
    }
    const frameTime = framePayload.time;
    const deltaTime = framePayload.duration;

    // --- STATE CALCULATION FOR THIS FRAME ---
    const activeKeys = new Set();
    keyEvents.forEach(event => {
        if (frameTime >= event.start && frameTime < event.end) activeKeys.add(event.note);
    });
    const relevantScrollEvent = scrollEvents.slice().reverse().find(e => e.time <= frameTime);
    const currentScrollX = relevantScrollEvent.scrollX;
    const currentScrollX2 = relevantScrollEvent.scrollX2;

    // --- DRAWING ---
    // Background
    ctx.save();
    const bgGradient = ctx.createLinearGradient(0, 0, 0, resolution.height);
    bgGradient.addColorStop(0, UI_STYLE.BACKGROUND_GRADIENT_START);
    bgGradient.addColorStop(1, UI_STYLE.BACKGROUND_GRADIENT_END);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, resolution.width, resolution.height);

    // Starfield
    starfield.forEach(star => { star.y += star.speed * deltaTime; if(star.y > resolution.height) {star.y=0; star.x=Math.random()*resolution.width;} });
    ctx.fillStyle = UI_STYLE.STAR_COLOR;
    starfield.forEach(star => ctx.fillRect(star.x, star.y, star.size, star.size));
    
    // Scale to match user viewport
    ctx.scale(zoomFactor, zoomFactor);
    const isDualView = alwaysDual || isVertical;
    const unscaledRowHeight = (resolution.height / zoomFactor) / (isDualView ? 2 : 1);

    const renderKey = (key, keyScreenX, yStart) => {
        const whiteKeyHeight = unscaledRowHeight * 0.95;
        const blackKeyHeight = whiteKeyHeight * 0.65;
        const isActive = activeKeys.has(key.note);
        const shouldTriggerParticles = isActive && key.pressAnimation < 0.5;

        // Smoothly animate the press
        const targetAnimation = isActive ? 1.0 : 0.0;
        if (Math.abs(key.pressAnimation - targetAnimation) > 0.01) {
            key.pressAnimation += (targetAnimation - key.pressAnimation) * 10.0 * deltaTime;
        } else {
            key.pressAnimation = targetAnimation;
        }
        
        if(shouldTriggerParticles) createParticles(keyScreenX + key.width / 2, yStart + (key.isBlack ? blackKeyHeight : whiteKeyHeight) / 2);

        const pressDepth = key.pressAnimation * 4;
        const yPos = yStart + (key.isBlack ? 0 : unscaledRowHeight - whiteKeyHeight);
        const height = key.isBlack ? blackKeyHeight : whiteKeyHeight;
        const keyImage = keyCache[`${key.isBlack ? 'black' : 'white'}_default`];
        
        ctx.drawImage(keyImage, keyScreenX, yPos + pressDepth);
        
        // --- INSANE ACTIVE EFFECTS ---
        if (key.pressAnimation > 0) {
            ctx.globalAlpha = key.pressAnimation;
            ctx.shadowColor = UI_STYLE.ACTIVE_KEY_GLOW_COLOR;
            ctx.shadowBlur = 25;
            
            // 1. Base color fill
            ctx.fillStyle = UI_STYLE.ACTIVE_KEY_BASE_COLOR;
            ctx.fillRect(keyScreenX, yPos + pressDepth, key.width, height);
            
            // 2. Upward energy pulse
            const pulseHeight = height * key.pressAnimation;
            ctx.fillStyle = UI_STYLE.ACTIVE_KEY_PULSE_COLOR;
            ctx.globalAlpha = key.pressAnimation * 0.5;
            ctx.fillRect(keyScreenX, yPos + pressDepth + (height - pulseHeight), key.width, pulseHeight);
            
            ctx.shadowBlur = 0; // Reset shadow for next effects
            
            // 3. Cyan Shockwave
            if (isActive) {
                const shockwaveRadius = (1 - Math.cos(key.pressAnimation * Math.PI / 2)) * key.width * 2;
                ctx.globalAlpha = (1 - key.pressAnimation) * 0.8; // Fades out
                ctx.strokeStyle = UI_STYLE.SHOCKWAVE_COLOR;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(keyScreenX + key.width / 2, yPos + pressDepth + height/2, shockwaveRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            ctx.globalAlpha = 1; // Reset alpha
        }
        
        // Labels
        const isHighlight = key.pressAnimation > 0.5;
        ctx.font = `bold ${style.userKeyWidth * 0.22}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = isHighlight ? UI_STYLE.ACTIVE_LABEL_COLOR : (key.isBlack ? UI_STYLE.LABEL_COLOR_BLACK_KEY : UI_STYLE.LABEL_COLOR_WHITE_KEY);
        if (key.isBlack) {
            ctx.textBaseline = 'middle';
            ctx.fillText(key.note.slice(0,-1), keyScreenX + key.width / 2, yPos + height * 0.8);
        } else {
            ctx.textBaseline = 'bottom';
            ctx.fillText(key.note, keyScreenX + key.width / 2, yStart + unscaledRowHeight - (unscaledRowHeight * 0.05));
        }
    };

    const renderRow = (layout, yStart, transform) => {
        if (!layout) return;
        ['white', 'black'].forEach(type => {
            layout.forEach(key => {
                if ((type === 'black') !== key.isBlack) return;
                const keyScreenX = key.x + transform;
                if (keyScreenX + key.width > 0 && keyScreenX < style.userViewportWidth) {
                     renderKey(key, keyScreenX, yStart);
                }
            });
        });
    };

    renderRow(bottomKeyboardLayout, isDualView ? unscaledRowHeight : 0, -currentScrollX);
    if (isDualView) {
        renderRow(topKeyboardLayout, 0, independentScroll ? -currentScrollX2 : (style.userViewportWidth - currentScrollX));
    }
    
    // Particles
    for (let i = particles.length - 1; i >= 0; i--) { 
        const p = particles[i]; if(p.initialLife === -1) p.initialLife = p.life;
        p.x += p.vx * deltaTime; p.y += p.vy * deltaTime; p.vy += 400 * deltaTime; p.life -= deltaTime; 
        const lifePercent = Math.max(0, p.life / p.initialLife); 
        if (lifePercent <= 0) { particles.splice(i, 1); } else { 
            ctx.globalAlpha = lifePercent; ctx.fillStyle = p.color; ctx.beginPath(); 
            ctx.arc(p.x, p.y, p.radius * lifePercent, 0, Math.PI * 2); ctx.fill(); 
        } 
    }
    
    ctx.restore();
    if (isDualView) { ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, resolution.height / 2); ctx.lineTo(resolution.width, resolution.height / 2); ctx.stroke(); }
}

// --- BOOTSTRAP INITIALIZATION ---
if (typeof self !== 'undefined' && self.bootstrapMediabunnyWorker) {
    self.bootstrapMediabunnyWorker(drawKeyboardFrame, {
        libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js'
    });
}