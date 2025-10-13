/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: Correctly implements progress reporting to match the main script's listener.
             - Restores and features Hebrew letter particle explosions.
             - White keys remain white when active, gaining a "bloom" effect.
             - All visual focus is on high-intensity effects against a black background.
VERSION 57.0 - The "Correct Progress & Sacred Sparks" Build
*/

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State ---
let keyPressHistory = [];
let scrollHistory = [];
let workerConfig = null;

let masterKeyboardLayout = null;
let particles = [];
let shockwaves = [];

let baseOffset_Bottom = 0;
let baseOffset_Top = 0;

// --- VISUALS & CONSTANTS ---
const UI_STYLE = {
    BACKGROUND_COLOR: '#000000',
    // Key Colors (Inactive)
    WHITE_KEY_FILL: '#1a182d',
    WHITE_KEY_BORDER: 'rgba(80, 120, 200, 0.5)',
    BLACK_KEY_FILL: '#080610',
    BLACK_KEY_HIGHLIGHT: 'rgba(255, 255, 255, 0.05)',
    // Key Colors (Active)
    ACTIVE_WHITE_KEY_FILL: '#ffffff', // Pure white when active
    ACTIVE_KEY_BASE_COLOR: '#00ffff', // For black keys and glow
    ACTIVE_KEY_GLOW_COLOR: 'rgba(0, 255, 255, 0.2)', // For the bloom effect
    SHOCKWAVE_COLOR: 'rgba(0, 255, 255, 0.7)',
    // Label Colors
    LABEL_COLOR_WHITE_KEY: '#707080',
    LABEL_COLOR_BLACK_KEY: '#a0a0b0',
    ACTIVE_LABEL_COLOR: '#000000' // Black label on active white key for clarity
};
const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const HEBREW_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];
const MIDI_NOTE_START = 21; // A0
const MIDI_NOTE_END = 108; // C8

// --- Utility Functions ---
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

function createParticles(x, y) {
    for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 250 + 75;
        const letter = HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)];
        const hue = Math.random() * 360;
        particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: Math.random() * 2.5 + 1.0, initialLife: -1, radius: Math.random() * 3.5 + 2, letter, hue });
    }
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

        if (isActive && eventData && !eventData.effectTriggered) {
            const effectX = keyScreenX + (eventData.x / zoomFactor);
            const effectY = yStart + (eventData.y / zoomFactor);
            if (config.effectMode === 'explosion') {
                createParticles(effectX, effectY);
            }
            shockwaves.push({ x: effectX, y: effectY, life: 1.0, size: 0 });
            eventData.effectTriggered = true;
        }

        const whiteKeyHeight = unscaledRowHeight * 0.95, blackKeyHeight = whiteKeyHeight * 0.65;
        const yPos = yStart + (key.isBlack ? 0 : unscaledRowHeight - whiteKeyHeight);
        const height = key.isBlack ? blackKeyHeight : whiteKeyHeight;
        const width = key.width;

        ctx.fillStyle = key.isBlack ? UI_STYLE.BLACK_KEY_FILL : UI_STYLE.WHITE_KEY_FILL;
        ctx.fillRect(keyScreenX, yPos, width, height);
        if (!key.isBlack) {
            ctx.strokeStyle = UI_STYLE.WHITE_KEY_BORDER;
            ctx.lineWidth = 1;
            ctx.strokeRect(keyScreenX + 1, yPos, width - 2, height);
        } else {
            ctx.fillStyle = UI_STYLE.BLACK_KEY_HIGHLIGHT;
            ctx.fillRect(keyScreenX, yPos, width, 2);
        }

        if (key.pressAnimation > 0) {
            ctx.globalAlpha = key.pressAnimation;
            ctx.fillStyle = UI_STYLE.ACTIVE_KEY_GLOW_COLOR;
            ctx.fillRect(keyScreenX - width * 0.5, yPos - height * 0.5, width * 2, height * 2);
            ctx.fillRect(keyScreenX - width * 0.2, yPos - height * 0.2, width * 1.4, height * 1.4);
            
            if (key.isBlack) {
                ctx.fillStyle = UI_STYLE.ACTIVE_KEY_BASE_COLOR;
            } else {
                ctx.fillStyle = UI_STYLE.ACTIVE_WHITE_KEY_FILL;
            }
            ctx.fillRect(keyScreenX, yPos, width, height);
            ctx.globalAlpha = 1;
        }

        const isHighlight = key.pressAnimation > 0.5;
        ctx.font = `bold ${config.style.userKeyWidth * 0.22}px sans-serif`;
        ctx.textAlign = 'center';
        const labelColor = isHighlight ? 
            (key.isBlack ? '#FFFFFF' : UI_STYLE.ACTIVE_LABEL_COLOR) : 
            (key.isBlack ? UI_STYLE.LABEL_COLOR_BLACK_KEY : UI_STYLE.LABEL_COLOR_WHITE_KEY);
        ctx.fillStyle = labelColor;
        
        if (isHighlight) {
            ctx.shadowColor = UI_STYLE.ACTIVE_KEY_BASE_COLOR;
            ctx.shadowBlur = 10;
        }

        if (key.isBlack) {
            ctx.textBaseline = 'middle';
            ctx.fillText(key.note.slice(0, -1), keyScreenX + width / 2, yPos + height * 0.8);
        } else {
            ctx.textBaseline = 'bottom';
            ctx.fillText(key.note, keyScreenX + width / 2, yStart + unscaledRowHeight - (unscaledRowHeight * 0.05));
        }
        ctx.shadowBlur = 0;
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

    ctx.lineWidth = 4;
    for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.life -= deltaTime * 1.5;
        if (sw.life <= 0) {
            shockwaves.splice(i, 1);
        } else {
            sw.size = (1.0 - sw.life) * 200;
            ctx.globalAlpha = sw.life;
            ctx.strokeStyle = UI_STYLE.SHOCKWAVE_COLOR;
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.size, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    if (config.effectMode === 'explosion') {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.vy += 600 * deltaTime;
            p.life -= deltaTime;
            if (p.life <= 0) {
                particles.splice(i, 1);
            } else {
                if (p.initialLife === -1) p.initialLife = p.life;
                const lifeRatio = p.life / p.initialLife;
                ctx.globalAlpha = lifeRatio;
                const lightness = 75 + (1 - lifeRatio) * 25;
                ctx.fillStyle = `hsl(${p.hue}, 100%, ${lightness}%)`;
                ctx.font = `bold ${p.radius * 8}px sans-serif`;
                ctx.fillText(p.letter, p.x, p.y);
            }
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
                    // --- THE FIX ---
                    // This message now perfectly matches what the main script expects.
                    self.postMessage({
                        type: 'PROGRESS_UPDATE',
                        payload: {
                            percent: progress
                        }
                    });
                    lastReportedProgress = progress;
                }
            }

            const blob = await renderer.finalize(payload.audioBufferShim);
            renderer._postComplete(blob, { download: true, fileName: `BH-WebSynth-Video-${Date.now()}.mp4` });
            break;
    }
};