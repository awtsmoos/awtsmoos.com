
import { PixelLetters } from '../data/PixelLetters.js';

/**
 * B"H
 * Yesod serves as the foundation. The Sefirah that unites structure
 * into Malchut. Interprets ancient Strings into vibrant physical canvases,
 * creating Sefirotic digital realities.
 */
export class PixelArchitect {
    static MaterializedBuffers = {};

    /** Recursively instantiates strings deeply utilizing dictionary codes mapping. */
    static instantiateCreationBanks(ColorAlphabetMap) {
        Object.entries(PixelLetters).forEach(([sparkID, asciiArray]) => {
            const rowCount = asciiArray.length;
            const colCount = asciiArray[0].length;
            const cvs = document.createElement('canvas');
            cvs.width = colCount; cvs.height = rowCount;
            const tC = cvs.getContext('2d');
            
            for(let y=0; y<rowCount; y++) {
                for(let x=0; x<colCount; x++) {
                    const chr = asciiArray[y][x];
                    const rawClr = ColorAlphabetMap[chr];
                    if (rawClr && rawClr !== 'transparent') {
                        tC.fillStyle = rawClr;
                        tC.fillRect(x, y, 1, 1);
                    }
                }
            }
            this.MaterializedBuffers[sparkID] = cvs;
        });
    }

    static fetchSpark(id) {
        return this.MaterializedBuffers[id] || null;
    }
}
