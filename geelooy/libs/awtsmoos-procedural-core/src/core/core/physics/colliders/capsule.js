
// B"H
import { Vec3 } from '../../math/vec3.js';

export class Capsule {
    /**
     * @param {Array} basePos - [x, y, z] of the bottom sphere center.
     * @param {Array} topPos - [x, y, z] of the top sphere center.
     * @param {number} radius - The radius of the capsule.
     */
    constructor(basePos, topPos, radius) {
        this.base = basePos;
        this.top = topPos;
        this.radius = radius;
    }

    /**
     * Updates the capsule's position based on a bottom-center position and height.
     * Useful for characters where 'pos' is at the feet.
     */
    setFromPosition(pos, height, radius) {
        this.radius = radius;
        // Base is radius up from feet (so sphere touches ground at pos.y)
        this.base = [pos[0], pos[1] + radius, pos[2]];
        // Top is height - radius up from feet
        this.top = [pos[0], pos[1] + height - radius, pos[2]];
    }

    getCenter() {
        return Vec3.scale(Vec3.add(this.base, this.top), 0.5);
    }

    getHeight() {
        return Vec3.dist(this.base, this.top) + (2 * this.radius);
    }
}
