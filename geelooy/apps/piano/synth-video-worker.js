/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: A unified renderer with a corrected coordinate system to ensure the video viewport
             always aligns with the main script's visible keyboard.
VERSION 35.0 - The "Coordinate System Alignment" Final Fix
*/

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State ---
let keyEvents = new Map();
let scrollEvents = [{ time: 0, scrollX: 0, scrollX2: 0 }];
let bottomKeyboardLayout = null, topKeyboardLayout = null, keyCache = {};
let particles = [], starfield = [], zoomFactor = 1;
let renderer = null, effectMode = 'explosion';
let lastRenderedTime = 0;

// **FIX**: Introduce offsets to align the worker's absolute keyboard with the main script's relative view.
let scrollOffset = 0;
let scrollOffset2 = 0; // For independent scroll mode

// --- Visuals & Constants ---
const UI_STYLE = { BACKGROUND_COLOR: '#000000', GRID_COLOR: 'rgba(0, 150, 255, 0.1)', STAR_COLOR: 'rgba(220, 235, 255, 0.8)', WHITE_KEY_FILL: '#dfe2e8', WHITE_KEY_AO: 'rgba(0, 0, 0, 0.25)', BLACK_KEY_FILL: '#121317', BLACK_KEY_HIGHLIGHT: 'rgba(255, 255, 255, 0.1)', ACTIVE_KEY_BASE_COLOR: '#00ffff', ACTIVE_KEY_GLOW_COLOR: 'rgba(0, 255, 255, 0.7)', SHOCKWAVE_COLOR: 'rgba(0, 255, 255, 0.6)', PARTICLE_COLOR: '#ffffff', TOUCH_POINT_COLOR: 'rgba(0, 255, 255, 0.9)', LABEL_COLOR_WHITE_KEY: '#707080', LABEL_COLOR_BLACK_KEY: '#a0a0b0', ACTIVE_LABEL_COLOR: '#000000' };
const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MIDI_NOTE_START = 21; // A0
const MIDI_NOTE_END = 108;   // C8

// --- Utility Functions ---
function midiToNoteName(midi) {
    if (midi < MIDI_NOTE_START || midi > MIDI_NOTE_END) return null;
    const octave = Math.floor(midi / 12) - 1;
    const noteIndex = midi % 12;
    return NOTE_NAMES_SHARP[noteIndex] + octave;
}

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
        layout.set(noteName, { note: noteName, isBlack, x: xPosition, width: isBlack ? blackKeyWidth : whiteKeyWidth, pressAnimation: 0 });
        if (!isBlack) { whiteKeyX += whiteKeyWidth; }
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
    const { resolution, style, alwaysDual, independentScroll, isVertical, startOctave } = payload;

    // This initialization block now runs only once.
    if (bottomKeyboardLayout === null) {
        const userKeyWidth = style.userKeyWidth;
        bottomKeyboardLayout = calculateKeyLayout(userKeyWidth);
        topKeyboardLayout = (alwaysDual || isVertical) ? calculateKeyLayout(userKeyWidth) : null;

        // **FIX**: Calculate the base scroll offset to align the viewports.
        const baseStartNote = `C${startOctave}`;
        const startKeyObject = bottomKeyboardLayout.get(baseStartNote);
        if (startKeyObject) {
            scrollOffset = startKeyObject.x;
        }

        // Set the offset for the top keyboard in independent mode.
        if (alwaysDual || isVertical) {
            if (independentScroll) {
                // The main script hardcodes the top keyboard to start 4 octaves higher.
                const topStartNote = `C${parseInt(startOctave) + 4}`;
                const topStartKeyObject = topKeyboardLayout.get(topStartNote);
                if (topStartKeyObject) {
                    scrollOffset2 = topStartKeyObject.x;
                }
            } else {
                scrollOffset2 = scrollOffset; // They are linked
            }
        }
        
        const userViewportWidth = style.userViewportWidth || resolution.width;
        zoomFactor = userViewportWidth > 0 ? resolution.width / userViewportWidth : 1;
        const rowHeight = (resolution.height / zoomFactor) / (alwaysDual || isVertical ? 2 : 1);
        cacheKeyRenders(userKeyWidth, rowHeight * 0.95);
        for (let i = 0; i < 600; i++) { starfield.push({ x: Math.random() * resolution.width, y: Math.random() * resolution.height, speed: Math.random() * 20 + 5, size: Math.random() * 2 + 0.5 }); }
    }

    const frameTime = framePayload.time; const deltaTime = framePayload.duration;
    const activeKeys = new Set();
    keyEvents.forEach((event, note) => { if (frameTime >= event.start && frameTime < event.end) activeKeys.add(note); });
    
    const relevantScrollEvent = scrollEvents.slice().reverse().find(e => e.time <= frameTime) || scrollEvents[0];
    
    // **FIX**: Combine the base offset with the user's scrolling to get the final camera position.
    const finalScrollX = scrollOffset + relevantScrollEvent.scrollX;
    const finalScrollX2 = scrollOffset2 + relevantScrollEvent.scrollX2;

    ctx.save();
    ctx.fillStyle = UI_STYLE.BACKGROUND_COLOR; ctx.fillRect(0, 0, resolution.width, resolution.height);
    for (let i = 0; i < resolution.width; i += 50) { ctx.fillStyle = UI_STYLE.GRID_COLOR; ctx.fillRect(i, 0, 1, resolution.height); }
    for (let i = 0; i < resolution.height; i += 50) { ctx.fillStyle = UI_STYLE.GRID_COLOR; ctx.fillRect(0, i, resolution.width, 1); }
    starfield.forEach(star => { star.y += star.speed * deltaTime; if (star.y > resolution.height) { star.y = 0; star.x = Math.random() * resolution.width; } });
    ctx.fillStyle = UI_STYLE.STAR_COLOR; starfield.forEach(star => ctx.fillRect(star.x, star.y, star.size, star.size));

    ctx.scale(zoomFactor, zoomFactor);
    const isDualView = alwaysDual || isVertical; const unscaledRowHeight = (resolution.height / zoomFactor) / (isDualView ? 2 : 1);

    const renderKey = (key, keyScreenX, yStart) => {
        const whiteKeyHeight = unscaledRowHeight * 0.95, blackKeyHeight = whiteKeyHeight * 0.65;
        const isActive = activeKeys.has(key.note);
        const eventData = keyEvents.get(key.note);
        
        const targetAnimation = isActive ? 1.0 : 0.0;
        if (Math.abs(key.pressAnimation - targetAnimation) > 0.01) { key.pressAnimation += (targetAnimation - key.pressAnimation) * 12.0 * deltaTime; } else { key.pressAnimation = targetAnimation; }

        if (effectMode === 'explosion' && isActive && eventData && !eventData.effectTriggered) {
            const effectX = keyScreenX + (eventData.x / zoomFactor);
            const effectY = yStart + (key.isBlack ? 0 : unscaledRowHeight - whiteKeyHeight) + (eventData.y / zoomFactor);
            createParticles(effectX, effectY);
            eventData.effectTriggered = true;
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

        const isHighlight = key.pressAnimation > 0.5; ctx.font = `bold ${style.userKeyWidth * 0.22}px sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = isHighlight ? UI_STYLE.ACTIVE_LABEL_COLOR : (key.isBlack ? UI_STYLE.LABEL_COLOR_BLACK_KEY : UI_STYLE.LABEL_COLOR_WHITE_KEY);
        if (key.isBlack) { ctx.textBaseline = 'middle'; ctx.fillText(key.note.slice(0, -1), keyScreenX + key.width / 2, yPos + height * 0.8); } else { ctx.textBaseline = 'bottom'; ctx.fillText(key.note, keyScreenX + key.width / 2, yStart + unscaledRowHeight - (unscaledRowHeight * 0.05)); }
    };

    const renderRow = (layout, yStart, transform) => {
        if (!layout) return;
        ['white', 'black'].forEach(type => {
            layout.forEach(key => {
                if ((type === 'black') === key.isBlack) {
                    // The transform is now the final, corrected scroll position.
                    const keyScreenX = key.x + transform;
                    if (keyScreenX + key.width > 0 && keyScreenX < style.userViewportWidth) {
                        renderKey(key, keyScreenX, yStart);
                    }
                }
            });
        });
    };
    
    renderRow(bottomKeyboardLayout, isDualView ? unscaledRowHeight : 0, -finalScrollX);
    if (isDualView) {
        const topScroll = independentScroll ? -finalScrollX2 : (style.userViewportWidth - finalScrollX);
        renderRow(topKeyboardLayout, 0, topScroll);
    }

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
            scrollEvents.sort((a, b) => a.time - b.time);
            break;

        case 'FINALIZE_MUXING':
            if (!renderer) return;
            const finalDuration = payload.audioBufferShim.duration;
            const { fps: finalFps } = renderer.config.outputFormat;
            const finalDeltaTime = 1 / finalFps;
            while (lastRenderedTime < finalDuration) {
                await renderer.addFrame({ time: lastRenderedTime, duration: finalDeltaTime });
                lastRenderedTime += finalDeltaTime;
            }
            const blob = await renderer.finalize(payload.audioBufferShim);
            renderer._postComplete(blob, { download: true, fileName: `BH-Piano-Render-${Date.now()}.mp4` });
            break;
    }
};