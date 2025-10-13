/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: Final build with a dual effect system and enhanced 3D key visuals.
             - Handles two `renderMode` types: 'explosion' (Hebrew letters) and 'touchpoint' (circles).
             - Touch points are rendered at the exact x/y coordinate of the press.
             - White keys have been completely redesigned with advanced bevels and gradients for a realistic 3D look.
             - All previous features (progress bar, colors, etc.) are fully functional.
VERSION 61.0 - The "Definitive Effects & Visuals" Build
*/

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State ---
let keyPressHistory = [];
let scrollHistory = [];
let workerConfig = null;

let masterKeyboardLayout = null;
let keyCache = {};
let particles = [];
let shockwaves = [];
let touchPoints = []; // For the new touchpoint effect

let baseOffset_Bottom = 0;
let baseOffset_Top = 0;

// --- VISUALS & CONSTANTS (Enhanced Style) ---
const UI_STYLE = {
    BACKGROUND_COLOR: '#000000',
    // White Key Style (Enhanced)
    WHITE_KEY_FILL_TOP: '#FFFFFF',
    WHITE_KEY_FILL_BOTTOM: '#FAFAFE', // Subtle gradient
    WHITE_KEY_FRONT_FACE: '#D8DCE4', // Simulates the front of the key
    WHITE_KEY_SHADOW: 'rgba(0, 0, 0, 0.4)',
    WHITE_KEY_BEVEL: 'rgba(255, 255, 255, 0.8)',
    WHITE_KEY_INNER_SHADOW: 'rgba(0, 0, 0, 0.15)', // Adds depth at the top
    // Black Key Style
    BLACK_KEY_GRADIENT_START: '#3a3a3c',
    BLACK_KEY_GRADIENT_END: '#121317',
    BLACK_KEY_BEVEL_HIGHLIGHT: 'rgba(255, 255, 255, 0.15)',
    // Active Effects
    ACTIVE_KEY_OVERLAY_COLOR: 'rgba(0, 255, 255, 0.7)',
    TOUCH_POINT_COLOR: 'rgba(0, 255, 255, 0.4)',
    SHOCKWAVE_COLOR: 'rgba(0, 255, 255, 0.7)',
    // Labels
    LABEL_COLOR_WHITE_KEY: '#707080',
    LABEL_COLOR_BLACK_KEY: '#a0a0b0',
    ACTIVE_LABEL_COLOR: '#000000'
};
const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const HEBREW_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];
const MIDI_NOTE_START = 21; // A0
const MIDI_NOTE_END = 108; // C8


// --- NEW: Advanced Key Pre-Rendering ---
function cacheKeyRenders(whiteKeyWidth, whiteKeyHeight) {
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = whiteKeyHeight * 0.65;
    const shadowOffset = whiteKeyWidth * 0.06;
    const keyFrontHeight = whiteKeyWidth * 0.08;

    // --- Enhanced White Key ---
    const wCanvas = new OffscreenCanvas(whiteKeyWidth, whiteKeyHeight + shadowOffset);
    const wCtx = wCanvas.getContext('2d');
    // 1. Drop Shadow
    wCtx.fillStyle = UI_STYLE.WHITE_KEY_SHADOW;
    wCtx.fillRect(0, shadowOffset, whiteKeyWidth, whiteKeyHeight);
    // 2. Main Key Body (subtle gradient for realism)
    const bodyGradient = wCtx.createLinearGradient(0, 0, 0, whiteKeyHeight);
    bodyGradient.addColorStop(0, UI_STYLE.WHITE_KEY_FILL_TOP);
    bodyGradient.addColorStop(1, UI_STYLE.WHITE_KEY_FILL_BOTTOM);
    wCtx.fillStyle = bodyGradient;
    wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight);
    // 3. Front Face (darker strip at the bottom)
    wCtx.fillStyle = UI_STYLE.WHITE_KEY_FRONT_FACE;
    wCtx.fillRect(0, whiteKeyHeight - keyFrontHeight, whiteKeyWidth, keyFrontHeight);
    // 4. Inner Shadow (for depth below the top bevel)
    const innerShadow = wCtx.createLinearGradient(0, 0, 0, 8);
    innerShadow.addColorStop(0, UI_STYLE.WHITE_KEY_INNER_SHADOW);
    innerShadow.addColorStop(1, 'transparent');
    wCtx.fillStyle = innerShadow;
    wCtx.fillRect(0, 2, whiteKeyWidth, 6);
    // 5. Top Bevel Highlight
    wCtx.fillStyle = UI_STYLE.WHITE_KEY_BEVEL;
    wCtx.fillRect(0, 0, whiteKeyWidth, 2);
    keyCache['white_default'] = wCanvas;

    // --- Black Key (Unchanged) ---
    const bCanvas = new OffscreenCanvas(blackKeyWidth, blackKeyHeight);
    const bCtx = bCanvas.getContext('2d');
    const bGradient = bCtx.createLinearGradient(0, 0, 0, blackKeyHeight);
    bGradient.addColorStop(0, UI_STYLE.BLACK_KEY_GRADIENT_START);
    bGradient.addColorStop(1, UI_STYLE.BLACK_KEY_GRADIENT_END);
    bCtx.fillStyle = bGradient;
    bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight);
    bCtx.fillStyle = UI_STYLE.BLACK_KEY_BEVEL_HIGHLIGHT;
    bCtx.fillRect(0, 0, blackKeyWidth, 2);
    keyCache['black_default'] = bCanvas;
}


function calculateMasterLayout(whiteKeyWidth) {
    const layout = new Map();
    let whiteKeyX = 0;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    for (let midi = MIDI_NOTE_START; midi <= MIDI_NOTE_END; midi++) {
        const octave = Math.floor(midi / 12) - 1;
        const note = NOTE_NAMES_SHARP[midi % 12];
        const noteName = note + octave;
        const isBlack = note.includes('#');
        const x = isBlack ? whiteKeyX - (blackKeyWidth / 2) : whiteKeyX;
        layout.set(noteName, { note: noteName, isBlack, x, width: isBlack ? blackKeyWidth : whiteKeyWidth, pressAnimation: 0 });
        if (!isBlack) whiteKeyX += whiteKeyWidth;
    }
    return layout;
}

// --- Effect Creation Functions ---
function createParticles(x, y) {
    for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 250 + 75;
        const letter = HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)];
        const hue = Math.random() * 360;
        particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: Math.random() * 2.5 + 1.0, initialLife: -1, radius: Math.random() * 3.5 + 2, letter, hue });
    }
}

function createTouchEvent(x, y) {
    const life = 1.0;
    touchPoints.push({ x, y, life, initialLife: life, radius: 25 });
}


// --- The Frame Drawing Function ---
function drawKeyboardFrame(workerContext, framePayload) {
    const { payload: config, ctx } = workerContext;
    const { time, duration: deltaTime } = framePayload;

    const relevantScroll = scrollHistory.slice().reverse().find(s => s.time <= time) || scrollHistory[0];
    const activeKeys = new Set();
    keyPressHistory.forEach(k => { if (time >= k.start && time < k.end) activeKeys.add(k.note); });

    const finalScroll_Bottom = baseOffset_Bottom + relevantScroll.scrollX;
    const finalScroll_Top = baseOffset_Top + (config.independentScroll ? relevantScroll.scrollX2 : relevantScroll.scrollX);

    ctx.fillStyle = UI_STYLE.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, config.resolution.width, config.resolution.height);

    ctx.save();
    const zoomFactor = config.resolution.width / config.style.userViewportWidth;
    ctx.scale(zoomFactor, zoomFactor);

    const isDualView = config.alwaysDual || config.isVertical;
    const unscaledRowHeight = (config.resolution.height / zoomFactor) / (isDualView ? 2 : 1);

    const renderKey = (key, keyScreenX, yStart) => {
        const isActive = activeKeys.has(key.note);
        const eventData = isActive ? keyPressHistory.find(e => e.note === key.note && time >= e.start && time < e.end) : null;
        const targetAnimation = isActive ? 1.0 : 0.0;
        if (Math.abs(key.pressAnimation - targetAnimation) > 0.01) { key.pressAnimation += (targetAnimation - key.pressAnimation) * 12.0 * deltaTime; } else { key.pressAnimation = targetAnimation; }

        const whiteKeyHeight = unscaledRowHeight * 0.95;
        const pressDepth = key.pressAnimation * 4;
        const yPos = yStart + (key.isBlack ? 0 : unscaledRowHeight - whiteKeyHeight);

        // --- DUAL EFFECT TRIGGER LOGIC ---
        if (isActive && eventData && !eventData.effectTriggered) {
            const effectX = keyScreenX + (eventData.x / zoomFactor);
            const effectY = yPos + (eventData.y / zoomFactor);
            
            if (config.renderMode === 'explosion') {
                createParticles(effectX, effectY);
            } else if (config.renderMode === 'touchpoint') {
                createTouchEvent(effectX, effectY);
            }
            shockwaves.push({ x: effectX, y: effectY, life: 1.0, size: 0 });
            eventData.effectTriggered = true;
        }

        ctx.drawImage(keyCache[key.isBlack ? 'black_default' : 'white_default'], keyScreenX, yPos + pressDepth);
        
        if (key.pressAnimation > 0) {
            ctx.globalAlpha = key.pressAnimation;
            ctx.fillStyle = UI_STYLE.ACTIVE_KEY_OVERLAY_COLOR;
            const height = key.isBlack ? whiteKeyHeight * 0.65 : whiteKeyHeight;
            ctx.fillRect(keyScreenX, yPos + pressDepth, key.width, height);
            ctx.globalAlpha = 1;
        }

        const isHighlight = key.pressAnimation > 0.5;
        ctx.font = `bold ${config.style.userKeyWidth * 0.22}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = isHighlight ? UI_STYLE.ACTIVE_LABEL_COLOR : (key.isBlack ? UI_STYLE.LABEL_COLOR_BLACK_KEY : UI_STYLE.LABEL_COLOR_WHITE_KEY);

        if (key.isBlack) {
            const blackKeyHeight = whiteKeyHeight * 0.65;
            ctx.textBaseline = 'middle';
            ctx.fillText(key.note.slice(0, -1), keyScreenX + key.width / 2, yPos + blackKeyHeight * 0.8 + pressDepth);
        } else {
            ctx.textBaseline = 'bottom';
            ctx.fillText(key.note, keyScreenX + key.width / 2, yStart + unscaledRowHeight - (unscaledRowHeight * 0.05) + pressDepth);
        }
    };

    const renderRow = (layout, yStart, scroll) => {
        if (!layout) return;
        ['white', 'black'].forEach(type => {
            layout.forEach(key => {
                if ((type === 'black') === key.isBlack) {
                    const keyScreenX = key.x - scroll;
                    if (keyScreenX + key.width > 0 && keyScreenX < config.style.userViewportWidth) {
                        renderKey(key, keyScreenX, yStart);
                    }
                }
            });
        });
    };
    
    renderRow(masterKeyboardLayout, isDualView ? unscaledRowHeight : 0, finalScroll_Bottom);
    if (isDualView) renderRow(masterKeyboardLayout, 0, finalScroll_Top);

    // --- RENDER ALL EFFECTS ON TOP ---
    // 1. Shockwaves
    ctx.lineWidth = 4;
    for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.life -= deltaTime * 1.5;
        if (sw.life <= 0) { shockwaves.splice(i, 1); } else {
            sw.size = (1.0 - sw.life) * 200;
            ctx.globalAlpha = sw.life;
            ctx.strokeStyle = UI_STYLE.SHOCKWAVE_COLOR;
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.size, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // 2. Touch Points
    for (let i = touchPoints.length - 1; i >= 0; i--) {
        const tp = touchPoints[i];
        tp.life -= deltaTime * 2.0;
        if (tp.life <= 0) { touchPoints.splice(i, 1); } else {
            ctx.globalAlpha = (tp.life / tp.initialLife) * 0.7; // Make it transparent
            ctx.fillStyle = UI_STYLE.TOUCH_POINT_COLOR;
            ctx.beginPath();
            ctx.arc(tp.x, tp.y, tp.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 3. Hebrew Letter Particles
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.vy += 600 * deltaTime;
        p.life -= deltaTime;
        if (p.life <= 0) { particles.splice(i, 1); } else {
            if (p.initialLife === -1) p.initialLife = p.life;
            const lifeRatio = p.life / p.initialLife;
            ctx.globalAlpha = lifeRatio;
            const lightness = 75 + (1 - lifeRatio) * 25;
            ctx.fillStyle = `hsl(${p.hue}, 100%, ${lightness}%)`;
            ctx.font = `bold ${p.radius * 8}px sans-serif`;
            ctx.fillText(p.letter, p.x, p.y);
        }
    }
    ctx.globalAlpha = 1;

    ctx.restore();
}


// --- Main Worker Control Logic ---
self.onmessage = async (e) => {
    const { type, payload } = e.data;
    switch (type) {
        case 'INITIALIZE_RENDERER':
            workerConfig = payload;
            scrollHistory = [{ time: 0, scrollX: payload.initialScrollX, scrollX2: payload.initialScrollX2 }];
            keyPressHistory = [];
            particles = [];
            shockwaves = [];
            touchPoints = [];
            break;

        case 'ADD_KEY_EVENT':
            payload.effectTriggered = false;
            keyPressHistory.push(payload);
            break;

        case 'UPDATE_SCROLL':
            scrollHistory.push(payload);
            break;

        case 'FINALIZE_MUXING':
            if (!workerConfig) { console.error("Worker not initialized!"); return; }

            const renderer = new MediaBunnyBase(workerConfig, drawKeyboardFrame, { libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' });
            await renderer.start();
            
            masterKeyboardLayout = calculateMasterLayout(workerConfig.style.userKeyWidth);

            const zoomFactor = workerConfig.resolution.width / workerConfig.style.userViewportWidth;
            const unscaledRowHeight = (workerConfig.resolution.height / zoomFactor) / ((workerConfig.alwaysDual || workerConfig.isVertical) ? 2 : 1);
            cacheKeyRenders(workerConfig.style.userKeyWidth, unscaledRowHeight * 0.95);

            const uiStartOctave = parseInt(workerConfig.startOctave);
            const bottomStartNote = `C${uiStartOctave}`;
            baseOffset_Bottom = masterKeyboardLayout.get(bottomStartNote)?.x || 0;

            if (workerConfig.independentScroll) {
                const topStartNote = `C${uiStartOctave + 4}`;
                baseOffset_Top = masterKeyboardLayout.get(topStartNote)?.x || 0;
            } else {
                const viewportWidth = workerConfig.style.userViewportWidth;
                baseOffset_Top = baseOffset_Bottom - viewportWidth;
            }
            
            const finalDuration = payload.audioBufferShim.duration;
            const deltaTime = 1 / workerConfig.outputFormat.fps;
            const totalFrames = Math.floor(finalDuration / deltaTime);
            let lastReportedProgress = -1;

            for (let i = 0; i < totalFrames; i++) {
                const time = i * deltaTime;
                await renderer.addFrame({ time, duration: deltaTime });

                const progress = Math.floor((i / totalFrames) * 100);
                if (progress > lastReportedProgress) {
                    self.postMessage({
                        type: 'PROGRESS_UPDATE',
                        payload: { percent: progress }
                    });
                    lastReportedProgress = progress;
                }
            }

            const blob = await renderer.finalize(payload.audioBufferShim);
            renderer._postComplete(blob, { download: true, fileName: `BH-WebSynth-Video-${Date.now()}.mp4` });
            break;
    }
};