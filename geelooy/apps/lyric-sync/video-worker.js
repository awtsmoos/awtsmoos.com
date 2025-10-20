// B"H - video-worker.js (Final Animation Rewrite)

// --- FONT LOADING ---
const font = new FontFace('Heebo', 'url(https://fonts.gstatic.com/s/heebo/v22/NGSpv5_NC0k9P_v6Z_PsTe5_TQ.woff2)', { style: 'normal', weight: '700' });
const fontLoaded = font.load().then(f => self.fonts.add(f)).catch(e => console.error('Worker font failed:', e));

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

let renderer;

self.onmessage = async ({ data: { cues, audioBufferShim, settings } }) => {
    try {
        await fontLoaded;

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
            if (i % Math.floor(totalFrames / 100) === 0) {
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
// REPLACE this entire function in video-worker.js
// REPLACE this entire function in video-worker.js
function drawFrame({ ctx, canvas, cues, settings, particleSystem, waveformData }, framePayload) {
    const time = framePayload.time;
    const { width, height } = canvas;

    // Calculate a scaling factor. This is the source of truth for all scaling.
    const scaleFactor = height / 720; // Assumes 720p is our baseline height

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    particleSystem.updateAndDraw(ctx, time);
    drawAnimatedWaveform(ctx, waveformData, time, width, height, settings.waveformThickness, settings.waveformHeight);
    
    
    const activeCue = cues.find(cue => time >= cue.start && time < cue.end);
    if (activeCue) {
        const { boxColor, boxOpacity } = settings.font;
        const r = parseInt(boxColor.substr(1, 2), 16), g = parseInt(boxColor.substr(3, 2), 16), b = parseInt(boxColor.substr(5, 2), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${boxOpacity})`;

        const scaledFontSizeForBox = settings.font.size * scaleFactor;
        const textHeight = measureWrappedTextHeight(ctx, activeCue.text, scaledFontSizeForBox, width * 0.85);
        const boxWidth = width * 0.9;
        const boxHeight = textHeight + (height * 0.05 * 2);
        ctx.fillRect((width - boxWidth) / 2, (height - boxHeight) / 2, boxWidth, boxHeight);

        // Pass the raw scaleFactor to wrapText. It will handle all scaling internally.
        wrapText(ctx, activeCue.text, width / 2, height / 2, width * 0.85, settings.font, scaleFactor);
    }
}




// --- DYNAMIC WAVEFORM ANIMATION ---
// REPLACE this function in video-worker.js
// REPLACE this function in video-worker.js
function drawAnimatedWaveform(ctx, waveform, time, width, height, thickness, heightMultiplier) {
    // OPTIMIZATION: If height is zero, skip all calculations and drawing.
    if (heightMultiplier <= 0) return;

    const samplesPerSecond = waveform.data.length / (waveform.duration || 1);
    const currentIndex = Math.floor(time * samplesPerSecond);
    const currentAmp = waveform.data[currentIndex] || 0;

    ctx.beginPath();
    ctx.moveTo(0, height);

    const step = 15; 

    for (let x = 0; x < width + step; x += step) {
        const primaryWave = Math.sin((x / 50) + time * 15);
        
        // Use the heightMultiplier to scale the final wave height
        const y = height - (primaryWave * height * (heightMultiplier / 100) * currentAmp);
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
    const sampleSize = 441; // ~100 samples per second for 44.1kHz audio
    const simplified = [];
    for (let i = 0; i < data.length; i += sampleSize) {
        let rms = 0;
        for (let j = 0; j < sampleSize; j++) rms += Math.pow(data[i + j] || 0, 2);
        simplified.push(Math.sqrt(rms / sampleSize));
    }
    return { data: simplified, duration: audioBufferShim.duration };
}

// --- PARTICLE SYSTEM ---
// REPLACE the ParticleSystem class in your video-worker.js
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
        const speedMultiplier = 2;

        p.x = Math.random() * this.width;
        p.y = this.height + Math.random() * 50;
        p.vx = (Math.random() - 0.5) * 1 * speedMultiplier;
        p.vy = (-1 - Math.random()) * speedMultiplier;
        p.char = this.settings.chars[Math.floor(Math.random() * this.settings.chars.length)];
        p.size = Math.max(5, baseSize - (variation / 2) + Math.random() * variation);
        p.opacity = 0.2 + Math.random() * 0.5;
        return p;
    }

    updateAndDraw(ctx, time) {
        ctx.fillStyle = 'white';
        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -p.size || p.x < -p.size || p.x > this.width + p.size) this.createParticle(p);
            
            ctx.globalAlpha = p.opacity;
            ctx.font = `${p.size}px Heebo`;
            ctx.fillText(p.char, p.x, p.y);
        }
        this.drawConnections(ctx); // Pass context only
        ctx.globalAlpha = 1.0;
    }

    drawConnections(ctx) {
        // --- PERFORMANCE FIX ---
        // The old method was very expensive and ran randomly, causing performance spikes.
        // This new method runs a smaller, fixed number of checks on every frame.
        // This distributes the load evenly and results in smoother, more stable rendering.
        const checksPerFrame = Math.min(15, Math.floor(this.particles.length / 10));
        if (checksPerFrame < 1) return;

        ctx.strokeStyle = 'rgba(200, 225, 255, 0.2)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < checksPerFrame; i++) {
            // Pick two random particles from the array
            const p1 = this.particles[Math.random() * this.particles.length | 0];
            const p2 = this.particles[Math.random() * this.particles.length | 0];
            
            // Check distance and draw line if they are close enough
            if (Math.hypot(p1.x - p2.x, p1.y - p2.y) < 250) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }
}
// --- TEXT WRAPPING HELPERS ---

// (These functions are copied from the previous final answer)
function getWrappedLines(ctx,text,maxWidth){const lines=text.split("\n");let allWrappedLines=[];lines.forEach(line=>{let words=line.split(" ");if(words.length===0)return;let currentLine=words[0];for(let i=1;i<words.length;i++){let word=words[i];let testWidth=ctx.measureText(currentLine+" "+word).width;if(testWidth<maxWidth){currentLine+=" "+word}else{allWrappedLines.push(currentLine);currentLine=word}}allWrappedLines.push(currentLine)});return allWrappedLines}
function measureWrappedTextHeight(ctx,text,fontSize,maxWidth){const originalFont=ctx.font;ctx.font=`bold ${fontSize}px Heebo`;const lines=getWrappedLines(ctx,text,maxWidth);ctx.font=originalFont;return lines.length*(fontSize*1.4)}



// REPLACE this entire function in video-worker.js
function wrapText(ctx, text, x, y, maxWidth, fontSettings, scaleFactor) {
    // --- THIS IS THE CORE FIX ---
    // All scaling is now done directly and simply inside this function.
    const scaledFontSize = fontSettings.size * scaleFactor;
    const scaledBorderWidth = fontSettings.borderWidth * scaleFactor;
    
    ctx.font = `bold ${scaledFontSize}px Heebo`;
    ctx.textAlign = fontSettings.align;
    
    const lines = getWrappedLines(ctx, text, maxWidth);
    const lineHeight = scaledFontSize * 1.4;
    const startY = y - ((lines.length - 1) * lineHeight) / 2 + (scaledFontSize * 0.3); // Vertical centering adjustment

    lines.forEach((line, i) => {
        const currentY = startY + (i * lineHeight);
        
        
        // Draw scaled border
        if (scaledBorderWidth > 0) {
            ctx.strokeStyle = fontSettings.borderColor;
            ctx.lineWidth = scaledBorderWidth * 2; // Stroke is centered, so we double it
            ctx.strokeText(line, x, currentY);
        }

        // Draw main text fill
        ctx.fillStyle = fontSettings.color;
        ctx.fillText(line, x, currentY);
    });

   
}



