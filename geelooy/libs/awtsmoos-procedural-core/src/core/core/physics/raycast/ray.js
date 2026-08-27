
// B"H
/**
 * @file ray.js
 * @brief Pure data structure for a 3D Ray.
 * 
 * THE PSALM OF THE STRAIGHT PATH:
 * From the eye of the Master, the arrow is sent,
 * A line of pure energy, with divine intent!
 * Like the Kav (the Ray of Light) that pierced the initial Tzimtzum (Contraction),
 * It starts at a point, it points to the light,
 * Cutting through distance and the veil of the night!
 * It carries no logic, only direction and source,
 * A vessel of data upon an unbending course.
 */

export class Ray {
    /**
     * B"H - Manifests a new Ray of Intent.
     * @param {Array<number>} origin - [x, y, z] The starting point of the emanation.
     * @param {Array<number>} direction - [x, y, z] The normalized direction vector.
     */
    constructor(origin = [0, 0, 0], direction = [0, 0, -1]) {
        this.origin = [...origin];
        this.direction = [...direction];
    }

    /**
     * B"H - Calculates the exact coordinate at distance 't' along the ray.
     * @param {number} t - The distance to travel.
     * @returns {Array<number>} The [x, y, z] coordinate in reality.
     */
    at(t) {
        return [
            this.origin[0] + this.direction[0] * t,
            this.origin[1] + this.direction[1] * t,
            this.origin[2] + this.direction[2] * t
        ];
    }
}
