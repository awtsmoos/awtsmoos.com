/*
ב"ה
B"H
*/

self.einSofRenderer.measureLine = function(ctx, text) {
    return ctx.measureText(text).width;
};

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
    let maxSize = 200; 
    
    // Fail-safe defaults
    ctx.font = `bold ${minSize}px ${fontName}`;
    let optimalSize = minSize;
    let optimalLines = this.wrapText(ctx, text, boxWidth);
    
    let low = minSize;
    let high = maxSize;

    while (low <= high) {
        const midSize = Math.floor((low + high) / 2);
        ctx.font = `bold ${midSize}px ${fontName}`;
        
        const lines = this.wrapText(ctx, text, boxWidth);
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

self.einSofRenderer.renderText = function(ctx, pText, sText, settings, res, pal, cache) {
    
    const applyGlitch = (txt) => {
        if (!settings.enableTextGlitch || Math.random() > 0.05) return txt;
        return txt.split('').map(c => Math.random() > 0.9 ? String.fromCharCode(33 + Math.random() * 90) : c).join('');
    };

    const drawBox = (txt, isPrimary) => {
        if (!txt) return;

        // 1. Get Box Dimensions (Layout) with STRICT DEFAULTS
        // If settings are missing, default to 80% width/height to ensure visibility
        const pctW = (settings.textBoxWidth !== undefined) ? settings.textBoxWidth : 80;
        const pctH = (settings.textBoxHeight !== undefined) ? settings.textBoxHeight : 30;
        
        const boxW = res.width * (pctW / 100);
        const boxH = res.height * (pctH / 100);
        
        let x, y;
        
        if (sText) {
            const gap = (settings.textBoxGap !== undefined) ? settings.textBoxGap : 20;
            const dualH = (boxH - gap) / 2; // Split height for dual mode
            x = (res.width - boxW) / 2;
            
            // If dual mode, primary is top or bottom? Usually primary on top or split.
            // Let's stack them centered.
            const totalH = (boxH * 2) + gap;
            const startY = (res.height - totalH) / 2;
            
            y = isPrimary ? startY : startY + boxH + gap;
        } else {
            x = (res.width - boxW) / 2;
            y = (res.height - boxH) / 2;
        }

        // 2. Draw Box Background
        ctx.save();
        const boxColor = settings.randomizeBoxColorToggle ? (pal[4] || '#101018') : '#101018';
        const opacity = (settings.textBoxOpacity !== undefined) ? settings.textBoxOpacity : 0.75;
        
        ctx.fillStyle = self.einSofRenderer.hexToRgba(boxColor, opacity);
        
        // Draw Box
        const rad = settings.textBoxBorderRadius || 20;
        // Simple rect fallback if roundRect fails or for speed
        ctx.fillRect(x, y, boxW, boxH);
        
        // Border
        ctx.strokeStyle = pal[2] || '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, boxW, boxH);

        // 3. Calculate Text Layout
        const finalTxt = applyGlitch(txt);
        const padding = 20;
        let innerW = boxW - (padding * 2);
        let innerH = boxH - (padding * 2);
        
        // Sanity check
        if (innerW < 10) innerW = boxW;
        if (innerH < 10) innerH = boxH;

        const layout = this.calculateOptimalLayout(ctx, finalTxt, innerW, innerH, 'sans-serif');

        // 4. Render Lines
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${layout.fontSize}px sans-serif`;
        
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const totalTextH = layout.lines.length * layout.lineHeight;
        // Center text vertically in the box
        let startY = y + (boxH - totalTextH) / 2 + (layout.lineHeight / 2);

        layout.lines.forEach((line, index) => {
            ctx.fillText(line, x + boxW / 2, startY + (index * layout.lineHeight));
        });

        ctx.restore();
    };

    if (pText) drawBox(pText, true);
    if (sText) drawBox(sText, false);
};