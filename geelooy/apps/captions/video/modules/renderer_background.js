/*
ב"ה
B"H
*/

self.einSofRenderer.generateBg = function(settings, res, bitmaps, time = 0) {
    const canvas = new OffscreenCanvas(res.width, res.height);
    const ctx = canvas.getContext('2d');
    const palette = this.generatePalette(6, settings.regeneratePaletteColor || settings.basePaletteColor || '#8A2BE2');
    
    // Image Background Logic
    const bgImg = bitmaps && bitmaps.length > 0 ? bitmaps[0] : null;
    if (bgImg instanceof ImageBitmap) {
        const rC = bgImg.width / bgImg.height;
        const rR = res.width / res.height;
        let tw = res.width, th = res.height;
        if (rC > rR) tw = res.height * rC; else th = res.width / rC;
        
        ctx.save();
        ctx.globalAlpha = settings.backgroundOpacity ?? 1.0;
        ctx.drawImage(bgImg, (res.width - tw) / 2, (res.height - th) / 2, tw, th);
        ctx.restore();
    } else {
        this.renderNebulaBg(ctx, settings, res, palette);
    }

    // New Feature 7: Portal Blend Modes
    // Use bitmaps 1+ for portals
    if (bitmaps && bitmaps.length > 1) {
        const portals = bitmaps.slice(1);
        portals.forEach(img => {
            const scale = 0.3;
            const pw = img.width * scale;
            const ph = img.height * scale;
            const x = Math.random() * (res.width - pw);
            const y = Math.random() * (res.height - ph);
            
            ctx.save();
            ctx.globalCompositeOperation = 'exclusion'; // FEATURE 7: Ghostly effect
            ctx.globalAlpha = 0.6;
            ctx.translate(x + pw/2, y + ph/2);
            ctx.rotate(time / 1000);
            ctx.drawImage(img, -pw/2, -ph/2, pw, ph);
            ctx.restore();
        });
    }

    return { canvas, palette };
};

self.einSofRenderer.renderNebulaBg = function(ctx, settings, res, pal) {
    const grad = ctx.createLinearGradient(0, 0, 0, res.height);
    grad.addColorStop(0, '#050510'); grad.addColorStop(1, '#000');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, res.width, res.height);
    
    // Simple stars
    for (let i = 0; i < 500; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5})`;
        ctx.fillRect(Math.random() * res.width, Math.random() * res.height, 2, 2);
    }
};