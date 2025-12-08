./*
ב"ה
B"H
*/

self.einSofRenderer.renderText = function(ctx, pText, sText, settings, res, pal, cache) {
    
    // Feature 4: Text Glitch
    const applyGlitch = (txt) => {
        if (!settings.enableTextGlitch || Math.random() > 0.1) return txt;
        return txt.split('').map(c => Math.random() > 0.9 ? String.fromCharCode(33 + Math.random()*60) : c).join('');
    };

    const drawBox = (txt, isPrimary) => {
        if (!txt) return;
        const finalTxt = applyGlitch(txt); // Glitch applied here
        
        // Cache lookup uses original text to find box dims, but we draw glitched text
        const entry = cache.get(txt); 
        if (!entry) return;

        const box = isPrimary ? entry.primaryBox : entry.secondaryBox;
        const { x, y, width, height } = box;
        
        // Box BG
        ctx.fillStyle = self.einSofRenderer.hexToRgba(settings.randomizeBoxColorToggle ? pal[4] : '#101018', settings.textBoxOpacity);
        ctx.beginPath(); ctx.roundRect(x, y, width, height, settings.textBoxBorderRadius); ctx.fill();

        // Text
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Auto-sizing logic assumed pre-calced or simplified here:
        ctx.font = `bold ${height/3}px sans-serif`; 
        ctx.fillText(finalTxt, x + width/2, y + height/2);
    };

    drawBox(pText, true);
    if (sText) drawBox(sText, false);
};

self.einSofRenderer.cacheOverlays = async function(data, settings, res) {
    // Simplified caching mock
    const cache = new Map();
    const all = [...data.primary, ...data.translation];
    all.forEach(c => {
        // Calculate box layout once
        const w = res.width * (settings.textBoxWidth/100);
        const h = res.height * (settings.textBoxHeight/100);
        cache.set(c.text, {
            primaryBox: { x: (res.width-w)/2, y: (res.height-h)/2, width: w, height: h },
            secondaryBox: { x: (res.width-w)/2, y: res.height-h-20, width: w, height: h }
        });
    });
    return cache;
};