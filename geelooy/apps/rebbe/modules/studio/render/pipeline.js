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

    // 1. Audio Analysis Phase (ALWAYS use Pre-process for consistency)
    analyzeAudio(t);

    // 2. Composition Phase
    applyComposition(g, width, height, t, fxSettings);

    // 3. Overlay Phase (Post-Process)
    drawTacticalOverlay(g, width, height, t, state.studioIsPlaying);
    
    // 4. Metrics Phase (Oscilloscope/Spectrogram)
    // We can still draw these for "tech" feel even if driving particles via pre-analysis
    if (state.studioIsPlaying) {
        drawMetrics(g, width, height);
    }
    
    g.restore();
}

function analyzeAudio(time) {
    // FORCE PRE-ANALYZED DATA
    // This ensures that what you see while seeking is EXACTLY what you see while playing.
    // WebAudio AnalyserNode is often slightly out of sync or has different smoothing than our worker logic.
    
    if (ctx.analysisData && ctx.analysisData.length > 0) {
        // Map time to frame index (30fps analysis)
        const fps = 30;
        const index = Math.floor(time * fps);
        const nextIndex = index + 1;
        const frac = (time * fps) - index;

        // Linear Interpolation for smooth motion between analysis frames
        const getFrame = (i) => ctx.analysisData[Math.max(0, Math.min(i, ctx.analysisData.length-1))];
        const f1 = getFrame(index);
        const f2 = getFrame(nextIndex);

        if (f1 && f2) {
            ctx.bass = f1.bass + (f2.bass - f1.bass) * frac;
            ctx.mid = f1.mid + (f2.mid - f1.mid) * frac;
            ctx.treble = f1.treble + (f2.treble - f1.treble) * frac;
        } else if (f1) {
            ctx.bass = f1.bass; ctx.mid = f1.mid; ctx.treble = f1.treble;
        } else {
            ctx.bass = 0; ctx.mid = 0; ctx.treble = 0;
        }
    } else {
        // Fallback if no analysis (e.g. no audio track)
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