//B"H
// modules/studio/fx/vhs.js

export function drawVHS(g, w, h, t) {
    g.save();
    g.fillStyle = 'rgba(0,0,0,0.3)';
    for(let i=0; i<h; i+=4) g.fillRect(0, i, w, 2);
    
    const noiseY = (t * 50) % (h + 100) - 50;
    g.fillStyle = 'rgba(255, 255, 255, 0.1)';
    g.fillRect(0, noiseY, w, 30);
    for(let i=0; i<50; i++) g.fillRect(Math.random()*w, noiseY + Math.random()*30, 2, 2);

    g.font = 'bold 30px monospace';
    g.fillStyle = '#00ff00';
    g.shadowBlur = 5;
    g.shadowColor = '#00ff00';
    g.fillText("PLAY ►", 40, 60);
    
    const d = new Date();
    g.textAlign = 'right';
    g.font = '20px monospace';
    g.fillText(`REC ${d.toLocaleDateString().toUpperCase()}`, w-40, 60);
    g.fillText(d.toLocaleTimeString(), w-40, 90);
    
    g.restore();
}