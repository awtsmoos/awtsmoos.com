
/**
 * B"H
 * CHAPTER: THE UNION OF BODY AND SOUL
 * 
 * The Capsule is the physical boundary (Gevurah), and the Model is the visible 
 * form (Tiferet). If they are not aligned, the soul appears to float above the 
 * world. We must pull the model down by exactly half the capsule's height, 
 * so its feet touch the very bottom of the boundary.
 * 
 * @class PhysicalAlignment
 */
export class PhysicalAlignment {
    /**
     * B"H
     * Aligns the visual model with the bottom of the collision capsule.
     * 
     * @param {THREE.Object3D} model - The GLB/Mesh group representing the Chossid.
     * @param {number} capsuleHeight - The total height of the physics capsule.
     * @param {number} [manualOffset=0] - An additional tweak if the model's pivot isn't at its center.
     * @returns {void}
     */
    static alignFeetToBottom(model, capsuleHeight, manualOffset = 0) {
        if (!model) return;

        // B"H - The capsule's position is its center. 
        // To put feet at the bottom, we move the model down by half the height.
        const yAdjustment = -(capsuleHeight / 2) + manualOffset;
        
        model.position.y = yAdjustment;

        console.log(`B"H - 👟 Alignment complete. Model shifted by ${yAdjustment} to meet the ground.`);
    }
}
