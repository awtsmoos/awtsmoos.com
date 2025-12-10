//B"H
// modules/studio/render/pipeline.js
import { ctx } from '../context.js';
import state from '../../state.js';
import { renderScene } from './compositor.js';
import { drawTacticalOverlay, drawMetrics } from './overlays.js';

export function drawFrame() {
    if (!ctx.g) return;
    const { width, height } = ctx.canvas;
    const g = ctx.g;
    const t = state.currentTime;
    const fxSettings = state.studioFX || {};

    // 1. Audio Analysis Phase
    analyzeAudio();

    // 2. Composition Phase (with Glitch Logic)
    g.clearRect(0,0,width,height);
    applyComposition(g, width, height, t, fxSettings);

    // 3. Overlay Phase (Post-Process)
    drawTacticalOverlay(g, width, height, t, state.studioIsPlaying);
    
    // 4. Metrics Phase (Oscilloscope/Spectrogram)
    if (state.studioIsPlaying) {
        drawMetrics(g, width, height);
    }
}

function analyzeAudio() {
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
}

function applyComposition(g, width, height, t, fxSettings) {
    const isGlitch = fxSettings.rgbSplit && ctx.bass > 0.3;

    if (isGlitch) {
        // Glitch Pass: Draw scene 3 times
        g.globalCompositeOperation = 'screen';
        
        // Channel 1: Red Shift
        g.save();
        const rX = (Math.random() - 0.5) * 20;
        const rY = (Math.random() - 0.5) * 10;
        g.translate(rX, rY);
        renderScene(g, width, height, t, fxSettings);
        g.fillStyle = 'rgba(255, 0, 0, 0.2)'; 
        g.fillRect(0,0,width,height); 
        g.restore();

        // Channel 2: Cyan Shift
        g.save();
        g.translate(-rX, -rY);
        renderScene(g, width, height, t, fxSettings);
        g.fillStyle = 'rgba(0, 255, 255, 0.2)'; 
        g.fillRect(0,0,width,height); 
        g.restore();
        
        g.globalCompositeOperation = 'source-over';
    } else {
        // Standard Pass
        renderScene(g, width, height, t, fxSettings);
    }
}