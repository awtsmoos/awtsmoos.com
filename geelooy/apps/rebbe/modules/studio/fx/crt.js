//B"H
// modules/studio/fx/crt.js

export function drawCRT(g, w, h, t) {
    g.save();
    
    // Vignette
    const grad = g.createRadialGradient(w/2, h/2, h/3, w/2, h/2, h);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.6)');
    g.fillStyle = grad;
    g.fillRect(0,0,w,h);

    // RGB Subpixel lines
    g.globalCompositeOperation = 'overlay';
    g.fillStyle = 'rgba(255, 0, 0, 0.1)';
    for(let i=0; i<w; i+=3) g.fillRect(i, 0, 1, h);
    g.fillStyle = 'rgba(0, 255, 0, 0.1)';
    for(let i=1; i<w; i+=3) g.fillRect(i, 0, 1, h);
    g.fillStyle = 'rgba(0, 0, 255, 0.1)';
    for(let i=2; i<w; i+=3) g.fillRect(i, 0, 1, h);

    // Scanline drift
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(0,0,0,0.1)';
    const drift = (t * 10) % 2;
    for(let i=0; i<h; i+=2) g.fillRect(0, i+drift, w, 1);

    g.restore();
}