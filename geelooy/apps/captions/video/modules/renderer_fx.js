/*
ב"ה
B"H
*/

self.einSofRenderer.applyFX = function(ctx, settings, res) {
    
    // Feature 2: Cinematic Letterboxing
    if (settings.cinematicBarHeight > 0) {
        const h = (res.height * settings.cinematicBarHeight) / 100;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, res.width, h);
        ctx.fillRect(0, res.height - h, res.width, h);
    }

    // Feature 5: Radial Chromatic Aberration
    if (settings.enableChromaticAberration) {
        const id = ctx.getImageData(0, 0, res.width, res.height);
        const d = id.data;
        const cx = res.width / 2;
        const cy = res.height / 2;
        
        // Copy buffer
        const copy = new Uint8ClampedArray(d);
        
        for (let y = 0; y < res.height; y++) {
            for (let x = 0; x < res.width; x++) {
                const dx = x - cx;
                const dy = y - cy;
                const dist = Math.sqrt(dx*dx + dy*dy);
                // Offset increases with distance from center
                const offset = Math.floor(dist * 0.02); 
                
                const i = (y * res.width + x) * 4;
                const iR = i + (offset * 4);
                
                if (iR < d.length) d[i] = copy[iR]; // Shift Red channel
            }
        }
        ctx.putImageData(id, 0, 0);
    }

    if (settings.enableScanLines) {
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        for(let y=0; y<res.height; y+=4) ctx.fillRect(0,y,res.width,2);
    }
    
    if (settings.enableVignette) {
        const g = ctx.createRadialGradient(res.width/2, res.height/2, res.width/3, res.width/2, res.height/2, res.width);
        g.addColorStop(0, 'transparent');
        g.addColorStop(1, 'rgba(0,0,0,0.8)');
        ctx.fillStyle = g;
        ctx.fillRect(0,0,res.width,res.height);
    }
};