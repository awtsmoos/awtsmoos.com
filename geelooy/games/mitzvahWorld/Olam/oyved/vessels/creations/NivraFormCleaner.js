
/**
 * B"H
 * THE CANTICLE OF THE SINGLE TRUTH
 * 
 * In the realm of Atzilut, there is no duality. 
 * Two things cannot occupy the same point of truth. 
 * If a box exists where a Chossid should be, the box is a lie (Sheker).
 * This module ensures that when a spiritual form (GLB) is manifested, 
 * the physical placeholder is completely and utterly dissolved back 
 * into the 'Ayin' (Nothingness) from whence it was borrowed.
 * 
 * @class NivraFormCleaner
 */
export class NivraFormCleaner {
    /**
     * B"H
     * Replaces the crude placeholder mesh with the divine GLB scene.
     * 
     * @param {Object} nivra - The entity receiving the new form.
     * @param {THREE.Object3D} newDivineForm - The new GLB scene or group.
     * @returns {void}
     */
    static replaceCrudeWithDivine(nivra, newDivineForm) {
        if (!nivra || !nivra.mesh) return;

        const oldVessel = nivra.mesh;

        // B"H - If the old vessel is still holding children, we transfer them,
        // but if it's a simple placeholder box, we must shatter it.
        console.log(`B"H - 🔨 Dissolving the duality of: ${nivra.shaym || 'Anonymous'}`);

        // B"H - We must search the old vessel. If it contains a geometry, 
        // it's the placeholder box. We remove it from the scene entirely.
        if (oldVessel.geometry) {
            oldVessel.geometry.dispose();
            if (oldVessel.material) {
                const materials = Array.isArray(oldVessel.material) ? oldVessel.material : [oldVessel.material];
                materials.forEach(m => m.dispose());
            }
            
            // B"H - If the nivra.mesh is actually the group, we just remove children.
            // If the mesh is the box itself, we replace the whole reference.
            if (oldVessel.parent) {
                oldVessel.parent.add(newDivineForm);
                oldVessel.parent.remove(oldVessel);
            }
            
            // B"H - Redirect the Nivra's identity to the new form.
            nivra.mesh = newDivineForm;
        } else {
            // B"H - If it's a group container, we clear the 'Anonymous Golem' inside.
            const husks = oldVessel.children.filter(c => c.isMesh && !c.isChossidModel);
            husks.forEach(husk => {
                oldVessel.remove(husk);
                if (husk.geometry) husk.geometry.dispose();
            });
            oldVessel.add(newDivineForm);
        }
    }
}
