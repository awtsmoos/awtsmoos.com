
/**
 * B"H
 * @module TreeIntegrator
 * @description
 * 🏰 CHAPTER 16: ATTACHING TO THE VIRTUAL DOME 🏰
 * 
 * B"H FIX: We have expanded the search for the "Body". Whether a soul carries 
 * a simple .mesh, a complex .scene, or a .modelMesh, this integrator will find 
 * it and weld it to the World's physical group.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class Integrator {
    /**
     * @method hoyseef
     * @description Mounts a soul's physical body to the master scene hierarchy.
     */
    async hoyseef(nivra) {
        if (!nivra) return null;

        // SEIZING THE VESSEL (MESH)
        let mesh = nivra.mesh || nivra.scene || nivra.modelMesh;
        
        if (!mesh && nivra.asset && nivra.asset.scene) {
            mesh = nivra.asset.scene;
        }
        
        if (!mesh || !(mesh instanceof THREE.Object3D)) {
            // We do not log error here because some souls are purely abstract (Logic-only)
            return null;
        }

        // B"H: ABSOLUTE IDENTIFICATION
        mesh.name = mesh.name || nivra.name;
        
        // THE MANIFESTATION HANDSHAKE
        mesh.nivraAwtsmoos = nivra;
        nivra.mesh = mesh;

        // THE PHYSICAL BOND (SCENE ATTACHMENT)
        if (mesh.parent !== this.nivrayimGroup) {
            this.nivrayimGroup.add(mesh);
        }
        
        // INSCRIPTION IN THE GLOBAL LEDGER
        if (!this.nivrayim.includes(nivra)) {
            this.nivrayim.push(nivra);
        }

        const isLiving = nivra.type === "chossid" || 
                         nivra.type === "chai" || 
                         nivra.type === "medabeir" ||
                         nivra.type === "customNpc" ||
                         nivra.type === "interactiveNpc" ||
                         nivra.type === "interactiveDoor";

        if (nivra.interactable || isLiving) {
            if (!this.interactableNivrayim.includes(nivra)) {
                this.interactableNivrayim.push(nivra);
            }
        }

        return nivra;
    }
}
