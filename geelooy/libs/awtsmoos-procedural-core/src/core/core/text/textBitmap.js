
// B"H
/**
 * @file textBitmap.js
 * @brief Renders text to an internal canvas to capture its raw essence (pixels).
 */

export function generateTextBitmap(text, fontSize = 400, fontFamily = 'sans-serif') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // 1. Measure
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    const width = Math.ceil(metrics.width);
    const height = Math.ceil(fontSize * 1.5); // Generous padding

    // 2. Resize
    canvas.width = width + 40; 
    canvas.height = height + 40;
    
    // 3. Clear (Void)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 4. Draw (Matter)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    // Center text
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    return {
        data: imageData.data,
        width: canvas.width,
        height: canvas.height
    };
}
