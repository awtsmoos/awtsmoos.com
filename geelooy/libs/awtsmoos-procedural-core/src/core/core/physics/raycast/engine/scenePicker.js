
/**
 * B"H
 * THE SILENT JUDGE (SCENE PICKER)
 * 
 * Chapter: The Vow of Silence
 * The user requested NO LOGS ON HOVER. The ScenePicker must obey the `verbose` flag 
 * with absolute strictness. If verbose is false, it shall not utter a single word 
 * to the console. It will only calculate in pure silence.
 * 
 * @class ScenePicker
 */
import { AABBMath } from '../math/aabb.js';
import { SpaceBender } from './spaceBender.js';
import { RayMath } from '../math/rayMath.js';

export class ScenePicker {
    /**
     * B"H
     * Finds the closest vessel touched by the Light.
     * @param {boolean} verbose - If FALSE, this function will be COMPLETELY silent.
     */
    static pick(ray, objectMap, renderer = null, verbose = false) {
        let bestDist = Infinity;
        let bestObj = null;
        let bestPoint = null;

        // ONLY log if explicitly asked (e.g., during a Click event)
        if (verbose) {
            console.log(`\nB"H - 👁️ CASTING PURE RAY`);
            console.log(`Origin: [${ray.origin.map(v=>v.toFixed(2))}]`);
            console.log(`Direct: [${ray.direction.map(v=>v.toFixed(2))}]`);
        }

        objectMap.forEach((obj, id) => {
            if (!obj.interactive && !obj.selectable) return;
            if (obj.visible === false) return;

            let wMat = obj.worldMatrix;
            if (!wMat) {
                const p = obj.position || (obj.keyframes && obj.keyframes[0]?.position) || [0,0,0];
                const r = obj.rotation || (obj.keyframes && obj.keyframes[0]?.rotation) || [0,0,0];
                const s = obj.scale || (obj.keyframes && obj.keyframes[0]?.scale) || [1,1,1];
                wMat = SpaceBender.buildWorldMatrix(p, r, s);
            }

            const localRay = SpaceBender.toLocalRay(ray, wMat);
            if (!localRay) return;

            if (!obj.bounds) {
                const pos = obj.positions || obj.geometry?.positions;
                obj.bounds = AABBMath.compute(pos);
            }

            const tLocal = AABBMath.intersect(
                localRay.origin, 
                localRay.direction, 
                obj.bounds.min, 
                obj.bounds.max
            );

            if (tLocal !== null) {
                const localHit = [
                    localRay.origin[0] + localRay.direction[0] * tLocal,
                    localRay.origin[1] + localRay.direction[1] * tLocal,
                    localRay.origin[2] + localRay.direction[2] * tLocal
                ];
                
                const worldHit = SpaceBender.toWorldPoint(localHit, wMat);
                const distWorld = RayMath.dist(ray.origin, worldHit);

                if (verbose) console.log(`  🎯 Hit [${id}] at distance: ${distWorld.toFixed(2)}`);

                if (distWorld < bestDist) {
                    bestDist = distWorld;
                    bestObj = obj;
                    bestPoint = worldHit;
                }
            }
        });

        if (verbose) {
            if (bestObj) console.log(`🏆 GLORIOUS STRIKE: ${bestObj.id}\n`);
            else console.log(`💨 MISSED ALL. RAY RETURNED TO INFINITY.\n`);
        }

        return bestObj ? { object: bestObj, distance: bestDist, point: bestPoint } : null;
    }
}
