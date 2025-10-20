// B"H - video-worker.js (Final Version with Full Animation)

// --- FONT LOADING FOR WORKER ---
// The worker must load its own fonts as it doesn't share the main page's context.
const font = new FontFace(
    'Heebo',
    'url(https://fonts.gstatic.com/s/heebo/v22/NGSpv5_NC0k9P_v6Z_PsTe5_TQ.woff2)', 
    { style: 'normal', weight: '700' }
);

// This promise ensures we don't start rendering until the font is ready.
const fontLoaded = font.load().then((loadedFont) => {
    self.fonts.add(loadedFont);
    console.log('Worker font loaded.');
}).catch(e => console.error('Worker font failed to load:', e));


// --- IMPORT MEDIA BUNNY ---
importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');;

let renderer;
let particleSystem;
let waveformData;

self.onmessage = async (e) => {
    const { cues, audioBufferShim, settings } = e.data;

    try {
        // Wait for the font promise to resolve before proceeding
        await fontLoaded;

        // --- 1. Pre-computation and Initialization ---
        particleSystem = new ParticleSystem(settings.particles, settings.resolution, settings.particleDensity);
        waveformData = analyzeAudio(audioBufferShim); // This overview is still useful

        // --- 2. Create the main payload for the drawing function ---
        const drawPayload = { cues, settings, particleSystem, waveformData };

        // --- 3. Instantiate and start the renderer ---
        renderer = new MediaBunnyBase(
            { resolution: settings.resolution, outputFormat: { quality: 0.8 } },
            (basePayload, framePayload) => drawFrame({ ...basePayload, ...drawPayload }, framePayload),
            { libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' }
        );
        await renderer.start();

        // --- 4. The Render Loop ---
        const frameRate = 30;
        const totalDuration = (settings.maxDuration > 0 && settings.maxDuration < audioBufferShim.duration)
            ? settings.maxDuration
            : audioBufferShim.duration;
        const totalFrames = Math.floor(totalDuration * frameRate);

        for (let i = 0; i <= totalFrames; i++) {
            const time = i / frameRate;
            const duration = 1 / frameRate;
            
            await renderer.addFrame({ time, duration });
            
            if (i % Math.floor(totalFrames / 100) === 0) {
                const progress = Math.round((i / totalFrames) * 100);
                self.postMessage({ type: 'STATUS_UPDATE', payload: { message: `Encoding frame ${i} of ${totalFrames}`, progress }});
            }
        }
        
        // --- 5. Finalize and send back the result ---
        const blob = await renderer.finalize(audioBufferShim);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const originalFileName = settings.originalFileName.split('.').slice(0, -1).join('.') || 'video';
        const finalFileName = `BH_${timestamp}_${originalFileName}.mp4`;

        self.postMessage({ type: 'VIDEO_COMPLETE', payload: { blob, fileName: finalFileName } });

    } catch (error) {
        self.postMessage({ type: 'FATAL_ERROR', payload: { message: error.message, error: error.stack } });
    }
};

// --- The Core Drawing Function (Heavily Upgraded) ---
function drawFrame({ ctx, canvas, cues, settings, particleSystem, waveformData }, framePayload) {
    const time = framePayload.time;
    const { width, height } = canvas;

    // 1. Draw Background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    // 2. Update and Draw Particles & Lightning Connections
    particleSystem.updateAndDraw(ctx, time);

    // 3. Draw DYNAMIC Waveform Animation
    drawAnimatedWaveform(ctx, waveformData, time, width, height, settings.waveformThickness);
    
    // 4. Find Active Cue
    const activeCue = cues.find(cue => time >= cue.start && time < cue.end);
    
    // 5. Draw Text Container Box
    if (activeCue) {
        const { boxColor, boxOpacity } = settings.font;
        const r = parseInt(boxColor.substr(1, 2), 16);
        const g = parseInt(boxColor.substr(3, 2), 16);
        const b = parseInt(boxColor.substr(5, 2), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${boxOpacity})`;
        
        const boxWidth = width * 0.9;
        const boxPadding = height * 0.05; // Make padding relative
        const tempTextHeight = measureWrappedTextHeight(ctx, activeCue.text, settings.font.size, width * 0.85);
        const boxHeight = tempTextHeight + (boxPadding * 2);
        
        ctx.fillRect((width - boxWidth) / 2, (height - boxHeight) / 2, boxWidth, boxHeight);
    }
    
    // 6. Draw Text with Wrapping, Border, and Shadow
    if (activeCue) {
        const { align, size, shadowColor, shadowBlur } = settings.font;
        ctx.font = `bold ${size}px Heebo`;
        ctx.textAlign = align;
        
        const x = align === 'left' ? width * 0.1 : (align === 'right' ? width * 0.9 : width / 2);
        const y = height / 2;
        const maxWidth = width * 0.85;

        // Apply Shadow
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // The wrapText function handles drawing with border and fill
        wrapText(ctx, activeCue.text, x, y, maxWidth, settings.font);

        // Reset shadow for next frame's components
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }
}

// --- Text Measurement and Wrapping ---
function getWrappedLines(ctx, text, maxWidth) {
    const lines = text.split('\n');
    let allWrappedLines = [];
    lines.forEach(line => {
        let words = line.split(' ');
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

function measureWrappedTextHeight(ctx, text, fontSize, maxWidth) {
    const originalFont = ctx.font;
    ctx.font = `bold ${fontSize}px Heebo`;
    const lines = getWrappedLines(ctx, text, maxWidth);
    ctx.font = originalFont;
    return lines.length * (fontSize * 1.4);
}

function wrapText(ctx, text, x, y, maxWidth, fontSettings) {
    const lines = getWrappedLines(ctx, text, maxWidth);
    const lineHeight = fontSettings.size * 1.4;
    const startY = y - ((lines.length - 1) * lineHeight) / 2 + (fontSettings.size * 0.3);

    lines.forEach((line, i) => {
        const currentY = startY + (i * lineHeight);
        if (fontSettings.borderWidth > 0) {
            ctx.strokeStyle = fontSettings.borderColor;
            ctx.lineWidth = fontSettings.borderWidth * 2;
            ctx.strokeText(line, x, currentY);
        }
        ctx.fillStyle = fontSettings.color;
        ctx.fillText(line, x, currentY);
    });
}

// --- DYNAMIC WAVEFORM ANIMATION ---
function drawAnimatedWaveform(ctx, waveform, time, width, height, thickness) {
    const samplesPerPixel = Math.floor(waveform.length / width);
    const audioProgress = (time / 20) % 1; // Slow scroll over 20 seconds
    const audioIndexOffset = Math.floor(audioProgress * waveform.length);
    
    ctx.beginPath();
    ctx.moveTo(0, height);

    for (let x = 0; x < width; x++) {
        const index = (audioIndexOffset + x) % waveform.length;
        const staticAmp = waveform[index] || 0;
        
        // Create a dynamic pulse using a sine wave based on time
        const pulse = 0.5 + Math.sin(time * 10 + x * 0.1) * 0.5; // Fast pulse
        const dynamicAmp = staticAmp * (0.5 + pulse * 1.5); // Apply pulse to static amplitude
        
        const y = height - (dynamicAmp * height * 0.4); // Draw from the bottom up
        ctx.lineTo(x, y);
    }
    
    ctx.strokeStyle = 'rgba(200, 225, 255, 0.5)';
    ctx.lineWidth = thickness;
    ctx.shadowColor = 'rgba(150, 200, 255, 1)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

// --- Audio Analysis (Unchanged) ---
function analyzeAudio(audioBufferShim) {
    const data = audioBufferShim.channels[0];
    if (!data) return [];
    const sampleSize = 256;
    const simplified = [];
    for (let i = 0; i < data.length; i += sampleSize) {
        let rms = 0;
        for (let j = 0; j < sampleSize; j++) {
            rms += Math.pow(data[i + j], 2);
        }
        simplified.push(Math.sqrt(rms / sampleSize));
    }
    return simplified;
}

// --- Upgraded Particle System ---
class ParticleSystem {
    constructor(chars, resolution, density) {
        this.particles = [];
        this.chars = [...chars];
        this.width = resolution.width;
        this.height = resolution.height;
        this.count = density;

        for (let i = 0; i < this.count; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle(p) {
        const particle = p || {};
        particle.x = Math.random() * this.width;
        particle.y = this.height + 20; // Start from bottom
        particle.vx = (Math.random() - 0.5) * 1;
        particle.vy = -1 - Math.random() * 2; // Always move up
        particle.char = this.chars[Math.floor(Math.random() * this.chars.length)];
        particle.size = 10 + Math.random() * 20;
        particle.opacity = 0.1 + Math.random() * 0.4;
        return particle;
    }

    updateAndDraw(ctx, time) {
        ctx.fillStyle = 'white';
        
        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;

            // Reset particle if it goes off the top of the screen
            if (p.y < -20) this.createParticle(p);
            
            ctx.globalAlpha = p.opacity;
            ctx.font = `${p.size}px Heebo`;
            ctx.fillText(p.char, p.x, p.y);
        }
        
        this.drawConnections(ctx, time);
        ctx.globalAlpha = 1.0;
    }

    drawConnections(ctx, time) {
        // Only draw connections intermittently for a flashing effect
        if (Math.sin(time * 5) < 0) return;

        const connectCount = Math.floor(this.count / 20);
        ctx.strokeStyle = 'rgba(200, 225, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 5;

        for (let i = 0; i < connectCount; i++) {
            const p1 = this.particles[Math.floor(Math.random() * this.count)];
            const p2 = this.particles[Math.floor(Math.random() * this.count)];
            
            const distance = Math.hypot(p1.x - p2.x, p1.y - p2.y);

            if (distance < 250) { // Only connect if they are close
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
        ctx.shadowBlur = 0;
    }
}