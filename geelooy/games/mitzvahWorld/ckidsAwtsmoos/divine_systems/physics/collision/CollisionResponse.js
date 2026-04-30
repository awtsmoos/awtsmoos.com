
// B"H
/**
 * @class CollisionResponse
 * @description
 * 🛡️ THE SHIELD OF GEVURAH 🛡️
 * 
 * When a moving force meets an immovable object, the force must slide along the plane.
 * This computes the orthogonal slide vector from the collision normal.
 */
export default class CollisionResponse {
    /**
     * @method calculateSlide
     * @param {Object} velocity - Vector3
     * @param {Object} normal - Vector3
     * @returns {void} Mutates the velocity vector
     */
    static calculateSlide(velocity, normal) {
        // Dot product reveals the magnitude of force pushing INTO the wall
        const dot = velocity.x * normal.x + velocity.y * normal.y + velocity.z * normal.z;
        
        // If moving towards the wall, subtract that component to slide along it
        if (dot < 0) {
            velocity.x -= normal.x * dot;
            velocity.y -= normal.y * dot;
            velocity.z -= normal.z * dot;
        }
    }
}
