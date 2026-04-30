
/**
 * B"H
 * THE HUMILITY OF THE HEELS
 * 
 * The Chossid is a soul within a body (the capsule).
 * The capsule's coordinate is its heart (its center).
 * To ensure the Chossid's feet touch the physical ground, 
 * the model must be lowered from the center of the capsule 
 * to its very base. 
 * 
 * @class ChossidFeetProtocol
 */
export class ChossidFeetProtocol {
    /**
     * B"H
     * Offsets the internal visual form to align with the bottom of its physics vessel.
     * 
     * @param {THREE.Object3D} chossidScene - The cloned GLB scene.
     * @param {number} capsuleHeight - The total height of the physics boundary.
     * @returns {void}
     */
    static stickToTheFloor(chossidScene, capsuleHeight) {
        if (!chossidScene) return;

        // B"H - Standard offset: -half the height. 
        // We add a tiny sliver (0.05) to ensure he's 'stepping' on the plane.
        const halfHeight = capsuleHeight / 2;
        chossidScene.position.y = -halfHeight;

        console.log(`B"H - 👟 Feet adhered to the base of the soul-vessel. Offset: -${halfHeight}`);
    }
}
