//B"H
// modules/studio/render/overlays.js
import * as FX from '../render-fx.js';
import { ctx } from '../context.js';

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