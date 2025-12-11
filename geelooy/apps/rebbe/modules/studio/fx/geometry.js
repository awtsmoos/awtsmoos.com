//B"H
// modules/studio/fx/geometry.js

export function drawBeatRing(g, w, h, bass) {
    if (bass > 0.1) {
        g.save();
        g.beginPath();
        const r = (Math.min(w,h) * 0.2) + bass * 200;
        g.arc(w/2, h/2, r, 0, 6.28);
        g.strokeStyle = `hsl(${180 + bass * 100}, 100%, 50%)`;
        g.lineWidth = (5 + bass * 20) | 0;
        g.globalAlpha = 0.5;
        g.stroke();
        g.restore();
    }
}

export function drawVaporGrid(g, w, h, t) {
    g.save();
    const horizon = h * 0.55;
    const grad = g.createLinearGradient(0, 0, 0, horizon);
    grad.addColorStop(0, '#000000');
    grad.addColorStop(1, '#110022');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, horizon);
    
    g.fillStyle = '#050010';
    g.fillRect(0, horizon, w, h-horizon);
    
    g.beginPath();
    g.strokeStyle = '#d000ff';
    g.lineWidth = 2;
    g.shadowBlur = 10;
    g.shadowColor = '#d000ff';
    
    for(let i=-w; i<w*2; i+=100) {
        g.moveTo(i, h);
        const xAtHorizon = (i - w/2) * 0.1 + w/2; 
        g.lineTo(xAtHorizon, horizon);
    }
    
    const speed = 150;
    const offset = (t * speed) % 100;
    
    for(let z=0; z<20; z++) {
        const p = (z * 100 + offset); 
        const yNorm = (p % 1000) / 1000;
        const yExp = yNorm * yNorm;
        const yScreen = horizon + (yExp * (h-horizon));
        if(yScreen >= horizon && yScreen <= h) {
            g.moveTo(0, yScreen);
            g.lineTo(w, yScreen);
        }
    }
    
    g.stroke();
    g.shadowBlur = 0;
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