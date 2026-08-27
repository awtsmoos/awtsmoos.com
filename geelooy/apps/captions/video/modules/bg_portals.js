/*
ב"ה
B"H
*/

self.einSofRenderer.renderPortals = function(ctx, portals, settings, res, time) {
    if (!portals || portals.length === 0) return;

    portals.forEach((img, i) => {
        const seed = (i + 1) * 999;
        const t = time + seed;
        
        // Pulsing Scale
        const scale = 0.25 + (Math.sin(t / 2500) * 0.05);
        const pw = img.width * scale;
        const ph = img.height * scale;
        
        // Orbit Logic
        const cx = res.width / 2;
        const cy = res.height / 2;
        const rad = res.height * 0.35;
        const x = cx + Math.cos(t / 4000) * rad - (pw/2);
        const y = cy + Math.sin(t / 3500) * rad - (ph/2);
        
        ctx.save();
        ctx.globalCompositeOperation = 'exclusion'; 
        ctx.globalAlpha = 0.7;
        
        ctx.translate(x + pw/2, y + ph/2);
        ctx.rotate(t / 5000); // Slow rotation
        ctx.drawImage(img, -pw/2, -ph/2, pw, ph);
        
        ctx.restore();
    });
};