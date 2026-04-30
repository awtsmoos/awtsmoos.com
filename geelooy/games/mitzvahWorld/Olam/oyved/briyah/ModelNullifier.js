
/**
 * B"H
 * CHAPTER: THE REMOVAL OF THE GARMENTS
 * 
 * The "Anonymous Golem" was but a shell, a Klipah (husk) used to hold the space 
 * until the inner soul could be manifest. Once the Light is revealed, the shell 
 * must be discarded, for it has no life of its own. To leave it is to invite 
 * the "Double," a lie that two things exist where there is only one.
 * 
 * This module handles the deletion of placeholder vessels.
 * 
 * @class ModelNullifier
 */
export class ModelNullifier {
    /**
     * B"H
     * Searches for and destroys any placeholder shells within a nivra (entity).
     * 
     * @param {Object} nivra - The entity containing the vessels.
     * @param {string} placeholderName - The name of the husk to be removed (e.g., "Anonymous Golem").
     * @returns {void}
     */
    static nullifyPlaceholder(nivra, placeholderName = "Anonymous Golem") {
        if (!nivra || !nivra.mesh) return;

        // B"H - If the mesh itself is the golem, we replace it.
        // If the golem is a child, we remove it.
        const mesh = nivra.mesh;

        if (mesh.name === placeholderName || mesh.isPlaceholder) {
            console.log(`B"H - 🗑️ Nullifying the husk: ${placeholderName}`);
            
            // B"H - Disconnect it from the scene graph.
            if (mesh.parent) {
                mesh.parent.remove(mesh);
            }

            // B"H - Dispose of its material and geometry to free the light.
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(m => m.dispose());
                } else {
                    mesh.material.dispose();
                }
            }
        }
    }
}
