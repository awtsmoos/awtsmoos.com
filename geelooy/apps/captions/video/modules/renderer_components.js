/*
ב"ה
B"H
*/

// --- Feature 1: VCR Date Stamp ---
self.einSofRenderer.renderVCRStamp = function(ctx, res, enabled) {
    if (!enabled) return;
    const now = new Date();
    const dateStr = now.toLocaleDateString().toUpperCase();
    const timeStr = now.toLocaleTimeString();
    
    ctx.save();
    ctx.font = `bold ${res.height * 0.04}px "Courier New", monospace`;
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.textAlign = 'right';
    ctx.fillText(`${dateStr} ${timeStr}`, res.width - 40, res.height - 40);
    ctx.restore();
};

// --- Feature 3: Audio Waveform Visualizer ---
self.einSofRenderer.renderWaveform = function(ctx, res, audioData, enabled) {
    if (!enabled || !audioData) return;
    
    // audioData is a Float32Array of samples for the current frame
    const h = res.height;
    const w = res.width;
    const cy = h - (h * 0.1); // Bottom 10%
    const amp = h * 0.08;
    
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0, 242, 234, 0.6)';
    
    const step = Math.ceil(audioData.length / w);
    
    for(let i = 0; i < w; i++) {
        // Simple downsampling
        const idx = i * step;
        const val = audioData[idx] || 0;
        const y = cy + (val * amp);
        if(i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
    }
    
    ctx.stroke();
    
    // Glow effect
    ctx.shadowColor = '#00F2EA';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();
};

self.einSofRenderer.renderHeader = function(ctx, text, res) {
    if (!text) return;
    // Keeping it simple for line limit
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(res.width/2 - 200, 10, 400, 50);
    ctx.fillStyle = '#FFF';
    ctx.font = '30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, res.width/2, 45);
    ctx.restore();
};