/*
ב"ה
B"H
*/

self.einSofRenderer.generateBg = function(settings, res, bitmaps, time = 0) {
    const canvas = new OffscreenCanvas(res.width, res.height);
    const ctx = canvas.getContext('2d');
    const palette = this.generatePalette(6, settings.regeneratePaletteColor || settings.basePaletteColor || '#8A2BE2');
    
    // 1. BACKGROUND LAYER
    // We expect the MAIN thread to pass the background image as the FIRST item in bitmaps
    // IF the user selected one. If not, we render Nebula.
    // The Main thread logic (which I can't see but must infer) usually pushes BG first if active.
    
    let hasBgImage = false;
    
    // Check if we have a bitmap designated for BG
    // We assume index 0 is BG if settings.backgroundImageURL was set in main thread (inferred)
    // Or we just check if bitmaps exist.
    if (bitmaps && bitmaps.length > 0) {
        // We use the first bitmap as background ONLY if it's large/aspect-ratio appropriate
        // OR if we treat index 0 strictly as BG. 
        // Let's treat index 0 as BG for safety based on your previous "actual image background" request.
        
        const bgImg = bitmaps[0];
        if (bgImg instanceof ImageBitmap) {
            hasBgImage = true;
            
            // "Cover" logic
            const rC = bgImg.width / bgImg.height;
            const rR = res.width / res.height;
            let tw = res.width, th = res.height;
            
            if (rC > rR) {
                tw = res.height * rC; 
            } else {
                th = res.width / rC;
            }
            
            ctx.save();
            ctx.globalAlpha = (settings.backgroundOpacity !== undefined) ? settings.backgroundOpacity : 1.0;
            ctx.drawImage(bgImg, (res.width - tw) / 2, (res.height - th) / 2, tw, th);
            ctx.restore();
        }
    }

    if (!hasBgImage) {
        this.renderNebulaBg(ctx, settings, res, palette);
    }

    // 2. PORTAL LAYER (Floating Images)
    // If we used [0] for BG, portals are [1] onwards.
    // If no BG image was used (array empty), no portals.
    // If user loaded images but didn't want BG, main thread logic handles that. 
    // Here we assume: bitmaps[0] = BG, bitmaps[1+] = Portals
    
    if (bitmaps && bitmaps.length > 1) {
        const portals = bitmaps.slice(1);
        
        portals.forEach((img, index) => {
            // Random-ish but deterministic movement based on time
            const seed = (index + 1) * 1000;
            const t = time + seed;
            
            const scale = 0.2 + (Math.sin(t / 2000) * 0.05); // Pulsing
            const pw = img.width * scale;
            const ph = img.height * scale;
            
            // Circular motion
            const cx = res.width / 2;
            const cy = res.height / 2;
            const radius = res.height * 0.3;
            
            const x = cx + Math.cos(t / 3000) * radius - (pw / 2);
            const y = cy + Math.sin(t / 2500) * radius - (ph / 2);
            
            ctx.save();
            ctx.globalCompositeOperation = 'lighten'; // Blend mode for portals
            ctx.globalAlpha = 0.8;
            
            ctx.translate(x + pw/2, y + ph/2);
            ctx.rotate(t / 4000); // Slow rotation
            ctx.drawImage(img, -pw/2, -ph/2, pw, ph);
            
            ctx.restore();
        });
    }

    return { canvas, palette };
};

self.einSofRenderer.renderNebulaBg = function(ctx, settings, res, pal) {
    const grad = ctx.createLinearGradient(0, 0, 0, res.height);
    grad.addColorStop(0, '#050510'); 
    grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad; 
    ctx.fillRect(0, 0, res.width, res.height);
    
    // Stars
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 300; i++) {
        if (Math.random() > 0.95) {
            const x = Math.random() * res.width;
            const y = Math.random() * res.height;
            const size = Math.random() * 2;
            ctx.globalAlpha = Math.random();
            ctx.fillRect(x, y, size, size);
        }
    }
    ctx.globalAlpha = 1.0;
    
    // Nebula Clouds (Simple Gradient Blobs)
    ctx.globalCompositeOperation = 'screen';
    const blob = (x, y, color, r) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, color);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, res.width, res.height);
    };
    
    blob(res.width * 0.2, res.height * 0.3, self.einSofRenderer.hexToRgba(pal[0], 0.2), res.width * 0.5);
    blob(res.width * 0.8, res.height * 0.7, self.einSofRenderer.hexToRgba(pal[1], 0.2), res.width * 0.6);
    
    ctx.globalCompositeOperation = 'source-over';
};