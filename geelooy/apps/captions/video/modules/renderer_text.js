/*
ב"ה
B"H
*/

// 1. Define cacheOverlays IMMEDIATELY so it exists even if later code fails
self.einSofRenderer.cacheOverlays = async function(data, settings, res) {
    // We calculate layout dynamically now, so we return an empty map.
    // This function must exist to satisfy the tasks.js interface.
    return new Map();
};

// 2. Helper: Measure text width
self.einSofRenderer.measureLine = function(ctx, text) {
    return ctx.measureText(text).width;
};

// 3. Helper: Wrap text
self.einSofRenderer.wrapText = function(ctx, text, maxWidth) {
    if (!text) return [];
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

// 4. Layout Calculation
self.einSofRenderer.calculateOptimalLayout = function(ctx, text, boxWidth, boxHeight, fontName) {
    let minSize = 10;
    let maxSize = 200; 
    
    // Default safe state
    ctx.font = `bold ${minSize}px ${fontName}`;
    let optimalSize = minSize;
    // Explicit reference to self.einSofRenderer instead of 'this'
    let optimalLines = self.einSofRenderer.wrapText(ctx, text, boxWidth);
    
    let low = minSize;
    let high = maxSize;

    while (low <= high) {
        const midSize = Math.floor((low + high) / 2);
        ctx.font = `bold ${midSize}px ${fontName}`;
        
        const lines = self.einSofRenderer.wrapText(ctx, text, boxWidth);
        const lineHeight = midSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        const maxLineWidth = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0);

        if (totalHeight <= boxHeight && maxLineWidth <= boxWidth) {
            optimalSize = midSize;
            optimalLines = lines;
            low = midSize + 1;
        } else {
            high = midSize - 1;
        }
    }

    return {
        fontSize: optimalSize,
        lines: optimalLines,
        lineHeight: optimalSize * 1.2
    };
};

// 5. Main Render Function
self.einSofRenderer.renderText = function(ctx, pText, sText, settings, res, pal, cache) {
    
    const applyGlitch = (txt) => {
        if (!settings.enableTextGlitch || Math.random() > 0.05) return txt;
        return txt.split('').map(c => Math.random() > 0.9 ? String.fromCharCode(33 + Math.random() * 90) : c).join('');
    };

    const drawBox = (txt, isPrimary) => {
        if (!txt) return;

        // --- Defaults ---
        const pctW = (settings.textBoxWidth !== undefined) ? settings.textBoxWidth : 80;
        const pctH = (settings.textBoxHeight !== undefined) ? settings.textBoxHeight : 30;
        const gap = (settings.textBoxGap !== undefined) ? settings.textBoxGap : 20;
        
        const boxW = res.width * (pctW / 100);
        const boxH = res.height * (pctH / 100);
        
        let x = (res.width - boxW) / 2;
        let y;
        
        if (sText) {
            // Stacked layout for dual captions
            const totalStackHeight = (boxH * 2) + gap;
            const startY = (res.height - totalStackHeight) / 2;
            y = isPrimary ? startY : startY + boxH + gap;
        } else {
            // Centered for single caption
            y = (res.height - boxH) / 2;
        }

        // --- Draw Box ---
        ctx.save();
        const boxColor = settings.randomizeBoxColorToggle ? (pal[4] || '#101018') : '#101018';
        const opacity = (settings.textBoxOpacity !== undefined) ? settings.textBoxOpacity : 0.75;
        
        ctx.fillStyle = self.einSofRenderer.hexToRgba(boxColor, opacity);
        ctx.fillRect(x, y, boxW, boxH);
        
        // Border
        ctx.strokeStyle = pal[2] || '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, boxW, boxH);

        // --- Text Layout ---
        const finalTxt = applyGlitch(txt);
        const padding = 20;
        let innerW = boxW - (padding * 2);
        let innerH = boxH - (padding * 2);
        
        if (innerW < 10) innerW = 10;
        if (innerH < 10) innerH = 10;

        // Explicit reference
        const layout = self.einSofRenderer.calculateOptimalLayout(ctx, finalTxt, innerW, innerH, 'sans-serif');

        // --- Render Text ---
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${layout.fontSize}px sans-serif`;
        
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const totalTextH = layout.lines.length * layout.lineHeight;
        let startY = y + (boxH - totalTextH) / 2 + (layout.lineHeight / 2);

        layout.lines.forEach((line, index) => {
            ctx.fillText(line, x + boxW / 2, startY + (index * layout.lineHeight));
        });

        ctx.restore();
    };

    if (pText) drawBox(pText, true);
    if (sText) drawBox(sText, false);
};