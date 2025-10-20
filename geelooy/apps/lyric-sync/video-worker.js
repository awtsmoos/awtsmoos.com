// B"H - video-worker.js (Simplified Waveform & Reactive Particles)

// --- FONT LOADING ---
const hebrewFont = new FontFace('NotoSansHebrew', 'url(https://fonts.gstatic.com/s/notosanshebrew/v34/or3_--_K6NKsWAIzkPyjDaPkdxscGmY26oFY26o.woff2)', { style: 'normal', weight: '700' });
const emojiFont = new FontFace('NotoColorEmoji', 'url(https://fonts.gstatic.com/s/notocoloremoji/v26/Yq6P-KqIXoFpbS3glT-xWHyD6vuzWFnP_g.woff2)', { style: 'normal', weight: '400' });

const fontsLoaded = Promise.all([hebrewFont.load(), emojiFont.load()])
    .then(loadedFonts => {
        loadedFonts.forEach(f => self.fonts.add(f));
    }).catch(e => console.error('Worker font loading failed:', e));

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

let renderer;

self.onmessage = async ({ data: { cues, audioBufferShim, settings } }) => {
    try {
        await fontsLoaded;

        // The audio analysis now returns a simpler data structure.
        const audioAnalysis = analyzeAudio(audioBufferShim, settings.resolution.width);
        const particleSystem = new ParticleSystem(settings.particles, settings.resolution);
        
        // We pass the full analysis to the draw function.
        const drawPayload = { cues, settings, particleSystem, audioAnalysis };

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
function drawFrame({ ctx, canvas, cues, settings, particleSystem, audioAnalysis }, framePayload) {
    const time = framePayload.time;
    const { width, height } = canvas;
    
    // Get the single volume level for the current time.
    const samplesPerSecond = audioAnalysis.volumeData.length / (audioAnalysis.duration || 1);
    const currentIndex = Math.floor(time * samplesPerSecond);
    const currentVolume = audioAnalysis.volumeData[currentIndex] || 0;

    // Background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    // Update particles with the current audio volume.
    particleSystem.updateAndDraw(ctx, currentVolume);
    
    // Draw the simplified waveform.
    drawSimplifiedWaveform(ctx, audioAnalysis.wavePoints, time, width, height, settings.waveformThickness, settings.waveformHeight, currentVolume);
    
    // Text and Box
    const activeCue = cues.find(cue => time >= cue.start && time < cue.end);
    if (activeCue) {
        const boxSize = width * 0.9;
        const boxX = (width - boxSize) / 2;
        const boxY = (height - boxSize) / 2;

        const { boxColor, boxOpacity } = settings.font;
        const r = parseInt(boxColor.substr(1, 2), 16), g = parseInt(boxColor.substr(3, 2), 16), b = parseInt(boxColor.substr(5, 2), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${boxOpacity})`;
        ctx.fillRect(boxX, boxY, boxSize, boxSize);

        const scaleFactor = height / 720;
        wrapText(ctx, activeCue.text, width / 2, height / 2, boxSize, boxSize, settings.font, scaleFactor);
    }
}

// --- NEW SIMPLIFIED WAVEFORM ---
function drawSimplifiedWaveform(ctx, wavePoints, time, width, height, thickness, heightMultiplier, volume) {
    if (heightMultiplier <= 0) return;

    ctx.strokeStyle = `rgba(200, 225, 255, ${0.4 + volume * 0.6})`;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    
    // This draws a curve through our pre-calculated points. It's extremely fast.
    ctx.moveTo(wavePoints[0].x, wavePoints[0].y);
    for(let i = 0; i < wavePoints.length - 1; i++){
        const p1 = wavePoints[i];
        const p2 = wavePoints[i+1];
        const xc = (p1.x + p2.x) / 2;
        const yc = (p1.y + p2.y) / 2;
        ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);
    }
    
    // Animate the wave by slightly shifting its vertical position and height based on time and volume.
    const waveHeight = height * (heightMultiplier / 150) * (0.5 + volume);
    const verticalShift = Math.sin(time * 5) * 20 * volume;
    
    ctx.save();
    ctx.translate(0, height / 1.5 + verticalShift); // Position the wave lower on the screen
    ctx.scale(1, waveHeight); // Scale it vertically
    ctx.stroke();
    ctx.restore();
}

// --- UPDATED AUDIO ANALYSIS ---
function analyzeAudio(audioBufferShim, canvasWidth) {
    const data = audioBufferShim.channels[0];
    if (!data) return { volumeData: [], wavePoints: [], duration: 0 };
    
    // 1. Analyze for volume (used for particle reactivity)
    const volumeSampleSize = 441; // ~100 samples per second
    const volumeData = [];
    for (let i = 0; i < data.length; i += volumeSampleSize) {
        let rms = 0;
        for (let j = 0; j < volumeSampleSize; j++) rms += Math.pow(data[i + j] || 0, 2);
        volumeData.push(Math.sqrt(rms / volumeSampleSize));
    }

    // 2. Pre-calculate points for the simplified waveform
    const totalPoints = Math.min(100, canvasWidth / 10); // Max 100 points
    const wavePoints = [];
    for (let i = 0; i < totalPoints; i++) {
        const x = (i / (totalPoints - 1)) * canvasWidth;
        const y = Math.sin(x / (canvasWidth / 20)) * Math.cos(x / (canvasWidth / 35)); // A pleasing, static wave shape
        wavePoints.push({ x, y });
    }

    return { volumeData, wavePoints, duration: audioBufferShim.duration };
}

// --- UPDATED PARTICLE SYSTEM ---
// REPLACE the entire ParticleSystem class in your video-worker.js

class ParticleSystem {
    constructor(particleSettings, resolution) {
        this.settings = particleSettings;
        this.width = resolution.width;
        this.height = resolution.height;
        // This array will now hold all particles, both permanent and temporary (from explosions).
        this.particles = Array.from({ length: this.settings.density }, () => this.createParticle({ isPermanent: true }, 0.5));
    }

    // createParticle now handles both permanent particles and temporary "sub-particles".
    createParticle(p = {}, volume, options = {}) {
        const { isPermanent = false, x, y } = options;

        p.x = x !== undefined ? x : Math.random() * this.width;
        if (isPermanent) {
            p.y = this.height + Math.random() * 50; // Start permanent particles at the bottom
        } else {
            p.y = y; // Start sub-particles at the explosion point
        }

        const burstStrength = 1 + (volume * 10);
        
        if (isPermanent) {
            // Permanent particles primarily move upwards.
            p.vx = (Math.random() - 0.5) * 2;
            p.vy = (-0.5 - Math.random()) * burstStrength;
        } else {
            // Sub-particles explode outwards in a random direction.
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
        }

        // --- DANCING LOGIC SETUP ---
        // Each particle gets its own unique "dance" properties.
        p.age = 0;
        p.danceSpeed = 0.02 + Math.random() * 0.03;
        p.danceAmount = Math.random() * 2;
        
        // --- LIFESPAN LOGIC ---
        p.life = isPermanent ? Infinity : 45 + Math.random() * 30; // ~1-2 seconds for sub-particles

        p.char = this.settings.chars[Math.floor(Math.random() * this.settings.chars.length)];
        p.size = this.settings.baseSize - (this.settings.variation / 2) + Math.random() * this.settings.variation;
        if (!isPermanent) p.size *= 0.7; // Make sub-particles slightly smaller
        p.size = Math.max(4, p.size);

        p.hue = Math.random() * 360;
        p.opacity = 0.6 + Math.random() * 0.4;

        return p;
    }

    // The main update loop now handles dancing, explosions, and lifespan.
    updateAndDraw(ctx, volume) {
        // We iterate backwards so we can safely remove particles from the array as they expire.
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.age++;
            p.life--;

            // If a particle's life is over, remove it and continue to the next one.
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            // --- "DANCING" MOTION ---
            // Apply a smooth, sideways oscillation based on the particle's age.
            const danceOffset = Math.sin(p.age * p.danceSpeed) * p.danceAmount;
            p.x += p.vx + danceOffset;
            p.y += p.vy;

            // --- EXPLOSION TRIGGER ---
            // Permanent particles have a tiny chance to explode. A low value like 0.0015 is good.
            if (p.life === Infinity && Math.random() < 0.0015) {
                const subParticleCount = 5 + Math.floor(Math.random() * 5);
                for (let j = 0; j < subParticleCount; j++) {
                    // Add new sub-particles to the main array.
                    this.particles.push(this.createParticle({}, volume, { isPermanent: false, x: p.x, y: p.y }));
                }
                // The parent particle that exploded is removed.
                this.particles.splice(i, 1);
                continue; // Skip drawing the parent particle
            }
            
            // If a permanent particle goes off the top of the screen, reset it at the bottom.
            if (p.life === Infinity && p.y < -p.size) {
                this.createParticle(p, volume, { isPermanent: true });
            }

            // Fade out sub-particles as they die.
            const finalOpacity = (p.life < 20) ? p.opacity * (p.life / 20) : p.opacity;

            ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${finalOpacity})`;
            ctx.font = `${p.size}px NotoColorEmoji`;
            ctx.fillText(p.char, p.x, p.y);
        }
        // Connections are drawn last.
        this.drawConnections(ctx);
    }

    // The connections logic remains the same.
    drawConnections(ctx) {
        const checksPerFrame = Math.min(15, Math.floor(this.particles.length / 20));
        if (checksPerFrame < 1) return;
        ctx.strokeStyle = 'rgba(200, 225, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < checksPerFrame; i++) {
            // Grab two random particles that are currently alive.
            const p1 = this.particles[Math.floor(Math.random() * this.particles.length)];
            const p2 = this.particles[Math.floor(Math.random() * this.particles.length)];
            if (p1 && p2 && Math.hypot(p1.x - p2.x, p1.y - p2.y) < 250) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }
}

// --- TEXT WRAPPING HELPER (Unchanged) ---
function getWrappedLines(ctx, text, maxWidth) {
    const lines = text.split("\n"); let allWrappedLines = [];
    lines.forEach(line => {
        let words = line.split(" "); if (words.length === 0) return; let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
            let word = words[i]; let testWidth = ctx.measureText(currentLine + " " + word).width;
            if (testWidth < maxWidth) { currentLine += " " + word; } else { allWrappedLines.push(currentLine); currentLine = word; }
        }
        allWrappedLines.push(currentLine);
    });
    return allWrappedLines;
}

// --- TEXT FITTING HELPER (Unchanged) ---
function wrapText(ctx, text, x, y, maxWidth, maxHeight, fontSettings, scaleFactor) {
    let scaledFontSize = fontSettings.size * scaleFactor;
    while (scaledFontSize > 5) {
        ctx.font = `bold ${scaledFontSize}px NotoSansHebrew`;
        const lines = getWrappedLines(ctx, text, maxWidth * 0.95);
        const totalHeight = lines.length * (scaledFontSize * 1.4);
        if (totalHeight <= maxHeight * 0.95) { break; }
        scaledFontSize -= 1;
    }

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