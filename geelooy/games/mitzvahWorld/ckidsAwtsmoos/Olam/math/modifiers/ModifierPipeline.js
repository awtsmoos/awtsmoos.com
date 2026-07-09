
/**
 * B"H
 * @module ModifierPipeline
 * @description
 * "And He formed it according to its measurements."
 * A robust system to apply a sequence of modifiers to BufferGeometries.
 * Similar to Blender's modifier stack, but operating entirely in the Awtsmoos reality.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import ArrayModifier from "./ArrayModifier.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import MirrorModifier from "./MirrorModifier.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import TwistModifier from "./TwistModifier.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import DisplaceModifier from "./DisplaceModifier.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class ModifierPipeline {
    /**
     * Applies an array of modifier definitions to a base geometry.
     * @param {THREE.BufferGeometry} geometry - The original unformed vessel.
     * @param {Array<Object>} modifiers - Sequence of instructions.
     * @returns {THREE.BufferGeometry} The fully modified vessel.
     */
    static apply(geometry, modifiers) {
        if (!geometry || !modifiers || !Array.isArray(modifiers) || modifiers.length === 0) {
            return geometry;
        }

        let currentGeo = geometry.clone();

        for (const mod of modifiers) {
            try {
                switch(mod.type.toLowerCase()) {
                    case 'array':
                    case 'gematria':
                    case 'radial':
                        currentGeo = ArrayModifier.apply(currentGeo, mod);
                        break;
                    case 'mirror':
                        currentGeo = MirrorModifier.apply(currentGeo, mod);
                        break;
                    case 'twist':
                        currentGeo = TwistModifier.apply(currentGeo, mod);
                        break;
                    case 'displace':
                        currentGeo = DisplaceModifier.apply(currentGeo, mod);
                        break;
                    default:
                        console.warn(`B"H - Unknown modifier type: ${mod.type}`);
                }
            } catch (e) {
                console.error(`B"H - Modifier [${mod.type}] shattered during execution:`, e);
            }
        }

        currentGeo.computeVertexNormals();
        currentGeo.computeBoundingBox();
        currentGeo.computeBoundingSphere();
        return currentGeo;
    }
}
