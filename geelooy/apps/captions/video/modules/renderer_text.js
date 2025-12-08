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
    lines.push(currentLine);
    return lines;
};

// Original Logic: Binary Search for Best Font Size
self.einSofRenderer.calculateOptimalLayout = function(ctx, text, boxWidth, boxHeight, fontName) {
    let minSize = 10;
    let maxSize = 200; // Max cap
    let optimalSize = minSize;
    let optimalLines = [];

    // Binary search
    while (minSize <= maxSize) {
        const midSize = Math.floor((minSize + maxSize) / 2);
        ctx.font = `bold ${midSize}px ${fontName}`;
        
        // Try to wrap at this font size
        const lines = this.wrapText(ctx, text, boxWidth);
        const lineHeight = midSize * 1.2; // 1.2 is standard line-height
        const totalHeight = lines.length * lineHeight;

        if (totalHeight <= boxHeight && lines.every(l => ctx.measureText(l).width <= boxWidth)) {
            optimalSize = midSize;
            optimalLines = lines;
            minSize = midSize + 1; // Try bigger
        } else {
            maxSize = midSize - 1; // Too big
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

        // 1. Get Box Dimensions (Layout)
        // We calculate box size based on percentage settings
        const boxW = res.width * (settings.textBoxWidth / 100);
        const boxH = res.height * (settings.textBoxHeight / 100);
        
        let x, y;
        
        if (sText) {
            // Dual Caption Layout
            const gap = 20;
            const dualH = (boxH - gap) / 2;
            x = (res.width - boxW) / 2;
            y = isPrimary ? (res.height - boxH) / 2 : ((res.height - boxH) / 2) + dualH + gap;
        } else {
            // Single Caption Layout
            x = (res.width - boxW) / 2;
            y = (res.height - boxH) / 2;
        }

        // 2. Draw Box Background
        ctx.save();
        const boxColor = settings.randomizeBoxColorToggle ? pal[4] : '#101018';
        ctx.fillStyle = self.einSofRenderer.hexToRgba(boxColor, settings.textBoxOpacity);
        
        // Simple Rect for stability
        ctx.fillRect(x, y, boxW, boxH);
        
        // Optional Border
        ctx.strokeStyle = pal[2];
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, boxW, boxH);

        // 3. Calculate Text Layout (The "Fit" Logic)
        const finalTxt = applyGlitch(txt);
        const padding = 20;
        const innerW = boxW - (padding * 2);
        const innerH = boxH - (padding * 2);

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

        ctx.restore();
    };

    if (pText) drawBox(pText, true);
    if (sText) drawBox(sText, false);
};

// We don't need complex caching for the text content itself anymore since we calculate layout on fly
// But we keep the function signature to not break tasks.js
self.einSofRenderer.cacheOverlays = async function(data, settings, res) {
    return new Map(); // Empty cache, rendering is dynamic
};