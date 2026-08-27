//B"H
// modules/studio/render/compositor.js
import { ctx } from '../context.js';
import state from '../../state.js';
import * as FX from '../render-fx.js';
import { drawParticles } from '../particles.js';
import { drawMedia } from './layers.js';
import { drawCaption, drawTransformGizmo } from './overlays.js';

export function renderScene(g, width, height, t, fxSettings) {
    g.save();
    
    // 0. Clip to Bounds (Prevents overlay bleeding)
    g.beginPath();
    g.rect(0, 0, width, height);
    g.clip();

    // FX: Jitter
    if (fxSettings.jitter && ctx.treble > 0.4) {
        const amt = ctx.treble * 30;
        g.translate((Math.random()-0.5)*amt, (Math.random()-0.5)*amt);
    }

    // FX: Pump
    if (fxSettings.pump) {
        const s = 1 + (ctx.bass * 0.1);
        g.translate(width/2, height/2);
        g.scale(s, s);
        g.translate(-width/2, -height/2);
    }

    // 1. Background
    drawBackground(g, width, height, t, fxSettings);

    // 2. Combined Media & Effect Layers (Sorted by Array Order = Z-Index)
    // We treat 'mediaLayers' as the unified stack.
    state.mediaLayers.forEach(layer => {
        if (t >= layer.start && t <= layer.end) {
            g.save();
            // Global Opacity for layer
            g.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1.0;
            g.globalCompositeOperation = layer.blendMode || 'source-over';

            if (layer.type === 'effect') {
                // Render Effect Layer
                if (layer.effectType === 'particles') {
                    drawParticles(g, width, height, t, layer.config); 
                } 
                // Add more effect types here (e.g. Matrix, Fire)
            } 
            else if (layer.type === 'glyph') {
                FX.drawGlyph(g, layer, width, height);
            }
            else {
                // Render Image/Video
                drawMedia(g, layer, width, height);
            }
            g.restore();
        }
    });

    // 4. Central Geometry (Global FX - usually on top)
    if (fxSettings.beatRing) {
        FX.drawBeatRing(g, width, height, ctx.bass);
    }

    // 5. Captions
    state.captions.forEach(cap => {
        if (t >= cap.start && t <= cap.end) drawCaption(g, cap, width, height);
    });

    // Post-Processing FX
    if (fxSettings.vhs) FX.drawVHS(g, width, height, t);
    if (fxSettings.crt) FX.drawCRT(g, width, height, t);

    // 6. UI Overlays (Gizmo) - NOT Clipped (drawn on top of clip region? No, context is clipped)
    // We might want gizmos outside clip? No, usually inside.
    drawTransformGizmo(g, width, height);

    g.restore();
}

function drawBackground(g, width, height, t, fxSettings) {
    g.fillStyle = state.studioGlobal.bg || '#000000';
    
    if(fxSettings.colorCycle) {
        const hue = (t * 20) % 360;
        g.fillStyle = `hsl(${hue}, 50%, 10%)`;
    }
    g.fillRect(0, 0, width, height);

    if (fxSettings.vaporGrid) FX.drawVaporGrid(g, width, height, t);
    else if (state.studioGlobal.bgPattern === 'grid') FX.drawGrid(g, width, height, t);
    else if (state.studioGlobal.bgPattern === 'dots') FX.drawDots(g, width, height, t);
    else if (state.studioGlobal.bgPattern === 'noise') FX.drawNoise(g, width, height);
}