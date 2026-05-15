
// B"H
/**
 * @file ndcTransform.js
 * @brief The Altar of Normalization.
 * 
 * THE PSALM OF THE BOUNDED RATIO:
 * From the raw pixels of the earthly screen,
 * To the perfect balance of the space between!
 * We take the width and height of the earthly frame,
 * And return the coordinates to their holy name.
 * -1 to 1, the scales are drawn,
 * From the dusk of the pixel to the mathematical dawn.
 */

export class NDCTransform {
    /**
     * B"H - Converts raw screen coordinates into Normalized Device Coordinates.
     * 
     * @param {number} x - Raw horizontal pixel.
     * @param {number} y - Raw vertical pixel.
     * @param {number} w - Vessel width.
     * @param {number} h - Vessel height.
     * @returns {Object} { nx, ny } in the range of -1 to 1.
     */
    static toNDC(x, y, w, h) {
        return {
            nx: (x / w) * 2.0 - 1.0,
            ny: 1.0 - (y / h) * 2.0
        };
    }
}
