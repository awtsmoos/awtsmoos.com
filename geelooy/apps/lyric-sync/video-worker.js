// B"H - video-worker.js (With Font, Box, and Waveform Fixes)

// --- FONT LOADING ---
// Load multiple fonts: one for Hebrew text, one for Emoji particles.
const hebrewFont = new FontFace('NotoSansHebrew', 'url(https://fonts.gstatic.com/s/notosanshebrew/v34/or3_--_K6NKsWAIzkPyjDaPkdxscGmY26oFY26o.woff2)', { style: 'normal', weight: '700' });
const emojiFont = new FontFace('NotoColorEmoji', 'url(https://fonts.gstatic.com/s/notocoloremoji/v26/Yq6P-KqIXoFpbS3glT-xWHyD6vuzWFnP_g.woff2)', { style: 'normal', weight: '400' });

// Wait for all fonts to be loaded before starting any work.
const fontsLoaded = Promise.all([hebrewFont.load(), emojiFont.load()])
    .then(loadedFonts => {
        loadedFonts.forEach(f => self.fonts.add(f));
        console.log('Worker fonts loaded successfully.');
    }).catch(e => console.error('Worker font loading failed:', e));

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

let renderer;

self.onmessage = async ({ data: { cues, audioBufferShim, settings } }) => {
    try {
        await fontsLoaded; // Ensure fonts are ready before rendering.

        const waveformData = analyzeAudio(audioBufferShim);
        const particleSystem = new ParticleSystem(settings.particles, settings.resolution);
        const drawPayload = { cues, settings, particleSystem, waveformData };

        renderer = new MediaBunnyBase({ resolution: settings.resolution, outputFormat: { quality: 0.8 } },
            (base, frame) => drawFrame({ ...base, ...drawPayload }, frame),
            { libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' }
        );
        await renderer.start();

        const frameRate = 30;
        const totalDuration = (settings.maxDuration > 0 && settings.maxDuration < audioBufferShim.duration) ? settings.maxDuration : audioBufferShim.duration;
        const totalFrames = Math.floor(totalDuration * frameRate);

        for (let i = 0; i <= totalFrames; i++) {
            const time = i / frameRate;
            await renderer.addFrame({ time, duration: 1 / frameRate });
            if (i > 0 && i % Math.floor(totalFrames / 100) === 0) {
                self.postMessage({ type: 'STATUS_UPDATE', payload: { message: `Encoding frame ${i} of ${totalFrames}`, progress: (i / totalFrames) * 100 } });
            }
        }
        
        const blob = await renderer.finalize(audioBufferShim);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `BH_${timestamp}_${settings.originalFileName.split('.').slice(0, -1).join('.') || 'video'}.mp4`;
        self.postMessage({ type: 'VIDEO_COMPLETE', payload: { blob, fileName } });

    } catch (error) {
        self.postMessage({ type: 'FATAL_ERROR', payload: { message: error.message, error: error.stack } });
    }
};

// --- CORE DRAWING ---
function drawFrame({ ctx, canvas, cues, settings, particleSystem, waveformData }, framePayload) {
    const time = framePayload.time;
    const { width, height } = canvas;
    const scaleFactor = height / 720; // Baseline for scaling UI elements

    // Background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    // Particles and Waveform
    particleSystem.updateAndDraw(ctx);
    drawAnimatedWaveform(ctx, waveformData, time, width, height, settings.waveformThickness, settings.waveformHeight);
    
    // Text and Box
    const activeCue = cues.find(cue => time >= cue.start && time < cue.end);
    if (activeCue) {
        // --- BOX LOGIC ---
        // Define a fixed square box in the center. Size is 90% of the canvas width.
        const boxSize = width * 0.9;
        const boxX = (width - boxSize) / 2;
        const boxY = (height - boxSize) / 2;

        const { boxColor, boxOpacity } = settings.font;
        const r = parseInt(boxColor.substr(1, 2), 16), g = parseInt(boxColor.substr(3, 2), 16), b = parseInt(boxColor.substr(5, 2), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${boxOpacity})`;
        ctx.fillRect(boxX, boxY, boxSize, boxSize);

        // --- TEXT LOGIC ---
        // The text will be drawn inside the box we just created.
        // The wrapText function will automatically adjust font size to fit.
        wrapText(ctx, activeCue.text, width / 2, height / 2, boxSize, boxSize, settings.font, scaleFactor);
    }
}

// --- DYNAMIC WAVEFORM ANIMATION ---
function drawAnimatedWaveform(ctx, waveform, time, width, height, thickness, heightMultiplier) {
    if (heightMultiplier <= 0) return;

    const samplesPerSecond = waveform.data.length / (waveform.duration || 1);
    const currentIndex = Math.floor(time * samplesPerSecond);
    const currentAmp = waveform.data[currentIndex] || 0;
    
    // --- WAVEFORM FIX ---
    // Add a small base amplitude (0.05) to ensure the wave is always visible,
    // even during silent parts of the audio.
    const effectiveAmp = 0.05 + (currentAmp * 0.95);

    ctx.beginPath();
    const step = 5; // Performance optimization
    for (let x = 0; x <= width + step; x += step) {
        const primaryWave = Math.sin((x / 50) + time * 15);
        const y = height - (primaryWave * height * (heightMultiplier / 100) * effectiveAmp);
        ctx.lineTo(x, y);
    }
    
    ctx.strokeStyle = `rgba(200, 225, 255, ${0.3 + currentAmp * 0.7})`;
    ctx.lineWidth = thickness;
    ctx.stroke();
}

// --- AUDIO ANALYSIS ---
function analyzeAudio(audioBufferShim) {
    const data = audioBufferShim.channels[0];
    if (!data) return { data: [], duration: 0 };
    const sampleSize = 441;
    const simplified = [];
    for (let i = 0; i < data.length; i += sampleSize) {
        let rms = 0;
        for (let j = 0; j < sampleSize; j++) rms += Math.pow(data[i + j] || 0, 2);
        simplified.push(Math.sqrt(rms / sampleSize));
    }
    return { data: simplified, duration: audioBufferShim.duration };
}

// --- PARTICLE SYSTEM ---
class ParticleSystem {
    constructor(particleSettings, resolution) {
        this.settings = particleSettings;
        this.width = resolution.width;
        this.height = resolution.height;
        this.particles = Array.from({ length: this.settings.density }, () => this.createParticle());
    }

    createParticle(p = {}) {
        const baseSize = this.settings.baseSize;
        const variation = this.settings.variation;
        p.x = Math.random() * this.width;
        p.y = this.height + Math.random() * 50;
        p.vx = (Math.random() - 0.5) * 1.5;
        p.vy = (-1 - Math.random()) * 1.5;
        p.char = this.settings.chars[Math.floor(Math.random() * this.settings.chars.length)];
        p.size = Math.max(5, baseSize - (variation / 2) + Math.random() * variation);
        p.opacity = 0.2 + Math.random() * 0.5;
        return p;
    }

    updateAndDraw(ctx) {
        ctx.fillStyle = 'white';
        // --- FONT FIX ---
        // Explicitly set the font to Noto Color Emoji for the particles.
        ctx.font = `${this.settings.baseSize}px NotoColorEmoji`;

        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -p.size || p.x < -p.size || p.x > this.width + p.size) this.createParticle(p);
            
            ctx.globalAlpha = p.opacity;
            ctx.font = `${p.size}px NotoColorEmoji`; // Set size per particle
            ctx.fillText(p.char, p.x, p.y);
        }
        this.drawConnections(ctx);
        ctx.globalAlpha = 1.0;
    }

    drawConnections(ctx) {
        const checksPerFrame = Math.min(15, Math.floor(this.particles.length / 10));
        if (checksPerFrame < 1) return;
        ctx.strokeStyle = 'rgba(200, 225, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < checksPerFrame; i++) {
            const p1 = this.particles[Math.random() * this.particles.length | 0];
            const p2 = this.particles[Math.random() * this.particles.length | 0];
            if (Math.hypot(p1.x - p2.x, p1.y - p2.y) < 250) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }
}

// --- TEXT WRAPPING & FITTING HELPERS ---
function getWrappedLines(ctx, text, maxWidth) {
    const lines = text.split("\n");
    let allWrappedLines = [];
    lines.forEach(line => {
        let words = line.split(" ");
        if (words.length === 0) return;
        let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
            let word = words[i];
            let testWidth = ctx.measureText(currentLine + " " + word).width;
            if (testWidth < maxWidth) {
                currentLine += " " + word;
            } else {
                allWrappedLines.push(currentLine);
                currentLine = word;
            }
        }
        allWrappedLines.push(currentLine);
    });
    return allWrappedLines;
}

function wrapText(ctx, text, x, y, maxWidth, maxHeight, fontSettings, scaleFactor) {
    let scaledFontSize = fontSettings.size * scaleFactor;

    // --- TEXT FITTING LOGIC ---
    // This loop reduces the font size until the text block fits within the maxHeight.
    while (scaledFontSize > 5) { // Don't allow font to become too small
        ctx.font = `bold ${scaledFontSize}px NotoSansHebrew`; // Use Hebrew font
        const lines = getWrappedLines(ctx, text, maxWidth * 0.95); // Use 95% of box width for padding
        const lineHeight = scaledFontSize * 1.4;
        const totalHeight = lines.length * lineHeight;

        if (totalHeight <= maxHeight * 0.95) { // Check against 95% of box height
            break; // Font size is good, exit loop
        }
        scaledFontSize -= 1; // Text is too tall, shrink font and try again
    }

    // --- DRAW THE FITTED TEXT ---
    const scaledBorderWidth = fontSettings.borderWidth * scaleFactor;
    ctx.font = `bold ${scaledFontSize}px NotoSansHebrew`;
    ctx.textAlign = fontSettings.align;

    const lines = getWrappedLines(ctx, text, maxWidth * 0.95);
    const lineHeight = scaledFontSize * 1.4;
    const startY = y - ((lines.length - 1) * lineHeight) / 2 + (scaledFontSize * 0.3);

    lines.forEach((line, i) => {
        const currentY = startY + (i * lineHeight);
        if (scaledBorderWidth > 0) {
            ctx.strokeStyle = fontSettings.borderColor;
            ctx.lineWidth = scaledBorderWidth * 2;
            ctx.strokeText(line, x, currentY);
        }
        ctx.fillStyle = fontSettings.color;
        ctx.fillText(line, x, currentY);
    });
}