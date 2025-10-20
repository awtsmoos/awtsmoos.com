// B"H - video-worker.js (Simplified, No External Fonts, Bug Fixed)

// --- FONT SETUP (SIMPLIFIED) ---
// No external font loading. We will rely on system fonts.
// This is more robust and avoids all network errors.
const HEBREW_FONT_STACK = "'Noto Sans Hebrew', 'Heebo', sans-serif";
const EMOJI_FALLBACK_FONT = 'sans-serif';

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

let renderer;

// --- ROBUST AUDIO ANALYSIS ---
// This runs once and creates a guaranteed-safe array of volume levels for each frame.
function preAnalyzeAudio(audioBufferShim, totalFrames) {
    const channelData = audioBufferShim.channels[0];
    if (!channelData || channelData.length === 0) {
        return new Array(totalFrames).fill(0.01);
    }
    const volumeLevels = [];
    const samplesPerFrame = Math.floor(channelData.length / totalFrames);
    for (let i = 0; i < totalFrames; i++) {
        let rms = 0;
        const start = i * samplesPerFrame;
        for (let j = 0; j < samplesPerFrame; j++) {
            const sample = channelData[start + j] || 0;
            rms += sample * sample;
        }
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

        renderer = new MediaBunnyBase({ resolution: settings.resolution, outputFormat: { quality: 1 } },
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

// In video-worker.js, REPLACE the existing drawWaveform function with this new one.

function drawWaveform(ctx, time, width, height, settings, volume) {
    const { waveformHeight, waveformThickness } = settings;
    if (waveformHeight <= 0) return;

    ctx.strokeStyle = `rgba(200, 225, 255, ${0.5 + volume * 0.5})`;
    ctx.lineWidth = waveformThickness;
    ctx.beginPath();

    const baseY = height * 0.85; // The centerline of the waveform
    const maxAmplitude = height * (waveformHeight / 100);

    // --- NEW REACTION LOGIC ---
    // The amplitude is now based on the SQUARE of the volume. This creates a much
    // more dramatic effect, where the wave truly "bursts" from a flat line on loud sounds.
    const amplitude = maxAmplitude * (volume ** 2);

    // --- LOW-RESOLUTION CUSTOM SHAPE ---
    // We only calculate a few points and connect them to create a jagged, random look.
    const points = 15;
    const segmentWidth = width / points;

    for (let i = 0; i <= points; i++) {
        const x = i * segmentWidth;
        // This math creates a pseudo-random but smoothly animating jagged pattern.
        const randomFactor = Math.sin(i * 2.5 + time * 4) * 0.7 + Math.cos(i * 1.5 + time * 2) * 0.3;
        const finalY = baseY + randomFactor * amplitude;
        
        i === 0 ? ctx.moveTo(x, finalY) : ctx.lineTo(x, finalY);
    }
    ctx.stroke();
}


// In video-worker.js, REPLACE the entire ParticleSystem class with this new one.

class ParticleSystem {
    constructor(settings, resolution) {
        this.settings = settings;
        this.width = resolution.width;
        this.height = resolution.height;
        this.particles = Array.from({ length: this.settings.density }, () => this.createParticle({}));
    }

    createParticle(p = {}) {
        p.x = Math.random() * this.width;
        p.y = this.height + 20;
        // Base movement is now a simple, steady upward float.
        p.vx = (Math.random() - 0.5) * 1.5;
        p.vy = -(Math.random() * 1.0 + 0.5); // Slower, more gentle base speed
        p.char = this.settings.chars[Math.floor(Math.random() * this.settings.chars.length)];
        p.size = Math.max(5, this.settings.baseSize + (Math.random() - 0.5) * this.settings.variation);
        p.hue = Math.random() * 360;
        p.opacity = 0.5 + Math.random() * 0.5;
        return p;
    }

    updateAndDraw(ctx, volume) {
        // --- NEW "EARTHQUAKE" EFFECT ---
        // The strength of the jiggle is based on the square of the volume, for drastic reactions.
        // The multiplier (e.g., 40) controls the maximum intensity of the earthquake.
        const earthquakeAmount = (volume ** 2) * 40;

        this.particles.forEach(p => {
            // 1. Update the particle's "true" position for its smooth base movement.
            p.x += p.vx;
            p.y += p.vy;

            // 2. If it goes off-screen, reset it.
            if (p.y < -p.size) this.createParticle(p);

            // 3. Calculate a random jiggle offset based on the earthquake strength.
            const jiggleX = (Math.random() - 0.5) * earthquakeAmount;
            const jiggleY = (Math.random() - 0.5) * earthquakeAmount;

            // 4. Draw the particle at its true position PLUS the temporary jiggle.
            // This creates the wobble/earthquake effect without ruining the smooth upward drift.
            ctx.font = `${p.size}px ${EMOJI_FALLBACK_FONT}`;
            ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${p.opacity})`;
            ctx.fillText(p.char, p.x + jiggleX, p.y + jiggleY);
        });
    }
}
function wrapText(ctx, text, x, y, maxWidth, maxHeight, fontSettings, scaleFactor) {
    let scaledFontSize = fontSettings.size * scaleFactor;
    while (scaledFontSize > 5) {
        // Use a font stack. The browser will try preferred Hebrew fonts first, then fall back gracefully.
        ctx.font = `bold ${scaledFontSize}px ${HEBREW_FONT_STACK}`;
        ctx.direction = 'ltr'; 
        const lines = getWrappedLines(ctx, text, maxWidth * 0.95);
        if ((lines.length * scaledFontSize * 1.4) < maxHeight * 0.95) break;
        scaledFontSize -= 1;
    }
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