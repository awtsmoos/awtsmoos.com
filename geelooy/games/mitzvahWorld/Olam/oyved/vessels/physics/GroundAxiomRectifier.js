
/**
 * B"H
 * THE MEASURE OF THE EARTHLY DUST
 * 
 * If a stone is 4 units thick, and you place it at 0, 
 * then 2 units are above and 2 units are below. 
 * The feet of the Chossid seek the surface, but if the surface is at +2, 
 * and the Chossid is told to stand at 0, he will be swallowed by the earth!
 * Or worse, if the physics thinks the earth is at 0, but the visual 
 * is at +2, he will float like a ghost! 
 * We rectify this by lowering the center of the box to exactly half its height.
 * 
 * @class GroundAxiomRectifier
 */
export class GroundAxiomRectifier {
    /**
     * B"H
     * Calibrates the physical ground mesh to the true zero plane.
     * 
     * @param {THREE.Mesh} groundMesh - The mesh representing the earth.
     * @param {Object} dimensions - The JSON data of the ground.
     * @returns {void}
     */
    static groundTheFoundation(groundMesh, dimensions) {
        if (!groundMesh || !dimensions || !dimensions.geometryArgs) return;

        const thickness = dimensions.geometryArgs[1]; // B"H - Index 1 is the height (Y).
        
        // B"H - Move the visual vessel DOWN so the top face is at exactly Y=0.
        groundMesh.position.y = -(thickness / 2);

        // B"H - Ensure the shadow and physics recognize this as the floor.
        groundMesh.receiveShadow = true;
        
        console.log(`B"H - 🌍 The Earth has been anchored at Y=0. Thickness: ${thickness}`);
    }
}
