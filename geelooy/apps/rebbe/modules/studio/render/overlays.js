//B"H
// modules/studio/render/overlays.js
import * as FX from '../render-fx.js';
import { ctx } from '../context.js';
import state from '../../state.js';

export function drawTacticalOverlay(g, w, h, t, playing) {
    g.save();
    
    // Crosshairs
    g.strokeStyle = 'rgba(0, 243, 255, 0.3)';
    g.lineWidth = 1;
    
    // Center Marker
    const cx = w/2, cy = h/2;
    g.beginPath();
    g.moveTo(cx - 20, cy); g.lineTo(cx + 20, cy);
    g.moveTo(cx, cy - 20); g.lineTo(cx, cy + 20);
    g.stroke();
    
    // Corner brackets
    const m = 30; // margin
    const l = 40; // length
    g.beginPath();
    g.moveTo(m, m+l); g.lineTo(m, m); g.lineTo(m+l, m); // TL
    g.moveTo(w-m-l, m); g.lineTo(w-m, m); g.lineTo(w-m, m+l); // TR
    g.moveTo(m, h-m-l); g.lineTo(m, h-m); g.lineTo(m+l, h-m); // BL
    g.moveTo(w-m-l, h-m); g.lineTo(w-m, h-m); g.lineTo(w-m, h-m-l); // BR
    g.stroke();
    
    // REC dot
    if (playing && Math.floor(t * 2) % 2 === 0) {
        g.fillStyle = '#ff0055';
        g.beginPath();
        g.arc(w - 60, 60, 10, 0, Math.PI * 2);
        g.fill();
        g.font = 'bold 16px monospace';
        g.fillText("REC", w - 100, 65);
    }
    
    // Timecode Bottom Left
    g.font = '16px monospace';
    g.fillStyle = 'rgba(0, 243, 255, 0.7)';
    g.textAlign = 'left';
    g.fillText(`TCR ${t.toFixed(3)}`, m, h - m + 20);
    
    g.restore();
}

export function drawTransformGizmo(g, w, h) {
    if (state.selectedType !== 'media' || !state.selectedClipId) return;
    
    const layer = state.mediaLayers.find(l => l.id === state.selectedClipId);
    if (!layer) return;
    
    // Only draw if layer is visible at current time
    if (state.currentTime < layer.start || state.currentTime > layer.end) return;

    let width = 100, height = 100; // Default
    let media = ctx.mediaCache[layer.src];
    if (media && media.ready) {
        if (media.type === 'image') { width = media.el.naturalWidth; height = media.el.naturalHeight; }
        else { width = media.el.videoWidth; height = media.el.videoHeight; }
    }
    
    // Apply Transforms
    g.save();
    
    const cx = (layer.x !== undefined ? layer.x : 0.5) * w;
    const cy = (layer.y !== undefined ? layer.y : 0.5) * h;
    const scale = layer.scale || 1.0;
    
    g.translate(cx, cy);
    g.rotate((layer.rotation || 0) * Math.PI / 180);
    
    const dw = width * scale;
    const dh = height * scale;
    
    // Draw Box
    g.strokeStyle = '#00f3ff';
    g.lineWidth = 2;
    g.setLineDash([5, 5]);
    g.strokeRect(-dw/2, -dh/2, dw, dh);
    g.setLineDash([]);
    
    // Draw Corners (Handles)
    const hSz = 10; // Handle size
    g.fillStyle = '#ffffff';
    g.strokeStyle = '#000000';
    
    const corners = [
        {x: -dw/2, y: -dh/2}, {x: dw/2, y: -dh/2},
        {x: dw/2, y: dh/2}, {x: -dw/2, y: dh/2}
    ];
    
    corners.forEach(c => {
        g.fillRect(c.x - hSz/2, c.y - hSz/2, hSz, hSz);
        g.strokeRect(c.x - hSz/2, c.y - hSz/2, hSz, hSz);
    });
    
    // Rotate Handle (Top)
    g.beginPath();
    g.moveTo(0, -dh/2);
    g.lineTo(0, -dh/2 - 30);
    g.stroke();
    
    g.beginPath();
    g.arc(0, -dh/2 - 30, 8, 0, Math.PI*2);
    g.fill();
    g.stroke();
    
    g.restore();
}

export function drawCaption(g, cap, w, h) {
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

export function drawMetrics(g, w, h) {
    FX.drawVisualizer(g, w, h);
    FX.drawSpectrogram(g, w, h);
}