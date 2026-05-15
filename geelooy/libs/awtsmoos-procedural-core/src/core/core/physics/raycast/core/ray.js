
/**
 * B"H
 * THE KAV (THE LINE OF INFINITE LIGHT)
 * 
 * Chapter: The Pure Intent
 * Before form, there was the line of Light drawn into the vacated space.
 * This class holds only the Origin (the Source) and the Direction (the Will).
 * It is stripped of all other earthly concerns.
 * 
 * @class Ray
 */
export class Ray {
    /**
     * B"H
     * Manifests the intent into a vector of reality.
     * @param {Array<number>} origin - [x,y,z] The Eye of the Beholder.
     * @param {Array<number>} direction - [x,y,z] The normalized path of Will.
     */
    constructor(origin = [0, 0, 0], direction = [0, 0, -1]) {
        this.origin = [...origin];
        this.direction = [...direction];
    }
}
