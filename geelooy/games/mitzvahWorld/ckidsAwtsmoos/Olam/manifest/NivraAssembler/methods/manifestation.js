// B"H
/**
 * @file manifestation.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THE BIRTH OF MATTER — Manifestation Logic                               ║
 * ║                                                                          ║
 * ║  "Blessed is He who spoke, and the world came into being."              ║
 * ║                                                                          ║
 * ║  The final stage of the Seder Hishtalshelus, where the data              ║
 * ║  becomes a tangible Nivrah in the World.                                 ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    /**
     * @method processBlueprint
     * @description
     * Iterates through a manifest and spawns all defined entities.
     */
    async processBlueprint(manifest) {
        if (!manifest || !manifest.emanations) return [];

        const spawned = [];
        for (const em of manifest.emanations) {
            const nivrah = await this.manifestEntity(em);
            if (nivrah) spawned.push(nivrah);
        }
        return spawned;
    },

    /**
     * @method manifestEntity
     * @description
     * Spawns a single entity described in the manifest.
     */
    async manifestEntity(entityNode) {
        const type = this.evaluate(entityNode.type);
        if (!type) return null;

        // 1. Resolve raw local position
        const rawPos = this.resolvePosition(entityNode.position);
        const posVec = new THREE.Vector3(rawPos.x, rawPos.y, rawPos.z);

        // 2. Apply parent context if available
        if (this.context.parent) {
            this.applyParentTransform(posVec, this.context.parent);
        }

        // 3. Resolve rotation
        const finalRot = this.resolveRotation(entityNode.rotation, this.context.parent);

        // 4. Resolve parameters (golem, name, etc)
        const name = this.evaluate(entityNode.name || "Nivra");
        const golem = this.evaluate(entityNode.golem || {});
        
        // 5. THE SACRED BRIYAH (Creation)
        const op = {
            ...entityNode, // Keep any raw flags
            name,
            type,
            position: { x: posVec.x, y: posVec.y, z: posVec.z },
            rotation: finalRot,
            golem
        };

        const result = await this.olam.addObject(type, op);
        
        // 6. RECURSIVE EMANATION
        // If this entity has its own sub-emanations, process them as well.
        if (entityNode.emanations) {
            const subAssembler = new this.constructor(this.olam, { 
                ...this.context, 
                parent: result 
            });
            await subAssembler.processBlueprint({ emanations: entityNode.emanations });
        }

        return result;
    }
};
