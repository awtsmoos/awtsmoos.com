//B"H
// modules/studio/render.js
import { ctx } from './context.js';
import state from '../state.js';
import { drawParticles } from './particles.js';
import * as FX from './render-fx.js';

export function drawFrame() {
    if (!ctx.g) return;
    const { width, height } = ctx.canvas;
    const g = ctx.g;
    const t = state.currentTime;
    const fxSettings = state.studioFX || {};

    // 1. Analyze
    if (state.studioIsPlaying && ctx.analyser) {
        ctx.analyser.getByteFrequencyData(ctx.spectrum);
        ctx.analyser.getByteTimeDomainData(ctx.waveform);
        
        const getEnergy = (min, max) => {
            let sum = 0;
            for(let i=min; i<max; i++) sum += ctx.spectrum[i];
            return (sum / (max-min)) / 255;
        };
        ctx.bass = getEnergy(0, 10);
        ctx.mid = getEnergy(10, 100);
        ctx.treble = getEnergy(100, 255);
    } else {
        ctx.bass = 0; ctx.mid = 0; ctx.treble = 0;
    }

    g.save();

    // FX 7: Jitter
    if (fxSettings.jitter && ctx.treble > 0.4) {
        const amt = ctx.treble * 30;
        g.translate((Math.random()-0.5)*amt, (Math.random()-0.5)*amt);
    }

    // FX 1: Pump
    if (fxSettings.pump) {
        const s = 1 + (ctx.bass * 0.1);
        g.translate(width/2, height/2);
        g.scale(s, s);
        g.translate(-width/2, -height/2);
    }

    // 2. BG
    g.fillStyle = state.studioGlobal.bg;
    if(fxSettings.colorCycle) {
        const hue = (t * 20) % 360;
        g.fillStyle = `hsl(${hue}, 50%, 10%)`;
    }
    g.fillRect(0, 0, width, height);

    if (fxSettings.vaporGrid) FX.drawVaporGrid(g, width, height, t);
    else if (state.studioGlobal.bgPattern === 'grid') FX.drawGrid(g, width, height, t);
    else if (state.studioGlobal.bgPattern === 'dots') FX.drawDots(g, width, height, t);
    else if (state.studioGlobal.bgPattern === 'noise') FX.drawNoise(g, width, height);

    // 3. Particles
    drawParticles(width, height, t);

    // 4. Layers
    state.mediaLayers.forEach(layer => {
        if (t >= layer.start && t <= layer.end) {
            if (layer.type === 'glyph') FX.drawGlyph(g, layer, width, height);
            else drawMedia(g, layer, width, height);
        }
    });

    // 5. Captions
    state.captions.forEach(cap => {
        if (t >= cap.start && t <= cap.end) drawCaption(g, cap, width, height);
    });

    // FX 2: RGB Split
    if (fxSettings.rgbSplit && ctx.bass > 0.5) {
        g.globalCompositeOperation = 'screen';
        g.fillStyle = 'rgba(255,0,0,0.3)';
        g.fillRect(10, 0, width, height);
        g.fillStyle = 'rgba(0,255,255,0.3)';
        g.fillRect(-10, 0, width, height);
        g.globalCompositeOperation = 'source-over';
    }

    // FX 5: VHS
    if (fxSettings.vhs) FX.drawVHS(g, width, height, t);

    // Visualizer
    if (state.studioIsPlaying) FX.drawVisualizer(g, width, height);

    g.restore();
}

function drawMedia(g, layer, w, h) {
    let media = ctx.mediaCache[layer.src];
    if (!media) {
        if (layer.type === 'image') {
            const img = new Image();
            img.src = layer.src;
            media = { el: img, type: 'image', ready: false };
            img.onload = () => media.ready = true;
        } else if (layer.type === 'video') {
            const vid = document.createElement('video');
            vid.src = layer.src;
            vid.muted = true;
            vid.playsInline = true;
            vid.loop = true; 
            media = { el: vid, type: 'video', ready: false };
            vid.onloadeddata = () => media.ready = true;
        }
        ctx.mediaCache[layer.src] = media;
    }

    if (media.ready) {
        g.save();
        g.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1.0;
        g.globalCompositeOperation = layer.blendMode || 'source-over';
        
        const f = layer.filter || {};
        g.filter = `brightness(${f.brightness || 100}%) blur(${f.blur || 0}px)`;

        const scale = layer.scale || 1.0;
        const x = (layer.x || 0.5) * w;
        const y = (layer.y || 0.5) * h;
        
        g.translate(x, y);
        g.scale(scale, scale);
        g.rotate((layer.rotation || 0) * Math.PI / 180);
        
        if (f.hologram) {
            g.globalAlpha *= 0.8;
            g.filter += ` hue-rotate(180deg) contrast(150%)`;
        }

        if (media.type === 'video') {
            if (media.el.readyState >= 2) {
                 const trackTime = state.currentTime - layer.start;
                 const vidTime = trackTime * (layer.speed || 1.0);
                 if (!state.studioIsPlaying && Math.abs(media.el.currentTime - vidTime) > 0.1) {
                     media.el.currentTime = vidTime;
                 }
                 g.drawImage(media.el, -w/2, -h/2, w, h);
            }
        } else {
            g.drawImage(media.el, -w/2, -h/2, w, h);
        }
        
        if (f.hologram) {
            g.fillStyle = 'rgba(0, 255, 255, 0.1)';
            for(let i=-h/2; i<h/2; i+=10) g.fillRect(-w/2, i, w, 2);
        }
        g.restore();
    }
}

function drawCaption(g, cap, w, h) {
    const style = cap.style || {};
    let fontSize = style.fontSize || 40;
    let x = w/2;
    let yPos = (style.y || 0.8) * h;
    let txt = cap.text;
    
    if (style.glitch && Math.random() > 0.8) {
        x += (Math.random()-0.5) * 10;
        yPos += (Math.random()-0.5) * 10;
        const idx = Math.floor(Math.random()*txt.length);
        txt = txt.substring(0, idx) + String.fromCharCode(33 + Math.random()*50) + txt.substring(idx+1);
    }

    g.save();
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    
    if (style.glow !== false) {
        g.shadowColor = style.glowColor || '#00f3ff';
        g.shadowBlur = style.glowAmount || 10;
    }

    g.font = `bold ${fontSize}px ${style.font || 'monospace'}`;
    g.fillStyle = style.color || '#ff0055';
    g.strokeStyle = style.strokeColor || '#000000';
    g.lineWidth = style.strokeWidth || 4;
    
    g.strokeText(txt, x, yPos);
    g.fillText(txt, x, yPos);
    
    if (cap.translation) {
        g.font = `bold ${fontSize * 0.6}px ${style.font || 'monospace'}`;
        g.fillStyle = style.transColor || '#00f3ff';
        g.shadowBlur = 0; 
        g.strokeText(cap.translation, x, yPos + fontSize + 10);
        g.fillText(cap.translation, x, yPos + fontSize + 10);
    }
    
    g.restore();
}