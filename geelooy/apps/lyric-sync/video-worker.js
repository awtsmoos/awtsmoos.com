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
function drawFrame({ ctx, canvas, cues, settings, particleSystem, waveformData }, framePayload) {
    const time = framePayload.time;
    const { width, height } = canvas;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    particleSystem.updateAndDraw(ctx, time);
    drawAnimatedWaveform(ctx, waveformData, time, width, height, settings.waveformThickness);
    
    const activeCue = cues.find(cue => time >= cue.start && time < cue.end);
    if (activeCue) {
        const { boxColor, boxOpacity } = settings.font;
        const r = parseInt(boxColor.substr(1, 2), 16), g = parseInt(boxColor.substr(3, 2), 16), b = parseInt(boxColor.substr(5, 2), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${boxOpacity})`;
        
        const textHeight = measureWrappedTextHeight(ctx, activeCue.text, settings.font.size, width * 0.85);
        const boxWidth = width * 0.9;
        const boxHeight = textHeight + (height * 0.05 * 2);
        ctx.fillRect((width - boxWidth) / 2, (height - boxHeight) / 2, boxWidth, boxHeight);

        wrapText(ctx, activeCue.text, width / 2, height / 2, width * 0.85, settings.font);
    }
}

// --- DYNAMIC WAVEFORM ANIMATION ---
function drawAnimatedWaveform(ctx, waveform, time, width, height, thickness) {
    const samplesPerSecond = waveform.length / (waveform.duration || 1);
    const currentIndex = Math.floor(time * samplesPerSecond);
    const currentAmp = waveform.data[currentIndex] || 0;

    ctx.beginPath();
    ctx.moveTo(0, height);

    for (let x = 0; x < width; x++) {
        const primaryWave = Math.sin((x / width) * 20 + time * 20); // Fast moving base wave
        const secondaryWobble = Math.sin((x / width) * 5 + time * 2); // Slow vertical wobble
        const noise = (Math.random() - 0.5) * 0.2; // High frequency jitter

        // Modulate the procedural wave's height by the actual audio amplitude
        const modulatedAmplitude = (primaryWave + noise) * currentAmp;
        
        const y = height - (height * 0.2) - (modulatedAmplitude * height * 0.3) - (secondaryWobble * height * 0.05);
        ctx.lineTo(x, y);
    }
    
    ctx.strokeStyle = `rgba(200, 225, 255, ${0.3 + currentAmp * 0.7})`; // Brighter when loud
    ctx.lineWidth = thickness;
    ctx.shadowColor = 'rgba(150, 200, 255, 1)';
    ctx.shadowBlur = 10 * currentAmp; // Glow when loud
    ctx.stroke();
    
    ctx.shadowBlur = 0;
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
        const speedMultiplier = 2; // Increase speed

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
        this.drawConnections(ctx, time);
        ctx.globalAlpha = 1.0;
    }

    drawConnections(ctx, time) {
        if (Math.sin(time * 5) < 0) return;
        const connectCount = Math.floor(this.particles.length / 20);
        ctx.strokeStyle = 'rgba(200, 225, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 5;
        for (let i = 0; i < connectCount; i++) {
            const p1 = this.particles[Math.floor(Math.random() * this.particles.length)];
            const p2 = this.particles[Math.floor(Math.random() * this.particles.length)];
            if (Math.hypot(p1.x - p2.x, p1.y - p2.y) < 250) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
        ctx.shadowBlur = 0;
    }
}

// --- TEXT WRAPPING HELPERS ---
function getWrappedLines(ctx, text, maxWidth) { /* ... unchanged ... */ return []; }
function measureWrappedTextHeight(ctx, text, fontSize, maxWidth) { /* ... unchanged ... */ return 0; }
function wrapText(ctx, text, x, y, maxWidth, fontSettings) { /* ... unchanged ... */ }
// (These functions are copied from the previous final answer)
function getWrappedLines(ctx,text,maxWidth){const lines=text.split("\n");let allWrappedLines=[];lines.forEach(line=>{let words=line.split(" ");if(words.length===0)return;let currentLine=words[0];for(let i=1;i<words.length;i++){let word=words[i];let testWidth=ctx.measureText(currentLine+" "+word).width;if(testWidth<maxWidth){currentLine+=" "+word}else{allWrappedLines.push(currentLine);currentLine=word}}allWrappedLines.push(currentLine)});return allWrappedLines}
function measureWrappedTextHeight(ctx,text,fontSize,maxWidth){const originalFont=ctx.font;ctx.font=`bold ${fontSize}px Heebo`;const lines=getWrappedLines(ctx,text,maxWidth);ctx.font=originalFont;return lines.length*(fontSize*1.4)}
function wrapText(ctx,text,x,y,maxWidth,fontSettings){const lines=getWrappedLines(ctx,text,maxWidth);const lineHeight=fontSettings.size*1.4;const startY=y-((lines.length-1)*lineHeight)/2+(fontSettings.size*0.3);lines.forEach((line,i)=>{const currentY=startY+(i*lineHeight);ctx.shadowColor=fontSettings.shadowColor;ctx.shadowBlur=fontSettings.shadowBlur;ctx.shadowOffsetX=2;ctx.shadowOffsetY=2;if(fontSettings.borderWidth>0){ctx.strokeStyle=fontSettings.borderColor;ctx.lineWidth=fontSettings.borderWidth*2;ctx.strokeText(line,x,currentY)}ctx.fillStyle=fontSettings.color;ctx.fillText(line,x,currentY);ctx.shadowColor="transparent"})}