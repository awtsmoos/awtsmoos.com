//B"H

// B"H - video-worker.js

// Import the MediaBunny helper library
// IMPORTANT: The path must be correct relative to your index.html
importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

let renderer;
let particleSystem;
let waveformData;

// Main entry point for the worker
self.onmessage = async (e) => {
    const { cues, audioBufferShim, settings } = e.data;

    try {
        // --- 1. Pre-computation and Initialization ---
        particleSystem = new ParticleSystem(settings.particles, settings.resolution);
        waveformData = analyzeAudio(audioBufferShim);

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

        for (let i = 0; i < totalFrames; i++) {
            const time = i / frameRate;
            await renderer.addFrame({ time, duration: 1 / frameRate });
            
            // Post progress update every 1% of frames
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

// --- The Core Drawing Function ---
// This is called for EVERY frame of the video.
// --- THIS FUNCTION SIGNATURE IS THE FIX ---
// I'm now destructuring all properties from the first argument directly.
function drawFrame({ ctx, canvas, cues, settings, particleSystem, waveformData }, framePayload) {
    const time = framePayload.time;
    const { width, height } = canvas;

    // 1. Draw Background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    // 2. Update and Draw Particles & Connections
    particleSystem.updateAndDraw(ctx);

    // 3. Draw Animated Waveform
    drawLightningWaveform(ctx, waveformData, time, width, height, settings.waveformThickness);
    
    // 4. Find Active Cue
    const activeCue = cues.find(cue => time >= cue.start && time < cue.end);
    
    // 5. Draw Text Box
    if (activeCue) {
        const boxColor = settings.font.boxColor;
        const boxOpacity = settings.font.boxOpacity;
        ctx.fillStyle = `rgba(${parseInt(boxColor.substr(1, 2), 16)}, ${parseInt(boxColor.substr(3, 2), 16)}, ${parseInt(boxColor.substr(5, 2), 16)}, ${boxOpacity})`;
        // Simple centered box for now
        const boxWidth = width * 0.9;
        const boxHeight = height * 0.4;
        ctx.fillRect((width - boxWidth) / 2, (height - boxHeight) / 2, boxWidth, boxHeight);
    }
    
    // 6. Draw Text with Wrapping, Border, and Shadow
    if (activeCue) {
        ctx.font = `bold ${settings.font.size}px Heebo, Arial`;
        ctx.textAlign = settings.font.align;
        
        const x = width / 2;
        const y = height / 2;
        const maxWidth = width * 0.85; // Max width for text wrapping
        const lineHeight = settings.font.size * 1.2;

        // Apply Shadow
        ctx.shadowColor = settings.font.shadowColor;
        ctx.shadowBlur = settings.font.shadowBlur;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // The wrapText function handles drawing with border and fill
        wrapText(ctx, activeCue.text, x, y, maxWidth, lineHeight, settings.font);

        // Reset shadow for next frame's components
        ctx.shadowBlur = 0;
    }
}


function wrapText(ctx, text, x, y, maxWidth, lineHeight, fontSettings) {
    const lines = text.split('\n');
    let allWrappedLines = [];

    lines.forEach(line => {
        let words = line.split(' ');
        let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
            let word = words[i];
            let width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                allWrappedLines.push(currentLine);
                currentLine = word;
            }
        }
        allWrappedLines.push(currentLine);
    });
    
    const startY = y - ((allWrappedLines.length - 1) * lineHeight) / 2;

    allWrappedLines.forEach((line, i) => {
        const currentY = startY + (i * lineHeight);
        // Draw Border
        if (fontSettings.borderWidth > 0) {
            ctx.strokeStyle = fontSettings.borderColor;
            ctx.lineWidth = fontSettings.borderWidth * 2;
            ctx.strokeText(line, x, currentY);
        }
        // Draw Fill
        ctx.fillStyle = fontSettings.color;
        ctx.fillText(line, x, currentY);
    });
}





// --- Helper Functions and Classes for Visual Effects ---

function drawLightningWaveform(ctx, waveform, time, width, height, thickness) {
    const samplesPerPixel = Math.floor(waveform.length / width);
    const audioIndex = Math.floor(time * 44100 / (samplesPerPixel * 10)); // Approximate mapping
    
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);

    for (let x = 0; x < width; x++) {
        const index = (audioIndex + x) % waveform.length;
        const amp = waveform[index] || 0;
        const y = (height / 2) + (amp * height * 0.8);
        
        // Create jagged "lightning" effect
        const lightningJitter = (Math.random() - 0.5) * 30 * amp;
        ctx.lineTo(x, y + lightningJitter);
    }
    
    ctx.strokeStyle = 'rgba(200, 225, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.shadowColor = 'rgba(150, 200, 255, 1)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    
    // Reset shadow for other drawings
    ctx.shadowBlur = 0;
}

function analyzeAudio(audioBufferShim) {
    const data = audioBufferShim.channels[0]; // Use first channel
    if (!data) return [];
    
    const sampleSize = 441; // Analyze ~100 chunks per second
    const simplified = [];
    for (let i = 0; i < data.length; i += sampleSize) {
        let max = 0;
        for (let j = 0; j < sampleSize; j++) {
            if (data[i + j] > max) max = data[i + j];
        }
        simplified.push(max);
    }
    return simplified;
}

class ParticleSystem {
    constructor(chars, resolution, density) {
        this.particles = [];
        this.chars = [...chars]; // Use spread to handle emojis correctly
        this.width = resolution.width;
        this.height = resolution.height;
        this.count = density
        
        for (let i = 0; i < this.count; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle(p) {
        const particle = p || {};
        particle.x = Math.random() * this.width;
        particle.y = Math.random() * this.height;
        particle.vx = (Math.random() - 0.5) * 1;
        particle.vy = (Math.random() - 0.5) * 1;
        particle.char = this.chars[Math.floor(Math.random() * this.chars.length)];
        particle.size = 10 + Math.random() * 20;
        particle.opacity = 0.1 + Math.random() * 0.4;
        return particle;
    }

    updateAndDraw(ctx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        
        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > this.width || p.y < 0 || p.y > this.height) {
                this.createParticle(p); // Reset particle if it goes off-screen
            }
            
            ctx.globalAlpha = p.opacity;
            ctx.font = `${p.size}px Heebo`;
            ctx.fillText(p.char, p.x, p.y);
        }
        ctx.globalAlpha = 1.0; // Reset global alpha
        
        this.drawConnections(ctx)
    }
    drawConnections(ctx) {
        const connectCount = Math.floor(this.count / 20); // Connect ~5% of particles
        ctx.strokeStyle = 'rgba(200, 225, 255, 0.2)';
        ctx.lineWidth = 1;

        for (let i = 0; i < connectCount; i++) {
            const p1 = this.particles[Math.floor(Math.random() * this.count)];
            const p2 = this.particles[Math.floor(Math.random() * this.count)];
            
            const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

            if (distance < 200) { // Only connect if they are close
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }

}