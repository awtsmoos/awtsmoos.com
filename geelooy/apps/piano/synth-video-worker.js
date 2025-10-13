/*
 ב"ה

B"H
File: /scripts/awts/moos/video/synth-video-worker.js
Description: A robust, offline renderer that guarantees perfect synchronization by collecting all
             events first and then building the video frame-by-frame from a complete timeline.
VERSION 36.0 - The "Offline Historian" Final Build
*/

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State ---
// **NEW**: We no longer render in real-time. We just store the history.
let keyPressHistory = [];
let scrollHistory = [];
let workerConfig = null; // To store the initial settings

let bottomKeyboardLayout = null, topKeyboardLayout = null, keyCache = {};
let particles = [];
let starfield = []; // Keep starfield for visual flair

// --- Visuals & Constants ---
const UI_STYLE = { BACKGROUND_COLOR: '#000000', GRID_COLOR: 'rgba(0, 150, 255, 0.1)', STAR_COLOR: 'rgba(220, 235, 255, 0.8)', WHITE_KEY_FILL: '#dfe2e8', WHITE_KEY_AO: 'rgba(0, 0, 0, 0.25)', BLACK_KEY_FILL: '#121317', BLACK_KEY_HIGHLIGHT: 'rgba(255, 255, 255, 0.1)', ACTIVE_KEY_BASE_COLOR: '#00ffff', ACTIVE_KEY_GLOW_COLOR: 'rgba(0, 255, 255, 0.7)', SHOCKWAVE_COLOR: 'rgba(0, 255, 255, 0.6)', PARTICLE_COLOR: '#ffffff', TOUCH_POINT_COLOR: 'rgba(0, 255, 255, 0.9)', LABEL_COLOR_WHITE_KEY: '#707080', LABEL_COLOR_BLACK_KEY: '#a0a0b0', ACTIVE_LABEL_COLOR: '#000000' };
const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MIDI_NOTE_START = 21; // A0
const MIDI_NOTE_END = 108;   // C8

// --- Utility Functions ---
// These functions build the visual assets and can remain mostly the same.
function midiToNoteName(midi) { const octave = Math.floor(midi / 12) - 1; const noteIndex = midi % 12; return NOTE_NAMES_SHARP[noteIndex] + octave; }
function calculateKeyLayout(whiteKeyWidth) { const layout = new Map(); let whiteKeyX = 0; const blackKeyWidth = whiteKeyWidth * 0.6; for (let midi = MIDI_NOTE_START; midi <= MIDI_NOTE_END; midi++) { const noteName = midiToNoteName(midi); if (!noteName) continue; const isBlack = noteName.includes('#'); const x = isBlack ? whiteKeyX - (blackKeyWidth / 2) : whiteKeyX; layout.set(noteName, { note: noteName, isBlack, x, width: isBlack ? blackKeyWidth : whiteKeyWidth, pressAnimation: 0 }); if (!isBlack) whiteKeyX += whiteKeyWidth; } return layout; }
function cacheKeyRenders(whiteKeyWidth, whiteKeyHeight) { const blackKeyWidth = whiteKeyWidth * 0.6, blackKeyHeight = whiteKeyHeight * 0.65; const wCanvas = new OffscreenCanvas(whiteKeyWidth, whiteKeyHeight); const wCtx = wCanvas.getContext('2d'); wCtx.fillStyle = UI_STYLE.WHITE_KEY_FILL; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight); const aoGradient = wCtx.createLinearGradient(0, 0, whiteKeyWidth, 0); aoGradient.addColorStop(0, UI_STYLE.WHITE_KEY_AO); aoGradient.addColorStop(0.1, 'transparent'); aoGradient.addColorStop(0.9, 'transparent'); aoGradient.addColorStop(1, UI_STYLE.WHITE_KEY_AO); wCtx.fillStyle = aoGradient; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight); keyCache['white_default'] = wCanvas; const bCanvas = new OffscreenCanvas(blackKeyWidth, blackKeyHeight); const bCtx = bCanvas.getContext('2d'); bCtx.fillStyle = UI_STYLE.BLACK_KEY_FILL; bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight); keyCache['black_default'] = bCanvas; }
function createParticles(x, y) { for (let i = 0; i < 80; i++) { const angle = Math.random() * Math.PI * 2; const speed = Math.random() * 250 + 75; particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: Math.random() * 2.0 + 0.8, initialLife: -1, radius: Math.random() * 2.5 + 1 }); } }


// --- The Frame Drawing Function ---
// This function is now a "dumb" renderer. It just draws what it's told for a single frame.
function drawKeyboardFrame(workerContext, frameData) {
    const { ctx } = workerContext;
    const { resolution, style, isDualView, unscaledRowHeight, zoomFactor, deltaTime, activeKeys, currentScrollX, currentScrollX2 } = frameData;

    // Background and Stars
    ctx.fillStyle = UI_STYLE.BACKGROUND_COLOR; ctx.fillRect(0, 0, resolution.width, resolution.height);
    starfield.forEach(star => { star.y += star.speed * deltaTime; if (star.y > resolution.height) { star.y = 0; star.x = Math.random() * resolution.width; } });
    ctx.fillStyle = UI_STYLE.STAR_COLOR; starfield.forEach(star => ctx.fillRect(star.x, star.y, star.size, star.size));

    ctx.save();
    ctx.scale(zoomFactor, zoomFactor);

    // This function handles rendering a single key based on its state
    const renderKey = (key, keyScreenX, yStart) => {
        const isActive = activeKeys.has(key.note);
        const eventData = isActive ? keyPressHistory.find(e => e.note === key.note && frameData.time >= e.start && frameData.time < e.end) : null;

        const targetAnimation = isActive ? 1.0 : 0.0;
        if (Math.abs(key.pressAnimation - targetAnimation) > 0.01) { key.pressAnimation += (targetAnimation - key.pressAnimation) * 12.0 * deltaTime; } else { key.pressAnimation = targetAnimation; }

        if (workerConfig.effectMode === 'explosion' && isActive && eventData && !eventData.effectTriggered) {
             createParticles(keyScreenX + (eventData.x/zoomFactor), yStart + (eventData.y/zoomFactor));
             eventData.effectTriggered = true; // Mark it so it only happens once
        }

        const whiteKeyHeight = unscaledRowHeight * 0.95, blackKeyHeight = whiteKeyHeight * 0.65;
        const pressDepth = key.pressAnimation * 4, yPos = yStart + (key.isBlack ? 0 : unscaledRowHeight - whiteKeyHeight), height = key.isBlack ? blackKeyHeight : whiteKeyHeight;
        ctx.drawImage(keyCache[`${key.isBlack ? 'black' : 'white'}_default`], keyScreenX, yPos + pressDepth);

        if (key.pressAnimation > 0) {
            ctx.globalAlpha = key.pressAnimation; ctx.fillStyle = UI_STYLE.ACTIVE_KEY_BASE_COLOR; ctx.fillRect(keyScreenX, yPos + pressDepth, key.width, height); ctx.globalAlpha = 1;
        }
        
        const isHighlight = key.pressAnimation > 0.5; ctx.font = `bold ${style.userKeyWidth * 0.22}px sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = isHighlight ? UI_STYLE.ACTIVE_LABEL_COLOR : (key.isBlack ? UI_STYLE.LABEL_COLOR_BLACK_KEY : UI_STYLE.LABEL_COLOR_WHITE_KEY);
        if (key.isBlack) { ctx.textBaseline = 'middle'; ctx.fillText(key.note.slice(0, -1), keyScreenX + key.width / 2, yPos + height * 0.8); } else { ctx.textBaseline = 'bottom'; ctx.fillText(key.note, keyScreenX + key.width / 2, yStart + unscaledRowHeight - (unscaledRowHeight * 0.05)); }
    };

    // This function renders an entire row of keys
    const renderRow = (layout, yStart, scroll) => {
        if (!layout) return;
        ['white', 'black'].forEach(type => { layout.forEach(key => { if ((type === 'black') === key.isBlack) { const keyScreenX = key.x - scroll; if (keyScreenX + key.width > 0 && keyScreenX < style.userViewportWidth) renderKey(key, keyScreenX, yStart); } }); });
    };

    renderRow(bottomKeyboardLayout, isDualView ? unscaledRowHeight : 0, currentScrollX);
    if (isDualView) renderRow(topKeyboardLayout, 0, workerConfig.independentScroll ? currentScrollX2 : currentScrollX);
    
    // Particle physics update
    if (workerConfig.effectMode === 'explosion') { for (let i = particles.length - 1; i >= 0; i--) { const p = particles[i]; p.x += p.vx * deltaTime; p.y += p.vy * deltaTime; p.vy += 400 * deltaTime; p.life -= deltaTime; if (p.life <= 0) { particles.splice(i, 1); } else { ctx.globalAlpha = p.life / p.initialLife; ctx.fillStyle = UI_STYLE.PARTICLE_COLOR; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); } } }

    ctx.restore();
}

// --- Main Worker Control Logic ---
self.onmessage = async (e) => {
    const { type, payload } = e.data;

    switch (type) {
        // ---- STAGE 1: Data Collection ----
        case 'INITIALIZE_RENDERER':
            workerConfig = payload;
            // Use the initial scroll position sent from the main script!
            scrollHistory = [{ time: 0, scrollX: payload.initialScrollX, scrollX2: payload.initialScrollX2 }];
            break;

        case 'ADD_KEY_EVENT':
            // Just save the event. No rendering.
            keyPressHistory.push(payload);
            break;

        case 'UPDATE_SCROLL':
            // Just save the event. No rendering.
            scrollHistory.push(payload);
            break;

        // ---- STAGE 2: Offline Rendering ----
        case 'FINALIZE_MUXING':
            if (!workerConfig) { console.error("Worker not initialized!"); return; }

            // 1. Final Setup (now that we have all data)
            const renderer = new MediaBunnyBase(workerConfig, drawKeyboardFrame, { libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' });
            await renderer.start();
            
            const { resolution, style, alwaysDual, isVertical, startOctave } = workerConfig;
            bottomKeyboardLayout = calculateKeyLayout(style.userKeyWidth);
            const isDualView = alwaysDual || isVertical;
            if(isDualView) topKeyboardLayout = calculateKeyLayout(style.userKeyWidth);

            const zoomFactor = resolution.width / style.userViewportWidth;
            const unscaledRowHeight = (resolution.height / zoomFactor) / (isDualView ? 2 : 1);
            cacheKeyRenders(style.userKeyWidth, unscaledRowHeight * 0.95);
            for (let i = 0; i < 600; i++) { starfield.push({ x: Math.random() * resolution.width, y: Math.random() * resolution.height, speed: Math.random() * 20 + 5, size: Math.random() * 2 + 0.5 }); }

            const baseScrollOffset = bottomKeyboardLayout.get(`C${startOctave}`)?.x || 0;

            // 2. The Grand Rendering Loop
            const finalDuration = payload.audioBufferShim.duration;
            const deltaTime = 1 / workerConfig.outputFormat.fps;

            for (let time = 0; time < finalDuration; time += deltaTime) {
                // For each frame, find the correct state from our history arrays
                const relevantScroll = scrollHistory.slice().reverse().find(s => s.time <= time) || scrollHistory[0];
                const activeKeys = new Set();
                keyPressHistory.forEach(k => {
                    if (time >= k.start && time < k.end) {
                        activeKeys.add(k.note);
                    }
                });

                // Assemble the complete data package for this single frame
                const frameData = {
                    time,
                    deltaTime,
                    resolution,
                    style,
                    isDualView,
                    unscaledRowHeight,
                    zoomFactor,
                    activeKeys,
                    currentScrollX: baseScrollOffset + relevantScroll.scrollX,
                    currentScrollX2: baseScrollOffset + relevantScroll.scrollX2
                };
                
                await renderer.addFrame(frameData);
            }

            // 3. Finalize and Post Back
            const blob = await renderer.finalize(payload.audioBufferShim);
            renderer._postComplete(blob, { download: true, fileName: `BH-Piano-Render-${Date.now()}.mp4` });
            
            // Clean up for next recording
            keyPressHistory = [];
            scrollHistory = [];
            workerConfig = null;
            break;
    }
};