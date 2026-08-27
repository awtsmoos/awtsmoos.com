/*
ב"ה
B"H
*/

self.einSofRenderer.applyOpticsFX = function(ctx, settings, res, time) {
    
    // New Feature: Mirror Mode (Kaleidoscope)
    if (settings.enableMirrorMode) {
        // Capture left half
        const left = ctx.getImageData(0, 0, res.width/2, res.height);
        
        // Save state
        ctx.save();
        // Flip context horizontally
        ctx.translate(res.width, 0);
        ctx.scale(-1, 1);
        // Draw the left half onto the right half (which is now flipped left)
        // Actually, just put image data back? PutImageData ignores transform.
        // We must use drawImage.
        const tempC = new OffscreenCanvas(res.width/2, res.height);
        tempC.getContext('2d').putImageData(left, 0, 0);
        
        ctx.drawImage(tempC, 0, 0);
        ctx.restore();
    }

    // New Feature: RGB Pulse (Dynamic Aberration)
    let abAmount = 0;
    if (settings.enableChromaticAberration) abAmount = 3;
    if (settings.enableRGBPulse) {
        // Pulse between 0 and 10 based on time
        abAmount = Math.abs(Math.sin(time / 500)) * 10;
    }

    if (abAmount > 0) {
        const id = ctx.getImageData(0, 0, res.width, res.height);
        const d = id.data;
        const copy = new Uint8ClampedArray(d);
        
        for (let i = 0; i < d.length; i += 4) {
            const offset = 4 * Math.floor(abAmount); 
            if (i + offset < d.length) {
                d[i] = copy[i + offset]; // Shift Red
            }
        }
        ctx.putImageData(id, 0, 0);
    }
    
    // New Feature: Lens Distortion (Fisheye - Mock)
    if (settings.enableLensDistortion) {
        // True mesh distortion is heavy. We simulate via scaling center.
        ctx.save();
        ctx.translate(res.width/2, res.height/2);
        ctx.scale(1.05, 1.05); // Slight Zoom
        ctx.translate(-res.width/2, -res.height/2);
        ctx.drawImage(ctx.canvas, 0, 0);
        ctx.restore();
    }
};