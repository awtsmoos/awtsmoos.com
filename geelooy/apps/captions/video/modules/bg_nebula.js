/*
ב"ה
B"H
*/

self.einSofRenderer.renderNebula = function(ctx, settings, res, pal) {
    // 1. The Core (Merkabah Light)
    ctx.globalCompositeOperation = 'lighter';
    const cX = res.width * (Math.random() < 0.5 ? -0.2 : 1.2);
    const cY = res.height * Math.random();
    
    const cG = ctx.createRadialGradient(cX, cY, 0, cX, cY, res.width * 1.5);
    cG.addColorStop(0, self.einSofRenderer.hexToRgba(pal[0], 0.1));
    cG.addColorStop(1, self.einSofRenderer.hexToRgba(pal[0], 0));
    
    ctx.fillStyle = cG;
    ctx.fillRect(0, 0, res.width, res.height);

    // 2. Nebula Clouds
    const blob = (x, y, r, color) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, self.einSofRenderer.hexToRgba(color, 0.4));
        g.addColorStop(0.5, self.einSofRenderer.hexToRgba(color, 0.1));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, res.width, res.height);
    };
    
    const rnd = self.einSofRenderer.random;
    blob(res.width * rnd(0.1, 0.9), res.height * rnd(0.1, 0.9), res.width * rnd(0.5, 0.9), pal[0]);
    blob(res.width * rnd(0.1, 0.9), res.height * rnd(0.1, 0.9), res.width * rnd(0.6, 1.0), pal[1]);
    
    ctx.globalCompositeOperation = 'source-over';
};