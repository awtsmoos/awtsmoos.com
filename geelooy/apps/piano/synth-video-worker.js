/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: A high-accuracy, post-process renderer with corrected layout logic and selectable effects.
VERSION 30.0 - The "Stable Post-Process" Final Version
*/

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State ---
let keyEvents = new Map();
let scrollEvents = [{ time: 0, scrollX: 0, scrollX2: 0 }];
let bottomKeyboardLayout = null, topKeyboardLayout = null, keyCache = {};
let particles = [], starfield = [], zoomFactor = 1;
let renderer = null, effectMode = 'explosion';

// --- Visuals & Constants ---
const UI_STYLE = { BACKGROUND_COLOR: '#000000', GRID_COLOR: 'rgba(0, 150, 255, 0.1)', STAR_COLOR: 'rgba(220, 235, 255, 0.8)', WHITE_KEY_FILL: '#dfe2e8', WHITE_KEY_AO: 'rgba(0, 0, 0, 0.25)', BLACK_KEY_FILL: '#121317', BLACK_KEY_HIGHLIGHT: 'rgba(255, 255, 255, 0.1)', ACTIVE_KEY_BASE_COLOR: '#00ffff', ACTIVE_KEY_GLOW_COLOR: 'rgba(0, 255, 255, 0.7)', SHOCKWAVE_COLOR: 'rgba(0, 255, 255, 0.6)', PARTICLE_COLOR: '#ffffff', TOUCH_POINT_COLOR: 'rgba(0, 255, 255, 0.9)', LABEL_COLOR_WHITE_KEY: '#707080', LABEL_COLOR_BLACK_KEY: '#a0a0b0', ACTIVE_LABEL_COLOR: '#000000' };
const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const flatToSharpMap = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };

// --- Utility Functions ---
function calculateKeyLayout(startOctave, numOctaves, whiteKeyWidth) {
    const layout = []; let whiteKeyX = 0; const blackKeyWidth = whiteKeyWidth * 0.6;
    for (let oct = startOctave; oct < startOctave + numOctaves; oct++) {
        NOTE_NAMES_FLAT.forEach(note => {
            const isBlack = note.includes('b'); const noteNameWithSharp = isBlack ? flatToSharpMap[note] : note; const finalNoteName = noteNameWithSharp + oct;
            layout.push({ note: finalNoteName, isBlack, x: isBlack ? whiteKeyX - (blackKeyWidth / 2) : whiteKeyX, width: isBlack ? blackKeyWidth : whiteKeyWidth, pressAnimation: 0 });
            if (!isBlack) whiteKeyX += whiteKeyWidth;
        });
    } return layout;
}

function cacheKeyRenders(whiteKeyWidth, whiteKeyHeight) {
    const blackKeyWidth = whiteKeyWidth * 0.6, blackKeyHeight = whiteKeyHeight * 0.65;
    const wCanvas = new OffscreenCanvas(whiteKeyWidth, whiteKeyHeight); const wCtx = wCanvas.getContext('2d'); wCtx.fillStyle = UI_STYLE.WHITE_KEY_FILL; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight); const aoGradient = wCtx.createLinearGradient(0, 0, whiteKeyWidth, 0); aoGradient.addColorStop(0, UI_STYLE.WHITE_KEY_AO); aoGradient.addColorStop(0.1, 'transparent'); aoGradient.addColorStop(0.9, 'transparent'); aoGradient.addColorStop(1, UI_STYLE.WHITE_KEY_AO); wCtx.fillStyle = aoGradient; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight); keyCache['white_default'] = wCanvas;
    const bCanvas = new OffscreenCanvas(blackKeyWidth, blackKeyHeight); const bCtx = bCanvas.getContext('2d'); bCtx.fillStyle = UI_STYLE.BLACK_KEY_FILL; bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight); const bGradient = bCtx.createLinearGradient(0, 0, blackKeyWidth, 0); bGradient.addColorStop(0, UI_STYLE.BLACK_KEY_HIGHLIGHT); bGradient.addColorStop(0.5, 'transparent'); bCtx.fillStyle = bGradient; bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight); keyCache['black_default'] = bCanvas;
}

function createParticles(x, y) { for (let i = 0; i < 80; i++) { const angle = Math.random() * Math.PI * 2; const speed = Math.random() * 250 + 75; particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: Math.random() * 2.0 + 0.8, initialLife: -1, radius: Math.random() * 2.5 + 1 }); } }

// --- The Frame Drawing Function ---
function drawKeyboardFrame(workerContext, framePayload) {
    const { payload, ctx, canvas } = workerContext;
    const { resolution, style, alwaysDual, independentScroll, isVertical, startOctave } = payload;

    // --- ONE-TIME LAYOUT INITIALIZATION (WITH THE CRITICAL FIX) ---
    if (bottomKeyboardLayout === null) {
        const baseStartOctave = parseInt(startOctave);
        const userKeyWidth = style.userKeyWidth;
        const isDualView = alwaysDual || isVertical;

        // THIS IS THE CORRECTED LOGIC THAT FIXES THE "WRONG OCTAVES" BUG
        if (isDualView) {
            const octaves = independentScroll ? 4 : 8; // Correctly check independentScroll
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
        for (let i = 0; i < 600; i++) { starfield.push({ x: Math.random() * resolution.width, y: Math.random() * resolution.height, speed: Math.random() * 20 + 5, size: Math.random() * 2 + 0.5 }); }
    }

    const frameTime = framePayload.time; const deltaTime = framePayload.duration;

    const activeKeys = new Set();
    // In this architecture, we always check the time interval
    keyEvents.forEach((event, note) => {
        if (frameTime >= event.start && frameTime < event.end) {
            activeKeys.add(note);
        }
    });
    const relevantScrollEvent = scrollEvents.slice().reverse().find(e => e.time <= frameTime);
    const currentScrollX = relevantScrollEvent.scrollX, currentScrollX2 = relevantScrollEvent.scrollX2;

    ctx.save();
    ctx.fillStyle = UI_STYLE.BACKGROUND_COLOR; ctx.fillRect(0, 0, resolution.width, resolution.height);
    for (let i = 0; i < resolution.width; i += 50) { ctx.fillStyle = UI_STYLE.GRID_COLOR; ctx.fillRect(i, 0, 1, resolution.height); }
    for (let i = 0; i < resolution.height; i += 50) { ctx.fillStyle = UI_STYLE.GRID_COLOR; ctx.fillRect(0, i, resolution.width, 1); }
    starfield.forEach(star => { star.y += star.speed * deltaTime; if (star.y > resolution.height) { star.y = 0; star.x = Math.random() * resolution.width; } });
    ctx.fillStyle = UI_STYLE.STAR_COLOR; starfield.forEach(star => ctx.fillRect(star.x, star.y, star.size, star.size));

    ctx.scale(zoomFactor, zoomFactor);
    const isDualView = alwaysDual || isVertical; const unscaledRowHeight = (resolution.height / zoomFactor) / (isDualView ? 2 : 1);

    const renderKey = (key, keyScreenX, yStart) => {
        const whiteKeyHeight = unscaledRowHeight * 0.95, blackKeyHeight = whiteKeyHeight * 0.65; const isActive = activeKeys.has(key.note); const eventData = keyEvents.get(key.note);
        const targetAnimation = isActive ? 1.0 : 0.0;
        if (Math.abs(key.pressAnimation - targetAnimation) > 0.01) { key.pressAnimation += (targetAnimation - key.pressAnimation) * 12.0 * deltaTime; } else { key.pressAnimation = targetAnimation; }

        if (effectMode === 'explosion' && isActive && key.pressAnimation > 0.95 && (key.pressAnimation - 12.0 * deltaTime <= 0.95) && eventData) {
            const effectX = keyScreenX + (eventData.x / zoomFactor);
            const effectY = yStart + (key.isBlack ? 0 : unscaledRowHeight - whiteKeyHeight) + (eventData.y / zoomFactor);
            createParticles(effectX, effectY);
        }
        
        const pressDepth = key.pressAnimation * 4, yPos = yStart + (key.isBlack ? 0 : unscaledRowHeight - whiteKeyHeight), height = key.isBlack ? blackKeyHeight : whiteKeyHeight;
        ctx.drawImage(keyCache[`${key.isBlack ? 'black' : 'white'}_default`], keyScreenX, yPos + pressDepth);

        if (key.pressAnimation > 0) {
            ctx.globalAlpha = key.pressAnimation; ctx.shadowColor = UI_STYLE.ACTIVE_KEY_GLOW_COLOR; ctx.shadowBlur = 30; ctx.fillStyle = UI_STYLE.ACTIVE_KEY_BASE_COLOR; ctx.fillRect(keyScreenX, yPos + pressDepth, key.width, height); ctx.shadowBlur = 0;
            if (effectMode === 'explosion') {
                const shockwaveRadius = (1 - Math.cos(key.pressAnimation * Math.PI / 2)) * key.width; ctx.globalAlpha = (1 - key.pressAnimation) * key.pressAnimation * 4; ctx.strokeStyle = UI_STYLE.SHOCKWAVE_COLOR; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(keyScreenX + key.width / 2, yPos + pressDepth + height / 2, shockwaveRadius, 0, Math.PI * 2); ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }

        if (effectMode === 'touchpoint' && isActive && eventData) {
            const touchX = keyScreenX + (eventData.x / zoomFactor); const touchY = yStart + (key.isBlack ? 0 : unscaledRowHeight - whiteKeyHeight) + (eventData.y / zoomFactor);
            ctx.fillStyle = UI_STYLE.TOUCH_POINT_COLOR; ctx.beginPath(); ctx.arc(touchX, touchY, 15, 0, Math.PI * 2); ctx.fill();
        }

        const isHighlight = key.pressAnimation > 0.5; ctx.font = `bold ${style.userKeyWidth * 0.22}px sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = isHighlight ? UI_STYLE.ACTIVE_LABEL_COLOR : (key.isBlack ? UI_STYLE.LABEL_COLOR_BLACK_KEY : UI_STYLE.LABEL_COLOR_WHITE_KEY);
        if (key.isBlack) { ctx.textBaseline = 'middle'; ctx.fillText(key.note.slice(0, -1), keyScreenX + key.width / 2, yPos + height * 0.8); } else { ctx.textBaseline = 'bottom'; ctx.fillText(key.note, keyScreenX + key.width / 2, yStart + unscaledRowHeight - (unscaledRowHeight * 0.05)); }
    };

    const renderRow = (layout, yStart, transform) => { if (!layout) return; ['white', 'black'].forEach(type => { layout.forEach(key => { if ((type === 'black') !== key.isBlack) return; const keyScreenX = key.x + transform; if (keyScreenX + key.width > 0 && keyScreenX < style.userViewportWidth) renderKey(key, keyScreenX, yStart); }); }); };
    renderRow(bottomKeyboardLayout, isDualView ? unscaledRowHeight : 0, -currentScrollX); if (isDualView) renderRow(topKeyboardLayout, 0, independentScroll ? -currentScrollX2 : (style.userViewportWidth - currentScrollX));
    if (effectMode === 'explosion') { for (let i = particles.length - 1; i >= 0; i--) { const p = particles[i]; if (p.initialLife === -1) p.initialLife = p.life; p.x += p.vx * deltaTime; p.y += p.vy * deltaTime; p.vy += 400 * deltaTime; p.life -= deltaTime; const lifePercent = Math.max(0, p.life / p.initialLife); if (lifePercent <= 0) { particles.splice(i, 1); } else { ctx.globalAlpha = lifePercent; ctx.fillStyle = UI_STYLE.PARTICLE_COLOR; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius * lifePercent, 0, Math.PI * 2); ctx.fill(); } } }
    
    ctx.restore();
    if (isDualView) { ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, resolution.height / 2); ctx.lineTo(resolution.width, resolution.height / 2); ctx.stroke(); }
}

// --- Main Worker Control Logic ---
self.onmessage = async (e) => {
    const { type, payload } = e.data;
    switch (type) {
        case 'INITIALIZE_RENDERER':
            effectMode = payload.effectMode;
            renderer = new MediaBunnyBase(payload, drawKeyboardFrame, { libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' });
            await renderer.start();
            break;

        case 'ADD_KEY_EVENT':
            keyEvents.set(payload.note, payload);
            break;

        case 'UPDATE_SCROLL':
            scrollEvents.push(payload);
            break;

        case 'FINALIZE_MUXING':
            if (!renderer) return;
            const { fps } = renderer.config.outputFormat;
            const duration = payload.audioBufferShim.duration;
            const totalFrames = Math.floor(duration * fps);
            const deltaTime = 1 / fps;

            self.postMessage({ type: 'STATUS_UPDATE', payload: { message: `Rendering ${totalFrames} frames...` } });

            // This is the stable, worker-internal render loop.
            for (let i = 0; i < totalFrames; i++) {
                await renderer.addFrame({ time: i * deltaTime, duration: deltaTime });
                if (i > 0 && i % fps === 0) {
                    const percent = ((i / totalFrames) * 100).toFixed(1);
                    self.postMessage({ type: 'PROGRESS_UPDATE', payload: { percent: percent, message: `Rendering: ${percent}%` } });
                }
            }
            
            const blob = await renderer.finalize(payload.audioBufferShim);
            renderer._postComplete(blob, { download: true, fileName: `BH-Piano-Render-${Date.now()}.mp4` });
            break;
    }
};