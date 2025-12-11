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
    
    // Clear entire canvas (including areas outside viewport if zoomed out)
    g.save();
    g.setTransform(1,0,0,1,0,0);
    g.clearRect(0,0, width, height);
    // Draw background outside viewport
    g.fillStyle = '#111';
    g.fillRect(0,0,width,height);
    g.restore();

    // APPLY PREVIEW VIEWPORT TRANSFORM
    // We want to center the viewport first
    const view = state.previewViewport;
    g.save();
    g.translate(width/2, height/2); // Center of canvas
    g.translate(view.x, view.y);    // Pan
    g.scale(view.scale, view.scale); // Zoom
    g.translate(-width/2, -height/2); // Back to center

    // Draw bounds border
    g.strokeStyle = '#333';
    g.lineWidth = 2;
    g.strokeRect(0,0,width,height);

    // 1. Audio Analysis Phase
    analyzeAudio();

    // 2. Composition Phase (with Glitch Logic)
    // We clear the video area specifically with background color in compositor
    applyComposition(g, width, height, t, fxSettings);

    // 3. Overlay Phase (Post-Process)
    drawTacticalOverlay(g, width, height, t, state.studioIsPlaying);
    
    // 4. Metrics Phase (Oscilloscope/Spectrogram)
    if (state.studioIsPlaying) {
        drawMetrics(g, width, height);
    }
    
    g.restore();
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