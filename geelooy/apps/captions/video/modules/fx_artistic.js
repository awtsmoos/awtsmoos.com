/*
ב"ה
B"H
*/

self.einSofRenderer.applyArtisticFX = function(ctx, settings, res) {
    
    // New Feature: Sepia Tone
    if (settings.enableSepia) {
        ctx.save();
        ctx.fillStyle = 'rgba(112, 66, 20, 0.4)'; // Sepia brown
        ctx.globalCompositeOperation = 'color'; // Blend mode
        ctx.fillRect(0, 0, res.width, res.height);
        ctx.restore();
    }

    // Vignette
    if (settings.enableVignette) {
        const g = ctx.createRadialGradient(res.width/2, res.height/2, res.width/3, res.width/2, res.height/2, res.width);
        g.addColorStop(0, 'transparent');
        g.addColorStop(1, 'rgba(0,0,0,0.8)');
        ctx.fillStyle = g;
        ctx.fillRect(0,0,res.width,res.height);
    }

    // Feature: Cinematic Bars
    if (settings.cinematicBarHeight > 0) {
        const h = (res.height * settings.cinematicBarHeight) / 100;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, res.width, h);
        ctx.fillRect(0, res.height - h, res.width, h);
    }

    // New Feature: Simple Border
    if (settings.enableSimpleBorder) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 20;
        ctx.strokeRect(0, 0, res.width, res.height);
    }
};