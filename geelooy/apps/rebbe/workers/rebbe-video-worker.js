// B"H
// Rebbe Video Worker - Studio Edition

try {
    importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');
} catch (e) {
    self.postMessage({
        type: 'FATAL_ERROR',
        payload: { message: "LIBRARY LOAD FAILED: " + e.message, stack: e.stack }
    });
}

const CHARS = "אבגדהוזחטיכלמנסעפצקרשת";
const COLORS = [];
for(let i=0; i<360; i+=10) COLORS.push(`hsl(${i}, 100%, 50%)`);

self.onmessage = async ({ data }) => {
    try {
        const { type, payload } = data;
        
        if (type === 'START_EXPORT') {
             await handleExport(payload);
        }
        else if (type === 'ENCODE_AUDIO') {
            encodeWav(payload);
        }
    } catch (e) {
        self.postMessage({
            type: 'FATAL_ERROR',
            payload: { message: e.message, stack: e.stack }
        });
    }
};

async function handleExport({ audioShim, captions, mediaLayers, settings }) {
    if (typeof MediaBunnyBase === 'undefined') {
        throw new Error("MediaBunnyBase library not loaded. Check script path.");
    }

    const frameRate = 30;
    const totalDuration = audioShim.duration;
    const totalFrames = Math.floor(totalDuration * frameRate);
    
    // Pre-calculate audio data
    const analysisData = preAnalyzeAudio(audioShim, totalFrames);
    
    // Initialize Particles with Settings
    const particleSystem = new HebrewParticleSystem(settings.resolution, settings.particles);

    const renderer = new MediaBunnyBase({
        resolution: settings.resolution,
        outputFormat: { quality: 1 }
    }, (base, frame) => {
        drawFrame({ 
            ...base, 
            captions: captions || [], 
            mediaLayers: mediaLayers || [], 
            particleSystem, 
            analysisData,
            fx: settings.fx || { beatRing: true } 
        }, frame);
    }, {
        libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js'
    });

    await renderer.start();

    for (let i = 0; i < totalFrames; i++) {
        const time = i / frameRate;
        await renderer.addFrame({
            time,
            duration: 1 / frameRate,
            frameNumber: i
        });
        
        if (i % 30 === 0) {
            self.postMessage({
                type: 'STATUS_UPDATE',
                payload: {
                    message: `RENDERING FRAME ${i}/${totalFrames}`,
                    progress: i / totalFrames
                }
            });
        }
    }

    self.postMessage({
        type: 'STATUS_UPDATE',
        payload: { message: "ENCODING COMPOSITE...", progress: 1 }
    });

    const blob = await renderer.finalize(audioShim);
    
    self.postMessage({
        type: 'VIDEO_COMPLETE',
        payload: blob
    });
}

function drawFrame({ ctx, canvas, captions, mediaLayers, particleSystem, analysisData, fx }, { time, frameNumber }) {
    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    
    const audioFrame = analysisData[frameNumber] || { bass: 0, mid: 0, vol: 0 };
    const { bass, mid } = audioFrame;

    // 1. Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // 2. Particles (Background FX)
    particleSystem.updateAndDraw(ctx, bass, mid, time);

    // 3. Central Geometry (Beat Reactive)
    // Only draw if enabled in FX (defaults true)
    if (fx.beatRing !== false && bass > 0.1) {
        ctx.beginPath();
        const r = (Math.min(width,height) * 0.2) + bass * 200;
        ctx.arc(centerX, centerY, r, 0, 6.28);
        ctx.strokeStyle = `hsl(${180 + bass * 100}, 100%, 50%)`;
        ctx.lineWidth = (5 + bass * 20) | 0;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }

    // 4. Media Layers (Images)
    mediaLayers.forEach(layer => {
        if (time >= layer.start && time <= layer.end) {
            if (layer.bitmap) {
                const imgW = layer.bitmap.width * layer.scale;
                const imgH = layer.bitmap.height * layer.scale;
                
                // Beat shake effect for media
                const shakeX = (bass > 0.5) ? (Math.random()-0.5)*10 : 0;
                const shakeY = (bass > 0.5) ? (Math.random()-0.5)*10 : 0;
                
                const drawX = (layer.x * width) - (imgW / 2) + shakeX;
                const drawY = (layer.y * height) - (imgH / 2) + shakeY;
                
                ctx.drawImage(layer.bitmap, drawX, drawY, imgW, imgH);
            }
        }
    });

    // 5. Captions
    const currentCaption = captions.find(c => time >= c.start && time <= c.end);
    if (currentCaption) {
        const boxY = height * 0.8;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 10;
        
        // Hebrew/Text
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#000000';
        ctx.fillStyle = '#ff0055'; 
        ctx.font = 'bold 50px monospace';
        
        const txt = currentCaption.text;
        ctx.strokeText(txt, centerX, boxY);
        ctx.fillText(txt, centerX, boxY);
        
        // English
        ctx.font = 'bold 35px monospace';
        ctx.fillStyle = '#00f3ff';
        ctx.lineWidth = 4;
        const trans = currentCaption.translation;
        ctx.strokeText(trans, centerX, boxY + 60);
        ctx.fillText(trans, centerX, boxY + 60);
        
        ctx.shadowBlur = 0;
    }

    // 6. Watermark
    ctx.font = '20px monospace';
    ctx.fillStyle = 'rgba(170, 170, 170, 0.5)';
    ctx.textAlign = 'left';
    ctx.fillText("AWTSMOOS // OMEGA", 40, 50);
}

// --- ANALYSIS HELPERS ---
function preAnalyzeAudio(shim, totalFrames) {
    if (!shim || !shim.channels) return new Array(totalFrames).fill({ bass: 0, mid: 0 });
    const data = shim.channels[0];
    if (!data) return new Array(totalFrames).fill({ bass: 0, mid: 0 });

    const results = [];
    const samplesPerFrame = Math.floor(data.length / totalFrames);

    for (let i = 0; i < totalFrames; i++) {
        const start = i * samplesPerFrame;
        const end = Math.min(start + samplesPerFrame, data.length);
        
        let sum = 0;
        for (let j = start; j < end; j++) {
            sum += (data[j] || 0) ** 2;
        }
        const rms = Math.sqrt(sum / (end - start)) || 0;
        
        const bass = Math.min(1, rms * 4); 
        const mid = Math.min(1, rms * 2);
        
        results.push({ bass, mid, vol: rms });
    }
    return results;
}

// --- PARTICLE SYSTEM ---
class HebrewParticleSystem {
    constructor(resolution, settings = {}) {
        this.width = resolution.width;
        this.height = resolution.height;
        this.settings = settings;
        this.particles = new Array(settings.count || 400).fill(0).map(() => this.createParticle());
    }

    createParticle() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            char: CHARS[Math.floor(Math.random() * CHARS.length)],
            baseSize: Math.random() * (this.settings.sizeBase || 20) + 10,
            baseVx: (Math.random() - 0.5) * 2,
            baseVy: (Math.random() - 0.5) * 2,
            hue: Math.floor(Math.random() * 36)
        };
    }

    updateAndDraw(ctx, bass, mid, time) {
        // If disabled, just return
        if (this.settings.enabled === false) return;

        const reactivity = this.settings.reactivity || 1.0;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            const energy = (i % 2 === 0) ? bass : mid;
            
            if (this.settings.mode === 'float' || !this.settings.mode) {
                // Default Floating Logic
                if (energy > 0.01) {
                    const speed = energy * 15 * reactivity;
                    p.x += p.baseVx * speed;
                    p.y += p.baseVy * speed;
                } else {
                    p.x += p.baseVx * 0.1; 
                    p.y += p.baseVy * 0.1;
                }
            } else {
                // Placeholder for other modes if worker needs to support them
                // For now, float is dominant
                p.x += p.baseVx; 
                p.y += p.baseVy;
            }

            if(p.x < -50) p.x = this.width + 50;
            else if(p.x > this.width + 50) p.x = -50;
            if(p.y < -50) p.y = this.height + 50;
            else if(p.y > this.height + 50) p.y = -50;

            const size = p.baseSize + (energy * 60 * reactivity);
            
            // Color Handling
            let color = '#FFF';
            if (this.settings.colorMode === 'rainbow' || !this.settings.colorMode) {
                const hueIdx = (p.hue + Math.floor(time * 10)) % 36;
                color = COLORS[hueIdx] || '#FFF';
            } else if (this.settings.colorMode === 'velocity') {
                color = `hsl(${200 + (energy*160)}, 100%, 60%)`;
            } else if (this.settings.colorMode === 'solid') {
                color = this.settings.color || '#FFF';
            }

            ctx.fillStyle = color;
            ctx.font = `${size | 0}px monospace`;
            ctx.fillText(p.char, p.x | 0, p.y | 0);
        }
    }
}

// --- WAV ENCODER ---
function encodeWav(audioShim) {
    if(!audioShim || !audioShim.channels) return;
    const numChannels = audioShim.numberOfChannels;
    const sampleRate = audioShim.sampleRate;
    const length = audioShim.length;
    const bufferLength = length * numChannels * 2 + 44;
    const buffer = new ArrayBuffer(bufferLength);
    const view = new DataView(buffer);
    
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length * numChannels * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length * numChannels * 2, true);

    let offset = 44;
    const CHUNK_SIZE = 4096;
    let processed = 0;
    
    function processChunk() {
        const end = Math.min(processed + CHUNK_SIZE, length);
        for (let j = processed; j < end; j++) {
            for (let ch = 0; ch < numChannels; ch++) {
                let sample = audioShim.channels[ch][j];
                sample = Math.max(-1, Math.min(1, sample));
                sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(offset, sample, true);
                offset += 2;
            }
        }
        processed = end;
        if (processed < length) {
            if (processed % (CHUNK_SIZE * 50) === 0) {
                 self.postMessage({ type: 'AUDIO_PROGRESS', payload: processed / length });
            }
            setTimeout(processChunk, 0); 
        } else {
             self.postMessage({ 
                type: 'AUDIO_COMPLETE', 
                payload: new Blob([view], { type: 'audio/wav' }) 
            });
        }
    }
    processChunk();
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}