
import { PixelLetters } from '../data/PixelLetters.js';
import { OtiotToColor } from '../data/PixelAlphabet.js';

/**
 * B"H
 * @chapter The Loom of Bezalel
 * @description
 * In the Tabernacle, the weaver mixed the threads of gold, blue, 
 * and purple to create the garments of the High Priest. 
 * Here, in the realm of Yesod (Foundation), the PixelWeaver 
 * takes the 'threads' of ASCII characters and the 'dyes' of 
 * the Color Palette to create the Image Buffers for our hero, 
 * the sages, and the trees.
 * 
 * Every string of letters is a unique manifestation of the 
 * Divine Word, rendered now for the mortal eye to perceive.
 */
export class PixelWeaver {
    /** @type {Object<string, HTMLCanvasElement>} A cache of pre-rendered vessels. */
    static _shrine = {};

    /**
     * Awakens the entire library of forms into graphical existence.
     */
    static manifestAll() {
        console.log("B\"H - The PixelWeaver is spinning the garments of light...");
        Object.entries(PixelLetters).forEach(([id, matrix]) => {
            this._shrine[id] = this.weave(matrix);
        });
    }

    /**
     * Retrieves a pre-rendered canvas for a specific ID.
     * @param {string} id - The ID of the Otiyah/Sprite.
     * @returns {HTMLCanvasElement|null}
     */
    static fetch(id) {
        return this._shrine[id] || null;
    }

    /**
     * Internal weaving logic to convert a matrix to a canvas.
     * @private
     * @param {string[]} matrix 
     * @returns {HTMLCanvasElement}
     */
    static weave(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        
        const cvs = document.createElement('canvas');
        cvs.width = cols;
        cvs.height = rows;
        const ctx = cvs.getContext('2d');

        matrix.forEach((row, y) => {
            [...row].forEach((otiyah, x) => {
                const color = OtiotToColor[otiyah];
                if (color && color !== 'transparent') {
                    ctx.fillStyle = color;
                    // Painting one 'cell' of reality
                    ctx.fillRect(x, y, 1, 1);
                }
            });
        });

        return cvs;
    }
}
