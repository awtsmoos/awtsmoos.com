/*
ב"ה
B"H
*/

self.einSofRenderer.applyFX = function(ctx, settings, res, time = 0) {
    // 1. Analog Effects (Noise, CRT, Scanlines)
    this.applyAnalogFX(ctx, settings, res, time);
    
    // 2. Optical Effects (Aberration, Mirror, Distortion)
    this.applyOpticsFX(ctx, settings, res, time);

    // 3. Artistic Effects (Sepia, Vignette, Borders)
    this.applyArtisticFX(ctx, settings, res);
};