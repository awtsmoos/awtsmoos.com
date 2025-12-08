/*
ב"ה
B"H
*/

self.einSofRenderer.applyAnalogFX = function(ctx, settings, res, time) {
    
    // New Feature: Analog Noise (Snow)
    if (settings.enableAnalogNoise) {
        const w = res.width;
        const h = res.height;
        const id = ctx.getImageData(0,0,w,h);
        const d = id.data;
        // Optimization: Don't do every pixel, just overlay random gray
        // But for "Snow", we need noise.
        for (let i=0; i<d.length; i+=4) {
            if (Math.random() > 0.9) { // 10% coverage
                const val = Math.random() * 255;
                d[i] = d[i+1] = d[i+2] = val; // Grayscale noise
                // Keep alpha original or blend? Let's just set it lightly
                d[i+3] = 200; 
            }
        }
        ctx.putImageData(id, 0, 0);
    }

    // Scanlines
    if (settings.enableScanLines) {
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        for(let y=0; y<res.height; y+=4) ctx.fillRect(0,y,res.width,2);
    }

    // CRT Curvature (Simulated)
    if (settings.enableCRTCurvature) {
        // Simple scale trick to simulate bulge
        // Real displacement is too slow for CPU canvas in JS
        // We use the border vignetting in FX_Artistic to sell the effect
    }
};