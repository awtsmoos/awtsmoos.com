
/**
 * B"H
 * CHAPTER: THE STABILITY OF MALCHUS
 * 
 * The ground is called Malchus, the kingdom. If the kingdom is not positioned 
 * correctly, the subjects (the Chossid) will find no footing. A box of 4 units 
 * height has its center at 0, meaning its surface is at +2. We must lower the 
 * foundation so that the surface meets the zero-point of the universe.
 * 
 * @class GroundRectifier
 */
export class GroundRectifier {
    /**
     * B"H
     * Adjusts the position of a thick ground mesh so its top face is at Y=0.
     * 
     * @param {THREE.Mesh} mesh - The ground mesh to be rectified.
     * @param {number} thickness - The total height (Y-axis) of the box geometry.
     * @returns {void}
     */
    static rectify(mesh, thickness) {
        if (!mesh) return;

        // B"H - The offset is half the thickness, pushing the center down.
        const offset = -(thickness / 2);
        
        mesh.position.y = offset;
        
        console.log(`B"H - ⚓ Ground Rectified. Surface now at 0. Offset applied: ${offset}`);
    }
}
