//B"H
// modules/studio/fx/glyph.js

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
        g.beginPath();
        g.rotate(Date.now() / 500);
        g.arc(0,0, s*0.7, 0, Math.PI*1.5);
        g.stroke();
    } else if (layer.src === 'radar') {
        g.beginPath();
        g.arc(0,0, s, 0, Math.PI*2);
        g.stroke();
        g.beginPath();
        g.moveTo(0,0);
        const ang = (Date.now() / 500) % (Math.PI*2);
        g.lineTo(Math.cos(ang)*s, Math.sin(ang)*s);
        g.stroke();
        g.fillStyle = 'rgba(255,0,0,0.8)';
        if(Math.random()>0.9) g.fillRect(s*0.5, s*0.5, 5, 5);
    }
    g.restore();
}