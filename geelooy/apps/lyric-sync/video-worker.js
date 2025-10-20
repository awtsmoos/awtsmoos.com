// B"H - Definitive Worker: Architected for Preview, Built for Stable Export

// --- FONT SETUP ---
const HEBREW_FONT_STACK = "'Noto Sans Hebrew', 'Heebo', sans-serif";
const EMOJI_FALLBACK_FONT = 'sans-serif';

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- WORKER GLOBAL STATE ---
// These are placeholders for the future OffscreenCanvas preview model
let ctx = null;
let canvasWidth = 0, canvasHeight = 0;
let isInitializedForPreview = false;

// State used by both preview and export
let cues = [];
let settings = {};
let particleSystem = null;
let volumeDataForFrames = [];
let lastActiveCue = null;
let totalDuration = 0;
const frameRate = 24;

// --- MAIN MESSAGE HANDLER (THE "SWITCHBOARD") ---
// This structure handles both direct export and is ready for a future preview model.
self.onmessage = async ({ data }) => {
    try {
        // For the current stable script.js, it sends all data at once.
        // We treat this as a one-time command to initialize and export.
        if (data.cues && data.audioBufferShim && data.settings) {
            await handleExport(data);
        } else {
            // These are for a future script.js that uses OffscreenCanvas
            switch (data.type) {
                case 'INIT':
                    // This would initialize the live preview
                    break;
                case 'DRAW_PREVIEW':
                    // This would draw a single preview frame
                    break;
                case 'UPDATE_SETTINGS':
                    // This would update settings for the live preview
                    break;
            }
        }
    } catch (error) {
        self.postMessage({ type: 'FATAL_ERROR', payload: { message: error.message, error: error.stack } });
    }
};


// --- EXPORT HANDLING ---
async function handleExport({ cues, audioBufferShim, settings }) {
    totalDuration = (settings.maxDuration > 0 && settings.maxDuration < audioBufferShim.duration) ? settings.maxDuration : audioBufferShim.duration;
    const totalFrames = Math.floor(totalDuration * frameRate);
    
    // Perform all analysis required for the render
    volumeDataForFrames = preAnalyzeAudio(audioBufferShim, totalFrames);
    
    // Create a particle system sized for the final export resolution
    const exportParticleSystem = new ParticleSystem(settings.particles, settings.resolution);

    const renderer = new MediaBunnyBase({ resolution: settings.resolution, outputFormat: { quality: 1 } },
        (base, frame) => {
            // The drawing callback uses the export-specific particle system
            drawFrame({ ...base, cues, settings, particleSystem: exportParticleSystem, volumeDataForFrames }, frame);
        },
        { libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' }
    );
    
    await renderer.start();

    for (let i = 0; i <= totalFrames; i++) {
        const time = i / frameRate;
        await renderer.addFrame({ time, duration: 1 / frameRate, frameNumber: i });
        if (i > 0 && i % frameRate === 0) {
            self.postMessage({ type: 'STATUS_UPDATE', payload: { message: `Encoding frame ${i} of ${totalFrames}`, progress: (i / totalFrames) * 100 } });
        }
    }
    
    const blob = await renderer.finalize(audioBufferShim);
    self.postMessage({ type: 'VIDEO_COMPLETE', payload: { blob, fileName: `BH_video_${new Date().getTime()}.mp4` } });
}

// --- CORE DRAWING LOGIC (USED BY EXPORT) ---
function drawFrame({ ctx, canvas, cues, settings, particleSystem, volumeDataForFrames }, framePayload) {
    const { time, frameNumber } = framePayload;
    const { width, height } = canvas;
    const currentVolume = volumeDataForFrames[frameNumber] || 0.01;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    particleSystem.updateAndDraw(ctx, currentVolume);
    drawWaveform(ctx, time, width, height, settings, currentVolume);
    
    const currentCue = cues.find(cue => time >= cue.start && time < cue.end);
    if (currentCue) {
        lastActiveCue = currentCue;
    }
    
    if (lastActiveCue) {
        const boxSize = width * 0.9;
        const { boxColor, boxOpacity, font } = settings;
        const r = parseInt(boxColor.substr(1, 2), 16), g = parseInt(boxColor.substr(3, 2), 16), b = parseInt(boxColor.substr(5, 2), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${boxOpacity})`;
        ctx.fillRect((width - boxSize) / 2, (height - boxSize) / 2, boxSize, boxSize);
        wrapText(ctx, lastActiveCue.text, width / 2, height / 2, boxSize, boxSize, font, height / 720);
    }
}


// --- ALL VISUAL & HELPER FUNCTIONS (CLEAN, NON-MINIFIED) ---

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

function drawWaveform(ctx, time, width, height, settings, volume) {
    const { waveformHeight, waveformThickness } = settings;
    if (waveformHeight <= 0) return;
    const maxAmplitude = height * (waveformHeight / 100);
    const amplitude = maxAmplitude * (volume ** 1.5);
    const undulation = Math.sin(time * 0.7) * (height * 0.015);
    const baseY = height * 0.85 + undulation;
    const createPath = () => {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 15) {
            const mainWave = Math.sin(x * 0.01 + time * 4) * 0.5;
            const detailWave = Math.sin(x * 0.03 + time * 9) * 0.3;
            const staticWave = Math.sin(x * 0.1 + time * 20) * 0.2;
            const yOffset = (mainWave + detailWave + staticWave) * amplitude;
            const finalY = baseY + yOffset;
            x === 0 ? ctx.moveTo(x, finalY) : ctx.lineTo(x, finalY);
        }
    };
    const colorIntensity = 200 + Math.floor(volume * 55);
    const glowColor = `rgba(${colorIntensity - 50}, ${colorIntensity - 20}, 255, ${0.3 * volume})`;
    const mainColor = `rgba(${colorIntensity}, ${colorIntensity}, 255, ${0.6 * volume + 0.2})`;
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = waveformThickness * 3;
    createPath();
    ctx.stroke();
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = waveformThickness;
    createPath();
    ctx.stroke();
}

class ParticleSystem {
    constructor(settings, resolution) {
        this.settings = settings;
        this.width = resolution.width;
        this.height = resolution.height;
        this.sizeScalar = Math.max(1.0, this.height / 720);
        this.particles = Array.from({ length: settings.density || 0 }, () => this.createParticle({}));
    }
    createParticle(p = {}, options = {}) {
        const { isSubParticle = false, x, y } = options;
        p.x = x !== undefined ? x : Math.random() * this.width;
        p.y = y !== undefined ? y : this.height + Math.random() * 20;
        if (isSubParticle) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.life = 60;
        } else {
            p.vx = (Math.random() - 0.5) * 2;
            p.vy = -(Math.random() * 2.0 + 1.5);
            p.life = Infinity;
        }
        const baseSize = Math.max(5, (this.settings.baseSize || 20) + (Math.random() - 0.5) * (this.settings.variation || 15));
        p.size = baseSize * this.sizeScalar;
        if (isSubParticle) p.size *= 0.6;
        p.char = this.settings.chars[Math.floor(Math.random() * this.settings.chars.length)];
        p.hue = Math.random() * 360;
        p.opacity = 0.6 + Math.random() * 0.4;
        return p;
    }
    updateAndDraw(ctx, volume) {
        const earthquakeAmount = (volume ** 2) * 70;
        const explosionChance = 0.002 + (volume * 0.02);
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (p.life !== Infinity) p.life--;
            if (p.life <= 0) { this.particles.splice(i, 1); continue; }
            if (p.life === Infinity && Math.random() < explosionChance) {
                for (let j = 0; j < 7; j++) this.particles.push(this.createParticle({}, { isSubParticle: true, x: p.x, y: p.y }));
                this.createParticle(p);
                continue;
            }
            p.x += p.vx;
            p.y += p.vy;
            if (p.life === Infinity && p.y < -p.size) this.createParticle(p);
            const jiggleX = (Math.random() - 0.5) * earthquakeAmount;
            const jiggleY = (Math.random() - 0.5) * earthquakeAmount;
            const opacity = (p.life < 30) ? p.opacity * (p.life / 30) : p.opacity;
            ctx.save();
            ctx.translate(p.x + jiggleX, p.y + jiggleY);
            ctx.rotate((p.x + p.y) * 0.02);
            ctx.font = `${p.size}px ${EMOJI_FALLBACK_FONT}`;
            ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${opacity})`;
            ctx.fillText(p.char, 0, 0);
            ctx.restore();
        }
        this.drawLightning(ctx);
    }
    drawLightning(ctx) {
        const checks = 3;
        for (let i = 0; i < checks; i++) {
            const p1 = this.particles[Math.floor(Math.random() * this.particles.length)];
            const p2 = this.particles[Math.floor(Math.random() * this.particles.length)];
            if (p1 && p2 && p1 !== p2 && Math.hypot(p1.x - p2.x, p1.y - p2.y) < this.width * 0.35) {
                const createPath = () => {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    for (let j = 1; j <= 3; j++) ctx.lineTo(p1.x + (p2.x - p1.x) * (j / 4) + (Math.random() - 0.5) * 25, p1.y + (p2.y - p1.y) * (j / 4) + (Math.random() - 0.5) * 25);
                    ctx.lineTo(p2.x, p2.y);
                };
                ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
                ctx.lineWidth = 3;
                createPath();
                ctx.stroke();
                ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
                ctx.lineWidth = 1;
                createPath();
                ctx.stroke();
            }
        }
    }
}

function getWrappedLines(ctx, text, maxWidth) {
    const lines = text.split("\n");
    let allLines = [];
    lines.forEach(line => {
        let currentLine = '';
        let words = line.split(' ');
        for (let i = 0; i < words.length; i++) {
            let testLine = currentLine + (currentLine ? ' ' : '') + words[i];
            if (i > 0 && ctx.measureText(testLine).width > maxWidth) {
                allLines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
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