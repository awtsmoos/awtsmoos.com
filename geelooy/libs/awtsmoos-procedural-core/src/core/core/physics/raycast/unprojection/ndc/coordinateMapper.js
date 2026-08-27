
// B"H
/**
 * @file coordinateMapper.js
 * @brief Center the user's intent in the zero-point of perception.
 */

export class CoordinateMapper {
    /**
     * B"H - Maps screen pixel X,Y to [-1, 1] range.
     */
    static screenToNdc(x, y, width, height) {
        return [
            (x / width) * 2.0 - 1.0,
            1.0 - (y / height) * 2.0
        ];
    }
}
