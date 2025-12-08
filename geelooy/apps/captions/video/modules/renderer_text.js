/*
ב"ה
B"H
*/

// Helper: Measure text width
self.einSofRenderer.measureLine = function(ctx, text) {
    return ctx.measureText(text).width;
};

// Helper: Wrap text into lines based on max width
self.einSofRenderer.wrapText = function(ctx, text, maxWidth) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
};

self.einSofRenderer.calculateOptimalLayout = function(ctx, text, boxWidth, boxHeight, fontName) {
    let minSize = 10;
    let maxSize = 200; // Max cap
    
    // FAIL-SAFE INIT: Start with the minimum size result.
    // This ensures if the loop fails to find a "perfect" fit, we still render SOMETHING.
    ctx.font = `bold ${minSize}px ${fontName}`;
    let optimalSize = minSize;
    let optimalLines = this.wrapText(ctx, text, boxWidth);
    
    // Binary search for best fit
    let low = minSize;
    let high = maxSize;

    while (low <= high) {
        const midSize = Math.floor((low + high) / 2);
        ctx.font = `bold ${midSize}px ${fontName}`;
        
        const lines = this.wrapText(ctx, text, boxWidth);
        const lineHeight = midSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        
        // Check if ANY word in the lines exceeds box width (to avoid horizontal overflow)
        const maxLineWidth = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0);

        if (totalHeight <= boxHeight && maxLineWidth <= boxWidth) {
            // It fits! Try larger.
            optimalSize = midSize;
            optimalLines = lines;
            low = midSize + 1;
        } else {
            // Too big.
            high = midSize - 1;
        }
    }

    return {
        fontSize: optimalSize,
        lines: optimalLines,
        lineHeight: optimalSize * 1.2
    };
};

self.einSofRenderer.renderText = function(ctx, pText, sText, settings, res, pal, cache) {
    
    const applyGlitch = (txt) => {
        // Safe check for undefined settings
        if (!settings.enableTextGlitch || Math.random() > 0.05) return txt;
        return txt.split('').map(c => Math.random() > 0.9 ? String.fromCharCode(33 + Math.random() * 90) : c).join('');
    };

    const drawBox = (txt, isPrimary) => {
        if (!txt) return;

        // 1. Get Box Dimensions (Layout)
        const boxW = res.width * (settings.textBoxWidth / 100);
        const boxH = res.height * (settings.textBoxHeight / 100);
        
        let x, y;
        
        if (sText) {
            const gap = 20;
            const dualH = (boxH - gap) / 2;
            x = (res.width - boxW) / 2;
            y = isPrimary ? (res.height - boxH) / 2 : ((res.height - boxH) / 2) + dualH + gap;
        } else {
            x = (res.width - boxW) / 2;
            y = (res.height - boxH) / 2;
        }

        // 2. Draw Box Background
        ctx.save();
        const boxColor = settings.randomizeBoxColorToggle ? pal[4] : '#101018';
        
        // Use standard check for opacity
        const opacity = (settings.textBoxOpacity !== undefined) ? settings.textBoxOpacity : 0.75;
        ctx.fillStyle = self.einSofRenderer.hexToRgba(boxColor, opacity);
        
        // Draw standard rect
        ctx.fillRect(x, y, boxW, boxH);
        
        // Optional Border
        ctx.strokeStyle = pal[2];
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, boxW, boxH);

        // 3. Calculate Text Layout
        const finalTxt = applyGlitch(txt);
        const padding = 20;
        const innerW = boxW - (padding * 2);
        const innerH = boxH - (padding * 2);

        // Safety: Ensure positive dimensions
        if (innerW > 0 && innerH > 0) {
            const layout = this.calculateOptimalLayout(ctx, finalTxt, innerW, innerH, 'sans-serif');

            // 4. Render Lines
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${layout.fontSize}px sans-serif`;
            
            // Text Shadow
            ctx.shadowColor = 'rgba(0,0,0,0.9)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            const totalTextH = layout.lines.length * layout.lineHeight;
            let startY = y + (boxH - totalTextH) / 2 + (layout.lineHeight / 2);

            layout.lines.forEach((line, index) => {
                ctx.fillText(line, x + boxW / 2, startY + (index * layout.lineHeight));
            });
        }
        
        ctx.restore();
    };

    if (pText) drawBox(pText, true);
    if (sText) drawBox(sText, false);
};

// Stub for cache (not used but kept for interface compatibility)
self.einSofRenderer.cacheOverlays = async function(data, settings, res) {
    return new Map();
};