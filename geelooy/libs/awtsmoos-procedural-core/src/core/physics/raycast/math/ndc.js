
// B"H
/**
 * @file ndc.js
 * @brief Coordinate Tzimtzum (Contraction).
 * 
 * THE PSALM OF THE CENTERED POINT:
 * From the top-left pixel of earthly hardware,
 * to the mathematical center where the Light is drawn.
 * X is mapped left to right, Y is flipped bottom to top,
 * centering the will of the user in the zero-point of perception.
 */

export class NDC {
    /**
     * B"H - Maps earthly pixels into the range [-1, 1].
     * @param {number} x - Pixel X coordinate.
     * @param {number} y - Pixel Y coordinate.
     * @param {number} width - Canvas Width.
     * @param {number} height - Canvas Height.
     * @returns {Array<number>} [nx, ny]
     */
    static fromScreen(x, y, width, height) {
        return [
            (x / width) * 2.0 - 1.0,
            1.0 - (y / height) * 2.0
        ];
    }
}
