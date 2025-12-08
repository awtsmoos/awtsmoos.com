/*
ב"ה
B"H
*/

self.einSofRenderer.renderDeepSpace = function(ctx, settings, res) {
    // 1. Void Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, res.height);
    bgGrad.addColorStop(0, '#0A0814');
    bgGrad.addColorStop(1, '#000000');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, res.width, res.height);

    // 2. Space Dust (Atmosphere)
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 4; i++) {
        const dX = res.width * Math.random();
        const dY = res.height * Math.random();
        const dR = res.width * self.einSofRenderer.random(0.4, 0.8);
        
        const g = ctx.createRadialGradient(dX, dY, 0, dX, dY, dR);
        g.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
        g.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, res.width, res.height);
    }

    // 3. Stars (Distant)
    for (let i = 0; i < 1500; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.3})`;
        ctx.fillRect(Math.random() * res.width, Math.random() * res.height, 1, 1);
    }
    
    // 4. Stars (Bright)
    for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`;
        ctx.fillRect(Math.random() * res.width, Math.random() * res.height, 2, 2);
    }
};