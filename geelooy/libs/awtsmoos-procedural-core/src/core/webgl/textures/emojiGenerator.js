
// B"H
/**
 * @file emojiGenerator.js
 * @brief Crystallizes the concept of an Emoji into a tangible 2D texture.
 */

export class EmojiGenerator {
    constructor(gl) {
        this.gl = gl;
    }

    generate(emoji, size = 512, style = 'color') {
        console.log(`B"H - EmojiGenerator: Manifesting '${emoji}' (${style})...`);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, size, size);

        ctx.font = `${size * 0.8}px serif`; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (style === 'grayscale') {
            // B"H - Draw in white, using a composite mode that preserves shape but fills color
            // Emojis are pre-colored glyphs. To make them white/grayscale we can:
            // 1. Draw normally
            // 2. Use composite 'source-in' to fill with white?
            // Actually, browser support varies.
            // Reliable trick: Draw emoji, then composite white over non-transparent pixels.
            ctx.fillStyle = '#000000'; // Draw normal (color)
            ctx.fillText(emoji, size / 2, size / 2 + (size * 0.05));
            
            // Tint to white
            ctx.globalCompositeOperation = 'source-in';
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, size, size);
        } else {
            ctx.fillStyle = '#ffffff'; 
            ctx.fillText(emoji, size / 2, size / 2 + (size * 0.05));
        }

        const texture = this.gl.createTexture();
        const gl = this.gl;

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        return texture;
    }
}
