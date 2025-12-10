//B"H
// modules/studio/fx/analysis.js
import { ctx } from '../context.js';

const specHistory = [];
const SPEC_HISTORY_LEN = 100;

export function drawSpectrogram(g, w, h) {
    if (!ctx.analyser) return;
    const freqData = new Uint8Array(ctx.analyser.frequencyBinCount);
    ctx.analyser.getByteFrequencyData(freqData);
    
    const samples = 30; 
    const col = [];
    const step = Math.floor(freqData.length / samples);
    for(let i=0; i<samples; i++) {
        let sum = 0;
        for(let j=0; j<step; j++) sum += freqData[i*step + j];
        col.push(sum/step);
    }
    specHistory.unshift(col);
    if(specHistory.length > SPEC_HISTORY_LEN) specHistory.pop();
    
    g.save();
    const specW = 200;
    const specH = 100;
    const pad = 10;
    const startX = w - specW - pad;
    const startY = h - specH - pad;
    
    g.fillStyle = 'rgba(0, 20, 20, 0.8)';
    g.fillRect(startX, startY, specW, specH);
    g.strokeStyle = '#00f3ff';
    g.lineWidth = 1;
    g.strokeRect(startX, startY, specW, specH);
    
    const cellW = specW / SPEC_HISTORY_LEN;
    const cellH = specH / samples;
    
    for(let x=0; x<specHistory.length; x++) {
        const column = specHistory[x];
        for(let y=0; y<column.length; y++) {
            const val = column[y] / 255;
            if(val > 0.1) {
                const hue = 240 - (val * 240); 
                g.fillStyle = `hsla(${hue}, 100%, 50%, ${val})`;
                g.fillRect(startX + specW - (x*cellW) - cellW, startY + specH - (y*cellH) - cellH, cellW, cellH);
            }
        }
    }
    g.font = '9px monospace';
    g.fillStyle = '#00f3ff';
    g.fillText("SPECTRAL ANALYSIS", startX + 5, startY + 12);
    g.restore();
}

export function drawVisualizer(g, w, h) {
    if (!ctx.waveform) return;
    g.save();
    g.beginPath();
    g.lineWidth = 3;
    g.strokeStyle = 'rgba(0, 255, 200, 0.8)';
    g.shadowColor = 'rgba(0, 255, 200, 0.5)';
    g.shadowBlur = 10;
    
    const sliceWidth = w / ctx.waveform.length;
    let x = 0;
    for (let i = 0; i < ctx.waveform.length; i++) {
        const v = ctx.waveform[i] / 128.0;
        const y = (v * h/2) + (h/4); 
        if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
        x += sliceWidth;
    }
    g.stroke();
    g.restore();
}