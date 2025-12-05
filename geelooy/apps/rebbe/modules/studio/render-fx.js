//B"H
// modules/studio/render-fx.js
import { ctx } from './context.js';
import state from '../state.js';

export function drawVaporGrid(g, w, h, t) {
    g.save();
    const horizon = h * 0.5;
    g.fillStyle = '#110022';
    g.fillRect(0, horizon, w, h-horizon);
    
    g.beginPath();
    g.strokeStyle = '#d000ff';
    g.lineWidth = 2;
    
    // Vertical lines
    for(let i=-w; i<w*2; i+=100) {
        g.moveTo(i, h);
        g.lineTo(w/2, horizon);
    }
    
    // Horizontal lines
    const speed = 200;
    const offset = (t * speed) % 100;
    for(let y=horizon; y<h; y+= (y-horizon)*0.1 + 2) {
        const moveY = y + offset * ((y-horizon)/h); 
        if(moveY < h) {
            g.moveTo(0, moveY);
            g.lineTo(w, moveY);
        }
    }
    g.stroke();
    g.restore();
}

export function drawVHS(g, w, h, t) {
    g.save();
    g.fillStyle = 'rgba(0,0,0,0.2)';
    for(let i=0; i<h; i+=4) g.fillRect(0, i, w, 1);
    
    g.font = '40px monospace';
    g.fillStyle = '#00ff00';
    g.shadowBlur = 5;
    g.shadowColor = '#00ff00';
    g.fillText("PLAY ►", 50, 80);
    
    const d = new Date();
    g.textAlign = 'right';
    g.fillText(`REC ${d.toLocaleDateString()}`, w-50, 80);
    g.fillText(d.toLocaleTimeString(), w-50, 130);
    g.restore();
}

export function drawVisualizer(g, w, h) {
    if (!ctx.waveform) return;
    g.save();
    g.beginPath();
    g.lineWidth = 3;
    g.strokeStyle = 'rgba(0, 255, 200, 0.5)';
    const sliceWidth = w / ctx.waveform.length;
    let x = 0;
    for (let i = 0; i < ctx.waveform.length; i++) {
        const v = ctx.waveform[i] / 128.0;
        const y = (v * h/4) + (h * 0.75); 
        if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
        x += sliceWidth;
    }
    g.stroke();
    g.restore();
}

export function drawGlyph(g, layer, w, h) {
    g.save();
    const x = (layer.x || 0.5) * w;
    const y = (layer.y || 0.5) * h;
    const s = (layer.scale || 1.0) * 100;
    
    g.translate(x, y);
    g.strokeStyle = '#00f3ff';
    g.lineWidth = 4;
    g.shadowColor = '#00f3ff';
    g.shadowBlur = 10;
    
    if (layer.src === 'warning') {
        g.beginPath();
        g.moveTo(0, -s); g.lineTo(s, s); g.lineTo(-s, s); g.closePath();
        g.stroke();
        g.fillStyle = '#ff0055';
        g.font = `${s}px monospace`;
        g.textAlign = 'center';
        g.fillText('!', 0, s*0.8);
    } else if (layer.src === 'crosshair') {
        g.beginPath();
        g.arc(0,0, s, 0, Math.PI*2);
        g.moveTo(0, -s*1.2); g.lineTo(0, s*1.2);
        g.moveTo(-s*1.2, 0); g.lineTo(s*1.2, 0);
        g.stroke();
    } else if (layer.src === 'radar') {
        g.beginPath();
        g.arc(0,0, s, 0, Math.PI*2);
        g.arc(0,0, s*0.6, 0, Math.PI*2);
        g.stroke();
        g.beginPath();
        g.moveTo(0,0);
        const ang = state.currentTime * 5;
        g.lineTo(Math.cos(ang)*s, Math.sin(ang)*s);
        g.stroke();
    }
    g.restore();
}

export function drawGrid(g, w, h, t) {
    g.strokeStyle = 'rgba(0, 243, 255, 0.2)';
    g.lineWidth = 1;
    const size = 50;
    const off = (t * 20) % size;
    g.beginPath();
    for(let x=0; x<w; x+=size) { g.moveTo(x, 0); g.lineTo(x, h); }
    for(let y=off; y<h; y+=size) { g.moveTo(0, y); g.lineTo(w, y); }
    g.stroke();
}

export function drawDots(g, w, h, t) {
    g.fillStyle = 'rgba(0, 255, 102, 0.2)';
    const size = 40;
    for(let x=0; x<w; x+=size) {
        for(let y=0; y<h; y+=size) {
             if(Math.sin(x + t) * Math.cos(y + t) > 0.5) g.fillRect(x, y, 2, 2);
        }
    }
}

export function drawNoise(g, w, h) {
    g.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for(let i=0; i<100; i++) g.fillRect(Math.random()*w, Math.random()*h, 2, 2);
}