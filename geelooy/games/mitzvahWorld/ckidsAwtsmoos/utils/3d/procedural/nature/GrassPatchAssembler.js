
/**
 * B"H
 * @module GrassPatchAssembler
 * @description
 * Spawns a field of grass by cloning and scattering the BladeBuilder's output.
 * Merges them all into one single BufferGeometry so it costs exactly 1 draw call,
 * behaving just like a normal object without needing InstancedMesh complexity here.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import BladeBuilder from "./BladeBuilder.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class GrassPatchAssembler {
    /**
     * @function generate
     * @param {number} radius - How wide the patch spreads.
     * @param {number} count - How many blades in the patch.
     * @returns {THREE.BufferGeometry}
     */
    static generate(radius = 3, count = 200) {
        try {
            const blades = [];
            const baseBlade = BladeBuilder.build();

            for (let i = 0; i < count; i++) {
                const clone = baseBlade.clone();
                
                // Scatter in a circle
                const r = radius * Math.sqrt(Math.random());
                const theta = Math.random() * 2 * Math.PI;
                const x = r * Math.cos(theta);
                const z = r * Math.sin(theta);
                
                clone.translate(x, 0, z);
                
                // Randomly rotate to face different directions
                clone.rotateY(Math.random() * Math.PI * 2);
                
                // Random scale variation
                const s = 0.5 + Math.random() * 0.8;
                clone.scale(s, s, s);

                // Add slight tilt
                clone.rotateX((Math.random() - 0.5) * 0.2);
                clone.rotateZ((Math.random() - 0.5) * 0.2);

                blades.push(clone);
            }

            if (blades.length === 0) throw new Error("No blades created");

            const merged = BufferGeometryUtils.mergeGeometries(blades);
            merged.computeBoundingBox();
            return merged;

        } catch (e) {
            console.error("B\"H - ⚡ GrassPatchAssembler failed.", e);
            const box = new THREE.BoxGeometry(radius, 0.5, radius);
            box.translate(0, 0.25, 0);
            return box;
        }
    }
}
