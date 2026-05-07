
/**
 * B"H
 * PixelArchitect: The Weaver of the Garments of Light.
 * 
 * "The world was created with letters." 
 * This module takes the ASCII matrices (the Otiot) and weaves them 
 * into ImageBitmaps (the Begadim/Garments) that can be manifested 
 * on the physical canvas.
 * 
 * @module PixelArchitect
 */
export class PixelArchitect {
    /** 
     * The Holy Color Map. 
     * Each letter represents a divine attribute reflected in color.
     */
    static COLOR_MAP = {
        'B': '#000000', // Border / Gevurah (Limitation)
        'k': '#1a1a1a', // Black hair / Darkness
        '^': '#333333', // Hair highlight
        's': '#ffdbac', // Skin / Chesed (Kindness)
        'd': '#e0ac69', // Shadow skin
        'P': '#ff9999', // Blush / Tiferet (Harmony)
        'e': '#ffffff', // Eyes / White light
        'x': '#000000', // Pupils
        'f': '#8d5524', // Mouth / Deep shadow
        'c': '#f0f0f0', // White clothing / Purity
        'G': '#2e7d32', // Green / Growth
        'z': '#4e342e', // Brown / Earthiness
        'p': '#1565c0', // Blue robe / Wisdom
        'q': '#0d47a1', // Dark blue robe
        'T': '#1b5e20', // Leaves / Netzach
        '1': '#388e3c', // Light leaves
        'O': 'transparent', // Void / Ayin
    };

    /**
     * Translates an ASCII matrix into a drawable Canvas.
     * @param {string[]} matrix 2D array of characters.
     * @param {number} size Pixel size of the output.
     * @returns {HTMLCanvasElement} The manifested vessel.
     */
    static weave(matrix, size = 64) {
        if (!matrix || !matrix.length) return null;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        const pixelSize = size / matrix.length;

        matrix.forEach((row, y) => {
            [...row].forEach((char, x) => {
                const color = this.COLOR_MAP[char];
                if (color && color !== 'transparent') {
                    ctx.fillStyle = color;
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize + 0.5, pixelSize + 0.5);
                }
            });
        });

        return canvas;
    }
}
