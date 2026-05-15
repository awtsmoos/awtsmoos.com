
// B"H
/**
 * @file coordinates.js
 * @brief Logic for mapping earthly pixels to mathematical dimensions.
 * 
 * THE PSALM OF THE CENTERED POINT:
 * From the top-left corner of the screen,
 * To the center of the world, rarely seen!
 * We map the X from left to right,
 * and flip the Y to reach the height!
 * Between negative one and positive one,
 * the work of the Tzimtzum is finally done.
 */

export class CoordinateMapping {
    /**
     * B"H - Converts raw mouse/pixel coordinates to NDC.
     * @param {number} x - Client X
     * @param {number} y - Client Y
     * @param {number} w - Canvas width
     * @param {number} h - Canvas height
     * @returns {Array<number>} [nx, ny]
     */
    static toNDC(x, y, w, h) {
        return [
            (x / w) * 2.0 - 1.0,
            1.0 - (y / h) * 2.0
        ];
    }
}
