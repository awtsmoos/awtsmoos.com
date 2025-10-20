// B"H - video-worker.js (Complete, Robust Rewrite - Final Version)

// --- FONT SETUP ---
const HEBREW_FONT = 'NotoSansHebrew';
const EMOJI_FONT = 'NotoColorEmoji';
const FALLBACK_FONT = 'sans-serif';

let isHebrewFontLoaded = false;
let isEmojiFontLoaded = false;

// Attempt to load fonts from a reliable CDN, but do not crash if it fails.
const hebrewFontLoader = new FontFace(HEBREW_FONT, 'url(https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-hebrew@5.0.18/files/noto-sans-hebrew-hebrew-700-normal.woff2)');
const emojiFontLoader = new FontFace(EMOJI_FONT, 'url(https://cdn.jsdelivr.net/npm/@fontsource/noto-color-emoji@5.0.3/files/noto-color-emoji-emoji-400-normal.woff2)');

const fontsReady = Promise.allSettled([hebrewFontLoader.load(), emojiFontLoader.load()])
    .then(results => {
        if (results[0].status === 'fulfilled') { self.fonts.add(results[0].value); isHebrewFontLoaded = true; }
        if (results[1].status === 'fulfilled') { self.fonts.add(results[1].value); isEmojiFontLoaded = true; }
    });

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

let renderer;

// --- ROBUST AUDIO ANALYSIS ---
// This function runs ONCE. It safely processes the audio shim and creates a simple
// array of volume levels, one for each frame of the video. It is guaranteed to not produce NaN.
function preAnalyzeAudio(audioBufferShim, totalFrames) {
    const channelData = audioBufferShim.channels[0];
    // If audio data is missing, return an array of minimum volume to prevent crashes.
    if (!channelData || channelData.length === 0) {
        return new Array(totalFrames).fill(0.01);
    }

    const volumeLevels = [];
    const samplesPerFrame = Math.floor(channelData.length / totalFrames);

    for (let i = 0; i < totalFrames; i++) {
        let rms = 0;
        const start = i * samplesPerFrame;
        for (let j = 0; j < samplesPerFrame; j++) {
            // GUARANTEE SAFE VALUE: Default to 0 if a sample is invalid.
            const sample = channelData[start + j] || 0;
            rms += sample * sample;
        }
        const volume = Math.sqrt(rms / samplesPerFrame);
        // GUARANTEE SAFE VALUE: Ensure volume is never zero or NaN.
        volumeLevels.push(isNaN(volume) ? 0.01 : Math.max(0.01, volume));
    }
    return volumeLevels;
}

// --- MAIN ENTRY POINT ---
self.onmessage = async ({ data: { cues, audioBufferShim, settings } }) => {
    try {
        await fontsReady;

        const frameRate = 30;
        const totalDuration = (settings.maxDuration > 0 && settings.maxDuration < audioBufferShim.duration) ? settings.maxDuration : audioBufferShim.duration;
        const totalFrames = Math.floor(totalDuration * frameRate);
        
        // Pre-calculate all audio volume data before rendering begins.
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
            if (i > 0 && i % 30 === 0) {
                self.postMessage({ type: 'STATUS_UPDATE', payload: { message: `Encoding frame ${i} of ${totalFrames}`, progress: (i / totalFrames) * 100 } });
            }
        }
        
        // The exporter now receives the original, unmodified shim it requires.
        const blob = await renderer.finalize(audioBufferShim);
        const fileName = `BH_video_${new Date().getTime()}.mp4`;
        self.postMessage({ type: 'VIDEO_COMPLETE', payload: { blob, fileName } });

    } catch (error) {
        self.postMessage({ type: 'FATAL_ERROR', payload: { message: error.message, error: error.stack } });
    }
};

// --- CORE DRAWING ---
function drawFrame({ ctx, canvas, cues, settings, particleSystem, volumeDataForFrames }, framePayload) {
    const { time, frameNumber } = framePayload;
    const { width, height } = canvas;
    
    // Get the pre-calculated, guaranteed-safe volume for the current frame.
    const currentVolume = volumeDataForFrames[frameNumber] || 0.01;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    particleSystem.updateAndDraw(ctx, currentVolume);
    drawWaveform(ctx, time, width, height, settings, currentVolume);
    
    const activeCue = cues.find(cue => time >= cue.start && time < cue.end);
    if (activeCue) {
        const boxSize = width * 0.9;
        const { boxColor, boxOpacity } = settings.font;
        const r = parseInt(boxColor.substr(1, 2), 16), g = parseInt(boxColor.substr(3, 2), 16), b = parseInt(boxColor.substr(5, 2), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${boxOpacity})`;
        ctx.fillRect((width - boxSize) / 2, (height - boxSize) / 2, boxSize, boxSize);
        wrapText(ctx, activeCue.text, width / 2, height / 2, boxSize, boxSize, settings.font, height / 720);
    }
}

// --- ROBUST WAVEFORM ---
function drawWaveform(ctx, time, width, height, settings, volume) {
    const { waveformHeight, waveformThickness } = settings;
    if (waveformHeight <= 0) return;

    ctx.strokeStyle = `rgba(200, 225, 255, ${0.4 + volume * 0.6})`;
    ctx.lineWidth = waveformThickness;
    ctx.beginPath();

    const baseY = height * 0.8;
    const maxAmplitude = height * (waveformHeight / 100) * 0.5;
    const amplitude = maxAmplitude * (0.1 + volume * 0.9); // 10% base height + 90% driven by volume

    for (let x = 0; x <= width; x += 10) {
        const yOffset = Math.sin((x * 0.02) + (time * 8));
        const finalY = baseY + yOffset * amplitude;
        x === 0 ? ctx.moveTo(x, finalY) : ctx.lineTo(x, finalY);
    }
    ctx.stroke();
}

// --- ROBUST PARTICLE SYSTEM ---
class ParticleSystem {
    constructor(settings, resolution) {
        this.settings = settings;
        this.width = resolution.width;
        this.height = resolution.height;
        this.particles = Array.from({ length: this.settings.density }, () => this.createParticle(null, 0.1));
    }

    createParticle(p = {}, volume) {
        p.x = Math.random() * this.width;
        p.y = this.height + 20;
        const speed = 1 + volume * 15;
        p.vx = (Math.random() - 0.5) * 2;
        p.vy = -(Math.random() * 1.5 + 0.5) * speed;
        p.char = this.settings.chars[Math.floor(Math.random() * this.settings.chars.length)];
        p.size = Math.max(5, this.settings.baseSize + (Math.random() - 0.5) * this.settings.variation);
        p.hue = Math.random() * 360;
        p.opacity = 0.5 + Math.random() * 0.5;
        return p;
    }

    updateAndDraw(ctx, volume) {
        const fontFamily = isEmojiFontLoaded ? EMOJI_FONT : FALLBACK_FONT;
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -p.size) this.createParticle(p, volume);
            
            ctx.font = `${p.size}px ${fontFamily}`;
            ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${p.opacity})`;
            ctx.fillText(p.char, p.x, p.y);
        });
    }
}

// --- ROBUST TEXT HELPERS ---
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
    const fontFamily = isHebrewFontLoaded ? HEBREW_FONT : FALLBACK_FONT;
    let scaledFontSize = fontSettings.size * scaleFactor;

    while (scaledFontSize > 5) {
        ctx.font = `bold ${scaledFontSize}px ${fontFamily}`;
        const lines = getWrappedLines(ctx, text, maxWidth * 0.95);
        if ((lines.length * scaledFontSize * 1.4) < maxHeight * 0.95) break;
        scaledFontSize -= 1;
    }

    ctx.font = `bold ${scaledFontSize}px ${fontFamily}`;
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