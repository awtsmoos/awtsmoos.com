
// B"H
/**
 * @file sceneWalker.js
 * @brief Replaces ScenePicker. Manages broad data orchestrations entirely functionally based.
 * 
 * SEDER HISHTALSHELUS (Chain of Process):
 * It is impossible to pass directly from Kesser down to Malchus.
 * It must descend systematically through Wisdom, Understanding, Kindness, and Justice!
 * The Scene Walker gathers the Light (Ray), pushes it through the Bender, 
 * validates the Broad bounds, probes the Narrow geometry, and extracts Absolute Results!
 */

import { SpaceBender } from './spaceBender.js';
import { BroadphaseChecker } from './broadPhase.js';
import { NarrowphaseChecker } from './narrowPhase.js';
import { BoundingVolume } from './bounds.js';
import { Vec3 } from '../../math/vec3.js';
import { mat4_core } from '../../math/mat4/core.js';

export class SceneWalker {
    /**
     * B"H - Walks through object instances mapping collisions.
     * 
     * @param {Object} ray - World Dimensional analytical Ray.
     * @param {Map|Array} objectMap - Iterable list of all realities.
     * @param {Object} renderer - For querying Time dependencies in animations.
     */
    static pick(ray, objectMap, renderer) {
        let absoluteClosestDist = Infinity;
        let selectedVessel = null;
        let physicalWorldPoint = null;
        
        let logs = [`\nB"H - 👁️ EMANATED OMNISCIENT RAY!\n    Ray.Origin: [${ray.origin.map(n=>n.toFixed(3)).join(', ')}]\n    Ray.Direction: [${ray.direction.map(n=>n.toFixed(3)).join(', ')}]`];

        objectMap.forEach(obj => {
            if (obj.visible === false || (!obj.selectable && !obj.interactive)) return;

            // Generate Broad bounds organically
            if (!obj.bounds) obj.bounds = BoundingVolume.compute(obj.positions);

            let wMat = obj.worldMatrix;
            if (!wMat) {
                // Safeguard lookup for unrendered vessels mapping live timestamps
                const liveSeconds = renderer.startTime ? ((performance.now() - renderer.startTime) / 1000) : 0;
                wMat = renderer.animationManager ? renderer.animationManager.getInterpolatedTransform(obj.id, liveSeconds) : mat4_core.identity();
            }

            // Descend the beam into localized matrices!
            const bendedRay = SpaceBender.worldToLocalRay(ray, wMat);
            if (!bendedRay) { logs.push(`  💨 [${obj.id}] Unyielding singularity blocking access!`); return; }

            const aabbHit = BroadphaseChecker.testAABB(bendedRay.origin, bendedRay.dir, obj.bounds);
            
            if (aabbHit === Infinity) {
                logs.push(`  💨 [${obj.id}] Completely ignored. Outer walls missed.`);
                return;
            }

            // Enter the core Geometry spark evaluation loop
            const narrowRes = NarrowphaseChecker.probeMesh(bendedRay.origin, bendedRay.dir, obj.positions, obj.indices);
            
            // Programmatic pure objects lacking points defer purely to Broad AABB tests safely
            const isAbstractShape = (!obj.positions || obj.positions.length === 0);

            if (!narrowRes.hit && !isAbstractShape) {
                logs.push(`  💨 [${obj.id}] Clipped outer boundaries but slipped peacefully through the inner triangular spaces.`);
                return;
            }

            const activeHitDist = narrowRes.hit ? narrowRes.t : aabbHit;

            // Emanate the specific Hit spatial data BACKwards into the macro World Space.
            const localizedHitPoint = Vec3.add(bendedRay.origin, Vec3.scale(bendedRay.dir, activeHitDist));
            const trueWorldPoint = SpaceBender.localToWorldPoint(localizedHitPoint, wMat);
            const pureWorldDist = Vec3.dist(ray.origin, trueWorldPoint);

            logs.push(`  🎯 [${obj.id}] LIGHT PIERCES THE VEIL! Actual True World Distance: ${pureWorldDist.toFixed(2)}`);

            if (pureWorldDist < absoluteClosestDist) {
                absoluteClosestDist = pureWorldDist;
                selectedVessel = obj;
                physicalWorldPoint = trueWorldPoint;
            }
        });

        return { object: selectedVessel, distance: absoluteClosestDist, point: physicalWorldPoint, logs };
    }
}
