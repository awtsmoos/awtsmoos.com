
// B"H
/**
 * @file coordinateMapper.js
 * @brief PERFECT NDC MAPPING - NO MORE MOUSE OFFSET
 */

export class CoordinateMapper {
    /**
     * B"H - Maps INTERNAL buffer pixel coordinates to NDC [-1, 1].
     * Now receives already-scaled x,y from _getRay (guaranteed correct).
     */
    static screenToNdc(x, y, width, height) {
        return [
            (x / width) * 2.0 - 1.0,
            1.0 - (y / height) * 2.0
        ];
    }
}
