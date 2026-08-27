/*
ב"ה
B"H
*/

self.einSofRenderer.generateBg = function(settings, res, bitmaps, time = 0) {
    const canvas = new OffscreenCanvas(res.width, res.height);
    const ctx = canvas.getContext('2d');
    
    // Generate Palette once
    const baseColor = settings.regeneratePaletteColor || settings.basePaletteColor || '#8A2BE2';
    const palette = this.generatePalette(6, baseColor);
    
    // 1. Base Layer (Image or Deep Space)
    const bgImg = (bitmaps && bitmaps.length > 0) ? bitmaps[0] : null;
    
    if (bgImg instanceof ImageBitmap) {
        // Render Static Image
        this.renderBgImage(ctx, bgImg, settings, res);
    } else {
        // Render Procedural Space
        this.renderDeepSpace(ctx, settings, res); // From bg_deepspace.js
        this.renderNebula(ctx, settings, res, palette); // From bg_nebula.js
    }

    // 2. Portals (Floating images)
    // Pass bitmaps[1+] to portals
    if (bitmaps && bitmaps.length > 1) {
        this.renderPortals(ctx, bitmaps.slice(1), settings, res, time);
    }

    return { canvas, palette };
};

self.einSofRenderer.renderBgImage = function(ctx, img, settings, res) {
    const rC = img.width / img.height;
    const rR = res.width / res.height;
    let tw = res.width, th = res.height;
    
    if (rC > rR) tw = res.height * rC; else th = res.width / rC;
    
    ctx.save();
    ctx.globalAlpha = (settings.backgroundOpacity !== undefined) ? settings.backgroundOpacity : 1.0;
    ctx.drawImage(img, (res.width - tw) / 2, (res.height - th) / 2, tw, th);
    ctx.restore();
};