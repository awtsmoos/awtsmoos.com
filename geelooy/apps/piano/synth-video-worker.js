/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: The final, optimized build combining pipelined rendering with ultimate key visuals.
             - RE-IMPLEMENTED: The stable "smart worker" pipeline for massively reduced post-processing time.
             - ENHANCED: Key visuals have been rebuilt with advanced gradients for a "shiny," realistic 3D bevel and depth.
             - All features are retained: rich particles, lightning, memory caps, and stability fixes.
VERSION 68.0 - The "Pipelined & Polished" Build
*/

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State for Pipelining ---
let workerConfig = null;
let eventQueue = [];
let renderer = null;
let lastRenderedTime = 0.0;
let isFinalizing = false;
let processingInterval = null;

let masterKeyboardLayout = null;
let keyCache = {};
let particles = [];
let shockwaves = [];
let touchPoints = [];
let lightningBolts = [];

let baseOffset_Bottom = 0;
let baseOffset_Top = 0;

const RENDER_LATENCY_SECONDS = 2.0;
const MAX_PARTICLES = 1500;
const PARTICLE_DENSITY = 15;

// --- VISUALS & CONSTANTS (Polished 3D Style) ---
const UI_STYLE = {
    BACKGROUND_COLOR: '#000000',
    // White Key Style (Enhanced)
    WHITE_KEY_FILL_TOP: '#FFFFFF', WHITE_KEY_FILL_BOTTOM: '#F4F5F8', // Brighter, cleaner gradient
    WHITE_KEY_FRONT_FACE: '#C8CDD5', WHITE_KEY_SHADOW: 'rgba(0, 0, 0, 0.25)', // Less pronounced shadow
    WHITE_KEY_SHINY_BEVEL_START: 'rgba(255, 255, 255, 0.9)', // Brighter, sharper highlight
    WHITE_KEY_SHINY_BEVEL_END: 'rgba(255, 255, 255, 0.0)',
    WHITE_KEY_INNER_SHADOW: 'rgba(0, 0, 0, 0.1)', // Softer inner shadow
    // Black Key Style
    BLACK_KEY_GRADIENT_START: '#404248', BLACK_KEY_GRADIENT_END: '#18191C',
    BLACK_KEY_BEVEL_HIGHLIGHT: 'rgba(255, 255, 255, 0.2)', // Shinier black key highlight
    // Active Effects
    ACTIVE_KEY_OVERLAY_COLOR: 'rgba(0, 255, 255, 0.7)',
    TOUCH_POINT_COLOR: 'rgba(0, 255, 255, 0.4)', SHOCKWAVE_COLOR: 'rgba(0, 255, 255, 0.7)',
    PARTICLE_BORDER_COLOR: 'rgba(0, 0, 0, 0.5)', LIGHTNING_COLOR: 'rgba(150, 220, 255, 0.8)',
    BUBBLE_COLOR: 'rgba(0, 200, 255, 0.3)',
    LABEL_COLOR_WHITE_KEY: '#707080', LABEL_COLOR_BLACK_KEY: '#a0a0b0', ACTIVE_LABEL_COLOR: '#000000'
};
const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const HEBREW_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];
const EMOJIS = ['✨', '🌕', '🌏', '🌎', '🧬', '🔥', '🎇', '👑', '☀️'];
const MIDI_NOTE_START = 21; const MIDI_NOTE_END = 108;


// --- Key Pre-Rendering (Polished Version) ---
function cacheKeyRenders(whiteKeyWidth, whiteKeyHeight) {
    const blackKeyWidth = whiteKeyWidth * 0.6, blackKeyHeight = whiteKeyHeight * 0.65;
    const shadowOffset = whiteKeyWidth * 0.05, keyFrontHeight = whiteKeyWidth * 0.07;
    const wCanvas = new OffscreenCanvas(whiteKeyWidth, whiteKeyHeight + shadowOffset);
    const wCtx = wCanvas.getContext('2d');
    wCtx.fillStyle = UI_STYLE.WHITE_KEY_SHADOW; wCtx.fillRect(0, shadowOffset, whiteKeyWidth, whiteKeyHeight);
    const bodyGradient = wCtx.createLinearGradient(0, 0, 0, whiteKeyHeight);
    bodyGradient.addColorStop(0, UI_STYLE.WHITE_KEY_FILL_TOP); bodyGradient.addColorStop(1, UI_STYLE.WHITE_KEY_FILL_BOTTOM);
    wCtx.fillStyle = bodyGradient; wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight);
    wCtx.fillStyle = UI_STYLE.WHITE_KEY_FRONT_FACE; wCtx.fillRect(0, whiteKeyHeight - keyFrontHeight, whiteKeyWidth, keyFrontHeight);
    const innerShadow = wCtx.createLinearGradient(0, 0, 0, 8);
    innerShadow.addColorStop(0, UI_STYLE.WHITE_KEY_INNER_SHADOW); innerShadow.addColorStop(1, 'transparent');
    wCtx.fillStyle = innerShadow; wCtx.fillRect(0, 1, whiteKeyWidth, 7);
    const shinyBevel = wCtx.createLinearGradient(0, 0, 0, 4);
    shinyBevel.addColorStop(0, UI_STYLE.WHITE_KEY_SHINY_BEVEL_START); shinyBevel.addColorStop(1, UI_STYLE.WHITE_KEY_SHINY_BEVEL_END);
    wCtx.fillStyle = shinyBevel; wCtx.fillRect(0, 0, whiteKeyWidth, 4);
    keyCache['white_default'] = wCanvas;
    const bCanvas = new OffscreenCanvas(blackKeyWidth, blackKeyHeight);
    const bCtx = bCanvas.getContext('2d');
    const bGradient = bCtx.createLinearGradient(0, 0, 0, blackKeyHeight);
    bGradient.addColorStop(0, UI_STYLE.BLACK_KEY_GRADIENT_START); bGradient.addColorStop(1, UI_STYLE.BLACK_KEY_GRADIENT_END);
    bCtx.fillStyle = bGradient; bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight);
    bCtx.fillStyle = UI_STYLE.BLACK_KEY_BEVEL_HIGHLIGHT; bCtx.fillRect(0, 0, blackKeyWidth, 2.5);
    keyCache['black_default'] = bCanvas;
}

function calculateMasterLayout(whiteKeyWidth) {
    const layout = new Map();
    let whiteKeyX = 0; const blackKeyWidth = whiteKeyWidth * 0.6;
    for (let midi = MIDI_NOTE_START; midi <= MIDI_NOTE_END; midi++) {
        const octave = Math.floor(midi / 12) - 1, note = NOTE_NAMES_SHARP[midi % 12];
        const noteName = note + octave, isBlack = note.includes('#');
        const x = isBlack ? whiteKeyX - (blackKeyWidth / 2) : whiteKeyX;
        layout.set(noteName, { note: noteName, isBlack, x, width: isBlack ? blackKeyWidth : whiteKeyWidth, pressAnimation: 0 });
        if (!isBlack) whiteKeyX += whiteKeyWidth;
    }
    return layout;
}

// --- Effect Creation & Management ---
function createRichExplosion(x, y) {
    if (particles.length + PARTICLE_DENSITY > MAX_PARTICLES) {
        particles.splice(0, particles.length + PARTICLE_DENSITY - MAX_PARTICLES);
    }
    for (let i = 0; i < PARTICLE_DENSITY; i++) {
        const angle = Math.random() * Math.PI * 2, speed = Math.random() * 250 + 75;
        const p = { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: Math.random() * 3.0 + 1.5, initialLife: -1, radius: 0 };
        const typeRoll = Math.random();
        if (typeRoll < 0.4) { p.type = 'hebrew'; p.content = HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)]; p.hue = Math.random() * 360; p.radius = Math.random() * 4 + 3; }
        else if (typeRoll < 0.6) { p.type = 'emoji'; p.content = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]; p.radius = Math.random() * 6 + 5; }
        else if (typeRoll < 0.8) { p.type = 'spark'; p.life = Math.random() * 1.0 + 0.5; p.radius = Math.random() * 1.5 + 1; }
        else { p.type = 'bubble'; p.vy = -Math.random() * 50 - 25; p.life = Math.random() * 4.0 + 2.0; p.radius = Math.random() * 8 + 4; }
        particles.push(p);
    }
}
function createTouchEvent(x, y) { touchPoints.push({ x, y, life: 1.0, initialLife: 1.0, radius: 25 }); }
function createLightningBolt(p1, p2) {
    const segments = [], numSegments = 10, boltLife = 0.4, maxOffset = 15;
    segments.push({ x: p1.x, y: p1.y });
    for (let i = 1; i < numSegments; i++) {
        const t = i / numSegments, px = p1.x + t * (p2.x - p1.x), py = p1.y + t * (p2.y - p1.y);
        const offset = (Math.random() - 0.5) * maxOffset * (1 - Math.abs(2 * t - 1));
        const normal = { x: -(p2.y - p1.y), y: p2.x - p1.x }, normLength = Math.hypot(normal.x, normal.y) || 1;
        segments.push({ x: px + normal.x / normLength * offset, y: py + normal.y / normLength * offset });
    }
    segments.push({ x: p2.x, y: p2.y }); lightningBolts.push({ segments, life: boltLife, initialLife: boltLife });
}

// --- Frame Drawing ---
function drawKeyboardFrame(workerContext, framePayload) {
    const { payload: config, ctx } = workerContext;
    const { time, duration: deltaTime } = framePayload;
    const relevantScroll = eventQueue.filter(e => e.type === 'UPDATE_SCROLL' && e.payload.time <= time).map(e => e.payload).pop() || { time: 0, scrollX: config.initialScrollX, scrollX2: config.initialScrollX2 };
    const activeKeys = new Set(), activeKeyEvents = [];
    eventQueue.forEach(e => { if (e.type === 'ADD_KEY_EVENT' && time >= e.payload.start && time < e.payload.end) { activeKeys.add(e.payload.note); activeKeyEvents.push(e.payload); } });
    const finalScroll_Bottom = baseOffset_Bottom + relevantScroll.scrollX, finalScroll_Top = baseOffset_Top + (config.independentScroll ? relevantScroll.scrollX2 : relevantScroll.scrollX);
    ctx.fillStyle = UI_STYLE.BACKGROUND_COLOR; ctx.fillRect(0, 0, config.resolution.width, config.resolution.height);
    ctx.save();
    const zoomFactor = config.resolution.width / config.style.userViewportWidth; ctx.scale(zoomFactor, zoomFactor);
    const isDualView = config.alwaysDual || config.isVertical, unscaledRowHeight = (config.resolution.height / zoomFactor) / (isDualView ? 2 : 1);
    const renderKey = (key, keyScreenX, yStart) => {
        const isActive = activeKeys.has(key.note), eventData = isActive ? activeKeyEvents.find(e => e.note === key.note) : null;
        const targetAnimation = isActive ? 1.0 : 0.0; if (Math.abs(key.pressAnimation - targetAnimation) > 0.01) { key.pressAnimation += (targetAnimation - key.pressAnimation) * 12.0 * deltaTime; } else { key.pressAnimation = targetAnimation; }
        const whiteKeyHeight = unscaledRowHeight * 0.95, pressDepth = key.pressAnimation * 4, yPos = yStart + (key.isBlack ? 0 : unscaledRowHeight - whiteKeyHeight);
        if (isActive && eventData && !eventData.effectTriggered) {
            const effectX = keyScreenX + (eventData.x / zoomFactor), effectY = yPos + (eventData.y / zoomFactor);
            if (config.renderMode === 'explosion') { createRichExplosion(effectX, effectY); } else if (config.renderMode === 'touchpoint') { createTouchEvent(effectX, effectY); }
            shockwaves.push({ x: effectX, y: effectY, life: 1.0, size: 0 }); eventData.effectTriggered = true;
        }
        ctx.drawImage(keyCache[key.isBlack ? 'black_default' : 'white_default'], keyScreenX, yPos + pressDepth);
        if (key.pressAnimation > 0) {
            ctx.globalAlpha = key.pressAnimation; ctx.fillStyle = UI_STYLE.ACTIVE_KEY_OVERLAY_COLOR;
            const height = key.isBlack ? whiteKeyHeight * 0.65 : whiteKeyHeight; ctx.fillRect(keyScreenX, yPos + pressDepth, key.width, height); ctx.globalAlpha = 1;
        }
        const isHighlight = key.pressAnimation > 0.5; ctx.font = `bold ${config.style.userKeyWidth * 0.22}px sans-serif`; ctx.textAlign = 'center';
        ctx.fillStyle = isHighlight ? UI_STYLE.ACTIVE_LABEL_COLOR : (key.isBlack ? UI_STYLE.LABEL_COLOR_BLACK_KEY : UI_STYLE.LABEL_COLOR_WHITE_KEY);
        const keyText = key.isBlack ? key.note.slice(0, -1) : key.note, textY = key.isBlack ? yPos + (whiteKeyHeight * 0.65) * 0.8 + pressDepth : yStart + unscaledRowHeight - (unscaledRowHeight * 0.05) + pressDepth;
        ctx.textBaseline = key.isBlack ? 'middle' : 'bottom'; ctx.fillText(keyText, keyScreenX + key.width / 2, textY);
    };
    const renderRow = (layout, yStart, scroll) => { ['white', 'black'].forEach(type => { layout.forEach(key => { if ((type === 'black') === key.isBlack) { const keyScreenX = key.x - scroll; if (keyScreenX + key.width > 0 && keyScreenX < config.style.userViewportWidth) { renderKey(key, keyScreenX, yStart); } } }); }); };
    renderRow(masterKeyboardLayout, isDualView ? unscaledRowHeight : 0, finalScroll_Bottom); if (isDualView) renderRow(masterKeyboardLayout, 0, finalScroll_Top);
    for (let i = shockwaves.length - 1; i >= 0; i--) { const sw = shockwaves[i]; sw.life -= deltaTime * 1.5; if (sw.life <= 0) shockwaves.splice(i, 1); }
    for (let i = touchPoints.length - 1; i >= 0; i--) { const tp = touchPoints[i]; tp.life -= deltaTime * 2.0; if (tp.life <= 0) touchPoints.splice(i, 1); }
    for (let i = lightningBolts.length - 1; i >= 0; i--) { const l = lightningBolts[i]; l.life -= deltaTime; if (l.life <= 0) lightningBolts.splice(i, 1); }
    for (let i = particles.length - 1; i >= 0; i--) { const p = particles[i]; p.x += p.vx * deltaTime; p.y += p.vy * deltaTime; p.vy += 600 * deltaTime; p.life -= deltaTime; if (p.life <= 0) particles.splice(i, 1); }
    if (particles.length > 2 && Math.random() < 0.3) { const p1 = particles[Math.floor(Math.random() * particles.length)]; const p2 = particles[Math.floor(Math.random() * particles.length)]; if (p1 !== p2) { const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y); if (dist > 50 && dist < 150) { createLightningBolt(p1, p2); } } }
    ctx.lineWidth = 4; shockwaves.forEach(sw => { ctx.globalAlpha = sw.life; ctx.strokeStyle = UI_STYLE.SHOCKWAVE_COLOR; ctx.beginPath(); ctx.arc(sw.x, sw.y, (1.0 - sw.life) * 200, 0, Math.PI * 2); ctx.stroke(); });
    touchPoints.forEach(tp => { ctx.globalAlpha = (tp.life / tp.initialLife) * 0.7; ctx.fillStyle = UI_STYLE.TOUCH_POINT_COLOR; ctx.beginPath(); ctx.arc(tp.x, tp.y, tp.radius, 0, Math.PI * 2); ctx.fill(); });
    lightningBolts.forEach(bolt => { ctx.globalAlpha = (bolt.life / bolt.initialLife) * 0.8; ctx.strokeStyle = UI_STYLE.LIGHTNING_COLOR; ctx.lineWidth = 1 + (bolt.life / bolt.initialLife) * 3; ctx.shadowColor = UI_STYLE.LIGHTNING_COLOR; ctx.shadowBlur = 15; ctx.beginPath(); ctx.moveTo(bolt.segments[0].x, bolt.segments[0].y); for (let i = 1; i < bolt.segments.length; i++) { ctx.lineTo(bolt.segments[i].x, bolt.segments[i].y); } ctx.stroke(); });
    ctx.shadowBlur = 0;
    particles.forEach(p => { if (p.initialLife === -1) p.initialLife = p.life; const lifeRatio = p.life / p.initialLife; ctx.globalAlpha = lifeRatio; switch (p.type) { case 'hebrew': case 'emoji': const fontSize = p.type === 'hebrew' ? p.radius * 8 : p.radius * 6; ctx.font = `bold ${fontSize}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; if (p.type === 'hebrew') { const lightness = 75 + (1 - lifeRatio) * 25; ctx.fillStyle = `hsl(${p.hue}, 100%, ${lightness}%)`; ctx.strokeStyle = UI_STYLE.PARTICLE_BORDER_COLOR; ctx.lineWidth = 2; ctx.strokeText(p.content, p.x, p.y); } else { ctx.fillStyle = '#FFFFFF'; } ctx.fillText(p.content, p.x, p.y); break; case 'spark': ctx.fillStyle = `rgba(255, 255, 200, ${lifeRatio})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); break; case 'bubble': ctx.strokeStyle = UI_STYLE.BUBBLE_COLOR; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius * (1 - lifeRatio), 0, Math.PI * 2); ctx.stroke(); break; } });
    ctx.globalAlpha = 1; ctx.restore();
}

// --- Pipelined Processing Engine ---
async function processEventQueue() {
    if (!renderer || isFinalizing) return;
    const latestEventTime = eventQueue.length > 0 ? (eventQueue[eventQueue.length - 1].payload.time ?? eventQueue[eventQueue.length - 1].payload.end) : lastRenderedTime;
    let renderUpToTime = latestEventTime - RENDER_LATENCY_SECONDS; if (renderUpToTime <= lastRenderedTime) return;
    const deltaTime = 1 / workerConfig.outputFormat.fps;
    for (let time = lastRenderedTime; time < renderUpToTime; time += deltaTime) {
        await renderer.addFrame({ time, duration: deltaTime });
    }
    lastRenderedTime = renderUpToTime;
}

// --- Main Worker Control Logic ---
self.onmessage = async (e) => {
    const { type, payload } = e.data;
    if (isFinalizing && type !== 'FINALIZE_MUXING') return;
    switch (type) {
        case 'INITIALIZE_RENDERER':
            workerConfig = payload;
            eventQueue = []; lastRenderedTime = 0.0; isFinalizing = false;
            particles = []; shockwaves = []; touchPoints = []; lightningBolts = [];
            if (processingInterval) clearInterval(processingInterval);
            renderer = new MediaBunnyBase(workerConfig, drawKeyboardFrame, { libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' });
            await renderer.start();
            masterKeyboardLayout = calculateMasterLayout(workerConfig.style.userKeyWidth);
            const zoomFactor = workerConfig.resolution.width / workerConfig.style.userViewportWidth;
            const unscaledRowHeight = (workerConfig.resolution.height / zoomFactor) / ((workerConfig.alwaysDual || workerConfig.isVertical) ? 2 : 1);
            cacheKeyRenders(workerConfig.style.userKeyWidth, unscaledRowHeight * 0.95);
            const uiStartOctave = parseInt(workerConfig.startOctave); const bottomStartNote = `C${uiStartOctave}`;
            baseOffset_Bottom = masterKeyboardLayout.get(bottomStartNote)?.x || 0;
            if (workerConfig.independentScroll) { const topStartNote = `C${uiStartOctave + 4}`; baseOffset_Top = masterKeyboardLayout.get(topStartNote)?.x || 0; }
            else { baseOffset_Top = baseOffset_Bottom - workerConfig.style.userViewportWidth; }
            processingInterval = setInterval(processEventQueue, 500);
            break;
        case 'ADD_KEY_EVENT': case 'UPDATE_SCROLL':
            if (payload.start !== undefined) payload.effectTriggered = false;
            eventQueue.push({ type, payload });
            break;
        case 'FINALIZE_MUXING':
            isFinalizing = true; if (processingInterval) clearInterval(processingInterval);
            const finalDuration = payload.audioBufferShim.duration;
            const deltaTime = 1 / workerConfig.outputFormat.fps;
            let lastReportedProgress = -1;
            // The final render pass is now a simple, reliable loop
            for (let time = lastRenderedTime; time < finalDuration; time += deltaTime) {
                await renderer.addFrame({ time, duration: deltaTime });
                const progress = Math.floor((time / finalDuration) * 100);
                if (progress > lastReportedProgress && progress > (lastRenderedTime / finalDuration * 100)) {
                    self.postMessage({ type: 'PROGRESS_UPDATE', payload: { percent: progress } });
                    lastReportedProgress = progress;
                }
            }
            const blob = await renderer.finalize(payload.audioBufferShim);
            renderer._postComplete(blob, { download: true, fileName: `BH-WebSynth-Video-${Date.now()}.mp4` });
            break;
    }
};