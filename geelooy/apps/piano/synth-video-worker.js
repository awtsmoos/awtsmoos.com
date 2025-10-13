/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: A unified, real-time renderer with a robust, absolute MIDI-based layout and corrected effect logic.
VERSION 34.0 - The "Absolute Accuracy" Fix
*/

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State ---
let keyEvents = new Map();
let scrollEvents = [{ time: 0, scrollX: 0, scrollX2: 0 }];
let bottomKeyboardLayout = null, topKeyboardLayout = null, keyCache = {};
let particles = [], starfield = [], zoomFactor = 1;
let renderer = null, effectMode = 'explosion';
let lastRenderedTime = 0; // The worker's unified internal clock

// --- Visuals & Constants ---
const UI_STYLE = { BACKGROUND_COLOR: '#000000', GRID_COLOR: 'rgba(0, 150, 255, 0.1)', STAR_COLOR: 'rgba(220, 235, 255, 0.8)', WHITE_KEY_FILL: '#dfe2e8', WHITE_KEY_AO: 'rgba(0, 0, 0, 0.25)', BLACK_KEY_FILL: '#121317', BLACK_KEY_HIGHLIGHT: 'rgba(255, 255, 255, 0.1)', ACTIVE_KEY_BASE_COLOR: '#00ffff', ACTIVE_KEY_GLOW_COLOR: 'rgba(0, 255, 255, 0.7)', SHOCKWAVE_COLOR: 'rgba(0, 255, 255, 0.6)', PARTICLE_COLOR: '#ffffff', TOUCH_POINT_COLOR: 'rgba(0, 255, 255, 0.9)', LABEL_COLOR_WHITE_KEY: '#707080', LABEL_COLOR_BLACK_KEY: '#a0a0b0', ACTIVE_LABEL_COLOR: '#000000' };
// **FIX**: Use a single, sharp-based note name array that directly matches the main script's `dataset.note`.
const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MIDI_NOTE_START = 21; // A0 on a standard 88-key piano
const MIDI_NOTE_END = 108;   // C8 on a standard 88-key piano

// --- Utility Functions ---

/**
 * Converts a MIDI note number to its standard string name (e.g., 60 -> "C4").
 * @param {number} midi - The MIDI note number.
 * @returns {string|null} The note name or null if out of range.
 */
function midiToNoteName(midi) {
    if (midi < MIDI_NOTE_START || midi > MIDI_NOTE_END) return null;
    const octave = Math.floor(midi / 12) - 1;
    const noteIndex = midi % 12;
    return NOTE_NAMES_SHARP[noteIndex] + octave;
}

/**
 * **FIX**: Creates a complete, absolute layout for a standard 88-key piano.
 * This function is now the single source of truth and is independent of any 'startOctave' parameter.
 * It builds a universal map that will correctly match any note name sent from the main script.
 * @param {number} whiteKeyWidth - The width of a single white key.
 * @returns {Map<string, object>} A map of the entire keyboard layout, keyed by note name.
 */
function calculateKeyLayout(whiteKeyWidth) {
    const layout = new Map();
    let whiteKeyX = 0;
    const blackKeyWidth = whiteKeyWidth * 0.6;

    for (let midi = MIDI_NOTE_START; midi <= MIDI_NOTE_END; midi++) {
        const noteName = midiToNoteName(midi);
        if (!noteName) continue;

        const noteIndexInOctave = midi % 12;
        const isBlack = [1, 3, 6, 8, 10].includes(noteIndexInOctave);
        
        const xPosition = isBlack ? (whiteKeyX - (whiteKeyWidth / 2)) - (blackKeyWidth / 2) : whiteKeyX;

        layout.set(noteName, {
            note: noteName,
            isBlack,
            x: xPosition,
            width: isBlack ? blackKeyWidth : whiteKeyWidth,
            pressAnimation: 0
        });

        if (!isBlack) {
            whiteKeyX += whiteKeyWidth;
        }
    }
    return layout;
}

function cacheKeyRenders(whiteKeyWidth, whiteKeyHeight) {
    const blackKeyWidth = whiteKeyWidth * 0.6, blackKeyHeight = whiteKeyHeight * 0.65;
    const wCanvas = new OffscreenCanvas(whiteKeyWidth, whiteKeyHeight); const wCtx = wCanvas.getContext('2d'); wCtx.fillStyle = UI_STYLE.WHITE_KEY_FILL; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight); const aoGradient = wCtx.createLinearGradient(0, 0, whiteKeyWidth, 0); aoGradient.addColorStop(0, UI_STYLE.WHITE_KEY_AO); aoGradient.addColorStop(0.1, 'transparent'); aoGradient.addColorStop(0.9, 'transparent'); aoGradient.addColorStop(1, UI_STYLE.WHITE_KEY_AO); wCtx.fillStyle = aoGradient; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight); keyCache['white_default'] = wCanvas; const bCanvas = new OffscreenCanvas(blackKeyWidth, blackKeyHeight); const bCtx = bCanvas.getContext('2d'); bCtx.fillStyle = UI_STYLE.BLACK_KEY_FILL; bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight); const bGradient = bCtx.createLinearGradient(0, 0, blackKeyWidth, 0); bGradient.addColorStop(0, UI_STYLE.BLACK_KEY_HIGHLIGHT); bGradient.addColorStop(0.5, 'transparent'); bCtx.fillStyle = bGradient; bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight); keyCache['black_default'] = bCanvas;
}

function createParticles(x, y) { for (let i = 0; i < 80; i++) { const angle = Math.random() * Math.PI * 2; const speed = Math.random() * 250 + 75; particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: Math.random() * 2.0 + 0.8, initialLife: -1, radius: Math.random() * 2.5 + 1 }); } }

// --- The Frame Drawing Function ---
function drawKeyboardFrame(workerContext, framePayload) {
    const { payload, ctx, canvas } = workerContext;
    const { resolution, style, alwaysDual, independentScroll, isVertical } = payload;

    if (bottomKeyboardLayout === null) {
        const userKeyWidth = style.userKeyWidth;
        // The layout now spans the entire standard 88-key piano range, ignoring the `startOctave` from payload.
        // This ensures the worker's understanding of the keyboard is always correct and complete.
        bottomKeyboardLayout = calculateKeyLayout(userKeyWidth);
        topKeyboardLayout = (alwaysDual || isVertical) ? calculateKeyLayout(userKeyWidth) : null;

        const userViewportWidth = style.userViewportWidth || resolution.width;
        zoomFactor = userViewportWidth > 0 ? resolution.width / userViewportWidth : 1;
        const rowHeight = (resolution.height / zoomFactor) / (alwaysDual || isVertical ? 2 : 1);
        cacheKeyRenders(userKeyWidth, rowHeight * 0.95);
        for (let i = 0; i < 600; i++) { starfield.push({ x: Math.random() * resolution.width, y: Math.random() * resolution.height, speed: Math.random() * 20 + 5, size: Math.random() * 2 + 0.5 }); }
    }

    const frameTime = framePayload.time; const deltaTime = framePayload.duration;
    const activeKeys = new Set();
    // Check which keys should be active based on the current frame time
    keyEvents.forEach((event, note) => { if (frameTime >= event.start && frameTime < event.end) activeKeys.add(note); });
    
    // Find the most recent scroll event that has already occurred
    const relevantScrollEvent = scrollEvents.slice().reverse().find(e => e.time <= frameTime) || scrollEvents[0];
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

        // **FIX**: Implement a robust, flag-based effect trigger.
        if (effectMode === 'explosion' && isActive && eventData && !eventData.effectTriggered) {
            const effectX = keyScreenX + (eventData.x / zoomFactor);
            const effectY = yStart + (key.isBlack ? 0 : unscaledRowHeight - whiteKeyHeight) + (eventData.y / zoomFactor);
            createParticles(effectX, effectY);
            eventData.effectTriggered = true; // Set the flag to guarantee the effect fires only once.
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

    const renderRow = (layout, yStart, scroll) => {
        if (!layout) return;
        const unscaledViewportWidth = style.userViewportWidth || resolution.width;
        
        // **FIX**: Correctly layer keys by drawing all white keys first, then all black keys on top.
        // This prevents visual glitches where black keys are overlapped by adjacent white keys.
        const whiteKeys = [], blackKeys = [];
        layout.forEach(key => key.isBlack ? blackKeys.push(key) : whiteKeys.push(key));

        whiteKeys.forEach(key => {
            const keyScreenX = key.x + scroll;
            if (keyScreenX + key.width > 0 && keyScreenX < unscaledViewportWidth) {
                renderKey(key, keyScreenX, yStart);
            }
        });
        blackKeys.forEach(key => {
            const keyScreenX = key.x + scroll;
            if (keyScreenX + key.width > 0 && keyScreenX < unscaledViewportWidth) {
                renderKey(key, keyScreenX, yStart);
            }
        });
    };
    
    // The scroll values (currentScrollX) from the main script are now correctly interpreted
    // as a "camera" moving over the worker's complete and accurate keyboard map.
    renderRow(bottomKeyboardLayout, isDualView ? unscaledRowHeight : 0, -currentScrollX);
    if (isDualView) renderRow(topKeyboardLayout, 0, independentScroll ? -currentScrollX2 : (style.userViewportWidth - currentScrollX));

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
            lastRenderedTime = 0;
            break;

        case 'ADD_KEY_EVENT':
            if (!renderer) return;
            // **FIX**: Add the effect trigger flag to the event payload upon arrival.
            payload.effectTriggered = false; 
            keyEvents.set(payload.note, payload);

            const renderUntilTime = payload.end;
            const { fps } = renderer.config.outputFormat;
            const deltaTime = 1 / fps;
            while (lastRenderedTime < renderUntilTime) {
                await renderer.addFrame({ time: lastRenderedTime, duration: deltaTime });
                lastRenderedTime += deltaTime;
            }
            break;

        case 'UPDATE_SCROLL':
            scrollEvents.push(payload);
            // Sort to ensure chronological order, which is good practice.
            scrollEvents.sort((a, b) => a.time - b.time);
            break;

        case 'FINALIZE_MUXING':
            if (!renderer) return;
            const finalDuration = payload.audioBufferShim.duration;
            const { fps: finalFps } = renderer.config.outputFormat;
            const finalDeltaTime = 1 / finalFps;
            // Final render loop to catch any remaining time.
            while (lastRenderedTime < finalDuration) {
                await renderer.addFrame({ time: lastRenderedTime, duration: finalDeltaTime });
                lastRenderedTime += finalDeltaTime;
            }
            const blob = await renderer.finalize(payload.audioBufferShim);
            renderer._postComplete(blob, { download: true, fileName: `BH-Piano-Render-${Date.now()}.mp4` });
            break;
    }
};