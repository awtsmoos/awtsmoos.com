// B"H - Definitive Worker: Persistent Captions, High-Performance Effects, All Fixes

// --- FONT SETUP (ROBUST & INTERNAL) ---
const HEBREW_FONT_STACK = "'Noto Sans Hebrew', 'Heebo', sans-serif";
const EMOJI_FALLBACK_FONT = 'sans-serif';

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

let renderer;
// --- FIX: Global variable to store the last active caption ---
let lastActiveCue = null;

// --- ROBUST AUDIO ANALYSIS ---
function preAnalyzeAudio(audioBufferShim, totalFrames) {
    const channelData = audioBufferShim.channels[0];
    if (!channelData || channelData.length === 0) return new Array(totalFrames).fill(0.01);
    const volumeLevels = [];
    const samplesPerFrame = Math.floor(channelData.length / totalFrames);
    for (let i = 0; i < totalFrames; i++) {
        let rms = 0;
        const start = i * samplesPerFrame;
        for (let j = 0; j < samplesPerFrame; j++) rms += (channelData[start + j] || 0) ** 2;
        const volume = Math.sqrt(rms / samplesPerFrame);
        volumeLevels.push(isNaN(volume) ? 0.01 : Math.max(0.01, volume));
    }
    return volumeLevels;
}

// --- MAIN ENTRY POINT ---
self.onmessage = async ({ data: { cues, audioBufferShim, settings } }) => {
    try {
        const frameRate = 30;
        const totalDuration = (settings.maxDuration > 0 && settings.maxDuration < audioBufferShim.duration) ? settings.maxDuration : audioBufferShim.duration;
        const totalFrames = Math.floor(totalDuration * frameRate);
        const volumeDataForFrames = preAnalyzeAudio(audioBufferShim, totalFrames);
        const particleSystem = new ParticleSystem(settings.particles, settings.resolution);
        const drawPayload = { cues, settings, particleSystem, volumeDataForFrames };

        renderer = new MediaBunnyBase({ resolution: settings.resolution, outputFormat: { quality: 0.8 } },
            (base, frame) => drawFrame({ ...base, ...drawPayload }, frame),
            { libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' }
        );
        await renderer.start();

        for (let i = 0; i <= totalFrames; i++) {
            const time = i / frameRate;
            await renderer.addFrame({ time, duration: 1 / frameRate, frameNumber: i });
            if (i > 0 && i % 30 === 0) self.postMessage({ type: 'STATUS_UPDATE', payload: { message: `Encoding frame ${i} of ${totalFrames}`, progress: (i / totalFrames) * 100 } });
        }
        
        const blob = await renderer.finalize(audioBufferShim);
        self.postMessage({ type: 'VIDEO_COMPLETE', payload: { blob, fileName: `BH_video_${new Date().getTime()}.mp4` } });
    } catch (error) {
        self.postMessage({ type: 'FATAL_ERROR', payload: { message: error.message, error: error.stack } });
    }
};

// --- CORE DRAWING ---
function drawFrame({ ctx, canvas, cues, settings, particleSystem, volumeDataForFrames }, framePayload) {
    const { time, frameNumber } = framePayload;
    const { width, height } = canvas;
    const currentVolume = volumeDataForFrames[frameNumber] || 0.01;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    particleSystem.updateAndDraw(ctx, currentVolume);
    drawWaveform(ctx, time, width, height, settings, currentVolume);
    
    // --- FIX: CAPTION PERSISTENCE LOGIC FOR EXPORT ---
    const currentCue = cues.find(cue => time >= cue.start && time < cue.end);
    if (currentCue) {
        lastActiveCue = currentCue; // A new cue is active, so we update our memory
    }
    
    // We draw the 'lastActiveCue'. If there's a silent gap, this will still hold the previous caption.
    if (lastActiveCue) {
        const boxSize = width * 0.9;
        const { boxColor, boxOpacity } = settings.font;
        const r = parseInt(boxColor.substr(1, 2), 16), g = parseInt(boxColor.substr(3, 2), 16), b = parseInt(boxColor.substr(5, 2), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${boxOpacity})`;
        ctx.fillRect((width - boxSize) / 2, (height - boxSize) / 2, boxSize, boxSize);
        wrapText(ctx, lastActiveCue.text, width / 2, height / 2, boxSize, boxSize, settings.font, height / 720);
    }
}

// --- FINAL HIGH-PERFORMANCE WAVEFORM ---
function drawWaveform(ctx, time, width, height, settings, volume) {
    const { waveformHeight, waveformThickness } = settings;
    if (waveformHeight <= 0) return;

    const baseY = height * 0.85;
    const maxAmplitude = height * (waveformHeight / 100);
    const amplitude = maxAmplitude * (volume ** 1.5);

    const createPath = () => {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 10) {
            const mainWave = Math.sin(x * 0.015 + time * 6) * 0.6;
            const detailWave = Math.sin(x * 0.04 + time * 10) * 0.4;
            const finalY = baseY + (mainWave + detailWave) * amplitude;
            x === 0 ? ctx.moveTo(x, finalY) : ctx.lineTo(x, finalY);
        }
    };

    // PERFORMANCE FIX: Simulate glow with multiple fast layers, NO BLUR.
    // Layer 1: Thick, very transparent base
    ctx.strokeStyle = `rgba(150, 200, 255, ${0.3 * volume})`;
    ctx.lineWidth = waveformThickness * 3;
    createPath();
    ctx.stroke();

    // Layer 2: Main wave body
    ctx.strokeStyle = `rgba(200, 225, 255, ${0.6 * volume + 0.2})`;
    ctx.lineWidth = waveformThickness;
    createPath();
    ctx.stroke();
    
    // Layer 3: Thin, bright highlight
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * volume})`;
    ctx.lineWidth = waveformThickness * 0.5;
    createPath();
    ctx.stroke();
}

// --- FINAL INTENSE PARTICLE SYSTEM ---
class ParticleSystem {
    constructor(settings, resolution) {
        this.settings = settings;
        this.width = resolution.width;
        this.height = resolution.height;
        this.sizeScalar = Math.max(1.0, this.height / 720); 
        this.particles = Array.from({ length: this.settings.density }, () => this.createParticle({}));
    }

    createParticle(p = {}) {
        p.x = Math.random() * this.width;
        p.y = this.height + Math.random() * 20;
        p.vx = (Math.random() - 0.5) * 2;
        p.vy = -(Math.random() * 2.0 + 1.5); // Increased base upward speed
        p.char = this.settings.chars[Math.floor(Math.random() * this.settings.chars.length)];
        const baseSize = Math.max(5, this.settings.baseSize + (Math.random() - 0.5) * this.settings.variation);
        p.size = baseSize * this.sizeScalar; // Apply resolution scaling
        p.hue = Math.random() * 360;
        p.opacity = 0.6 + Math.random() * 0.4;
        return p;
    }

    updateAndDraw(ctx, volume) {
        const earthquakeAmount = (volume ** 2) * 60; // Increased intensity

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -p.size) this.createParticle(p);

            const jiggleX = (Math.random() - 0.5) * earthquakeAmount;
            const jiggleY = (Math.random() - 0.5) * earthquakeAmount;

            ctx.save();
            ctx.translate(p.x + jiggleX, p.y + jiggleY);
            ctx.rotate((p.x + p.y) * 0.02); // More chaotic rotation
            ctx.font = `${p.size}px ${EMOJI_FALLBACK_FONT}`;
            ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${p.opacity})`;
            ctx.fillText(p.char, 0, 0);
            ctx.restore();
        });
    }
}

// --- TEXT HELPERS ---
function getWrappedLines(ctx, text, maxWidth) {
    const lines = text.split("\n"); let allLines = [];
    lines.forEach(line => {
        let currentLine = ''; let words = line.split(' ');
        for (let i = 0; i < words.length; i++) {
            let testLine = currentLine + (currentLine ? ' ' : '') + words[i];
            if (i > 0 && ctx.measureText(testLine).width > maxWidth) {
                allLines.push(currentLine); currentLine = words[i];
            } else { currentLine = testLine; }
        }
        allLines.push(currentLine);
    });
    return allLines;
}

function wrapText(ctx, text, x, y, maxWidth, maxHeight, fontSettings, scaleFactor) {
    let scaledFontSize = fontSettings.size * scaleFactor;
    while (scaledFontSize > 5) {
        ctx.font = `bold ${scaledFontSize}px ${HEBREW_FONT_STACK}`;
        const lines = getWrappedLines(ctx, text, maxWidth * 0.95);
        if ((lines.length * scaledFontSize * 1.4) < maxHeight * 0.95) break;
        scaledFontSize -= 1;
    }
    ctx.direction = 'ltr';
    ctx.font = `bold ${scaledFontSize}px ${HEBREW_FONT_STACK}`;
    ctx.textAlign = fontSettings.align;
    const lines = getWrappedLines(ctx, text, maxWidth * 0.95);
    const lineHeight = scaledFontSize * 1.4;
    const startY = y - ((lines.length - 1) * lineHeight) / 2 + (scaledFontSize * 0.3);
    lines.forEach((line, i) => {
        const currentY = startY + (i * lineHeight);
        if (fontSettings.borderWidth > 0) {
            ctx.strokeStyle = fontSettings.borderColor;
            ctx.lineWidth = fontSettings.borderWidth * scaleFactor * 2;
            ctx.strokeText(line, x, currentY);
        }
        ctx.fillStyle = fontSettings.color;
        ctx.fillText(line, x, currentY);
    });
}