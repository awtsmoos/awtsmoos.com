
import { NivraFormCleaner } from '../vessels/creations/NivraFormCleaner.js';
import { ChossidFeetProtocol } from '../vessels/alignment/ChossidFeetProtocol.js';
import { GroundAxiomRectifier } from '../vessels/physics/GroundAxiomRectifier.js';

/**
 * B"H
 * CHAPTER: THE UNIFICATION OF THE ELEMENTS
 * 
 * This class serves as the API through which entities are finalized.
 * It combines the physical grounding of the world with the 
 * visual refinement of the Chossid.
 * 
 * @class EntityUpdateSystem
 */
export class EntityUpdateSystem {
    /**
     * B"H
     * Finalizes the Chossid's descent, ensuring no doubles and no floating.
     * 
     * @param {Object} nivra - The entity state.
     * @param {THREE.Object3D} glbScene - The freshly loaded GLB form.
     */
    static finalizeChossid(nivra, glbScene) {
        // 1. B"H - Remove the old box!
        NivraFormCleaner.replaceCrudeWithDivine(nivra, glbScene);
        
        // 2. B"H - Stick feet to the ground!
        const height = nivra.physicsOptions?.height || 40; // Default Chossid height
        ChossidFeetProtocol.stickToTheFloor(glbScene, height);
    }

    /**
     * B"H
     * Finalizes the ground plane alignment.
     * 
     * @param {Object} nivra - The ground entity state.
     */
    static finalizeGround(nivra) {
        if (!nivra.mesh) return;
        GroundAxiomRectifier.groundTheFoundation(nivra.mesh, nivra.ob);
    }
}
