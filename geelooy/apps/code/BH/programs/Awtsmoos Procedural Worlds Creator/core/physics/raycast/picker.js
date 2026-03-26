
// B"H
/**
 * @file picker.js
 * @brief Searches the scene graph for intersected objects using inverse-transform logic,
 *        now armed with perfect Ray-Triangle narrowphase intersection and cached hierarchical matrices.
 *        Fully supports unindexed flat-shaded geometries.
 * 
 * THE HYMN OF THE OMNISCIENT SEARCH:
 * The Ray pierces the void, but the vessels are transformed!
 * To find the intersection, we must invert the storm.
 * We pull the Ray back into the Local space of clay,
 * Where the AABB rests peacefully, awaiting the display.
 * 
 * We iterate the triangles, whether indexed or completely bare,
 * Seeking the exact intersection, handled with absolute care.
 * For even a flat-shaded vessel with no indices to its name,
 * Still holds the geometric truth, burning like a flame!
 */

import { Intersections } from './intersections.js';
import { BoundingVolume } from './bounds.js';
import { mat4_core } from '../../math/mat4/core.js';
import { Vec3 } from '../../math/vec3.js';
import { SpatialMath } from '../spatial/math.js';

export class ScenePicker {
    /**
     * B"H - Plunges the Ray into the depths of the Scene Graph, finding the closest physical vessel.
     * 
     * @param {Object} ray - The mathematical Ray object containing { origin, direction }.
     * @param {Map} objectMap - The registry of all manifested vessels in reality.
     * @param {Object} renderer - The orchestrator holding cached hierarchical matrices and time.
     * @returns {Object} { object, distance, point, logs } - The captured truth.
     */
    static pick(ray, objectMap, renderer) {
        let closestDist = Infinity;
        let selectedObject = null;
        let finalHitPoint = null;
        
        let logDump = [];
        logDump.push(`\nB"H - 👁️ SCENE PICKER DIAGNOSTICS`);
        logDump.push(`  -> Ray Origin: [${ray.origin.map(n=>n.toFixed(3)).join(', ')}]`);
        logDump.push(`  -> Ray Dir:    [${ray.direction.map(n=>n.toFixed(3)).join(', ')}]`);

        objectMap.forEach(obj => {
            if (obj.visible === false) return;
            if (!obj.selectable && !obj.draggable && !obj.interactive) return;

            // 1. Ensure Local Bounds exist (The Broadphase Barrier)
            if (!obj.bounds) {
                obj.bounds = BoundingVolume.compute(obj.positions);
            }

            // 2. Fetch Live World Matrix
            // B"H - THE TIKKUN OF HIERARCHY! We grab the true, compounded world matrix 
            // cached by the renderer, preserving all parent transformations!
            let worldMat = obj.worldMatrix; 
            
            // Fallback for objects that might not have been rendered yet this frame
            if (!worldMat) {
                const currentTime = (performance.now() - renderer.startTime) / 1000;
                if (renderer.animationManager) {
                    worldMat = renderer.animationManager.getInterpolatedTransform(obj.id, currentTime);
                }
                if (!worldMat) worldMat = mat4_core.identity();
            }

            // 3. INVERT THE WORLD MATRIX
            const invWorld = mat4_core.identity();
            if (!mat4_core.inverse(invWorld, worldMat)) {
                logDump.push(`  [${obj.id}] Matrix Singularity. Skipping.`);
                return; 
            }

            // 4. TRANSFORM RAY TO LOCAL SPACE
            // The ray origin is a Point, the direction is a Vector. We transform them appropriately!
            const localOrigin = mat4_core.transformPoint([], ray.origin, invWorld);
            const worldTarget = Vec3.add(ray.origin, ray.direction);
            const localTarget = mat4_core.transformPoint([], worldTarget, invWorld);
            const localDir = Vec3.normalize(Vec3.sub(localTarget, localOrigin));

            // 5. LOCAL AABB INTERSECTION (Broadphase)
            const tAABB = Intersections.rayAABB(localOrigin, localDir, obj.bounds.min, obj.bounds.max);

            if (tAABB !== null && tAABB >= 0) {
                let bestLocalT = Infinity;
                let hitTriangle = false;

                // 6. NARROWPHASE: PERFECT PIXEL TRIANGULATION
                if (obj.positions && obj.positions.length > 0) {
                    const pos = obj.positions;
                    
                    // Path A: Indexed Geometry (Shared Vertices)
                    if (obj.indices && obj.indices.length > 0) {
                        const ind = obj.indices;
                        for (let i = 0; i < ind.length; i += 3) {
                            const i0 = ind[i] * 3;
                            const i1 = ind[i+1] * 3;
                            const i2 = ind[i+2] * 3;
                            
                            const v0 = [pos[i0], pos[i0+1], pos[i0+2]];
                            const v1 = [pos[i1], pos[i1+1], pos[i1+2]];
                            const v2 = [pos[i2], pos[i2+1], pos[i2+2]];
                            
                            const tTri = SpatialMath.rayTriangleIntersect(localOrigin, localDir, v0, v1, v2);
                            if (tTri !== null && tTri >= 0 && tTri < bestLocalT) {
                                bestLocalT = tTri;
                                hitTriangle = true;
                            }
                        }
                    } 
                    // Path B: Unindexed Flat Geometry (Unique Vertices per Face)
                    else {
                        for (let i = 0; i < pos.length; i += 9) {
                            const v0 = [pos[i], pos[i+1], pos[i+2]];
                            const v1 = [pos[i+3], pos[i+4], pos[i+5]];
                            const v2 = [pos[i+6], pos[i+7], pos[i+8]];
                            
                            const tTri = SpatialMath.rayTriangleIntersect(localOrigin, localDir, v0, v1, v2);
                            if (tTri !== null && tTri >= 0 && tTri < bestLocalT) {
                                bestLocalT = tTri;
                                hitTriangle = true;
                            }
                        }
                    }
                } else {
                    // Fallback to AABB for pure programmatic objects without distinct triangles
                    bestLocalT = tAABB;
                    hitTriangle = true;
                }

                // 7. FINALIZE HIT
                if (hitTriangle && bestLocalT !== Infinity) {
                    // Transform the true hit point back to World Space!
                    const localHitPoint = Vec3.add(localOrigin, Vec3.scale(localDir, bestLocalT));
                    const worldHitPoint = mat4_core.transformPoint([], localHitPoint, worldMat);
                    const worldDist = Vec3.dist(ray.origin, worldHitPoint);

                    logDump.push(`  🎯 [${obj.id}] HIT! Dist: ${worldDist.toFixed(2)}`);

                    if (worldDist < closestDist) {
                        closestDist = worldDist;
                        selectedObject = obj;
                        finalHitPoint = worldHitPoint;
                    }
                } else {
                     logDump.push(`  💨 [${obj.id}] MISS (Narrowphase Failed).`);
                }
            } else {
                logDump.push(`  💨 [${obj.id}] MISS. Bounds: Min[${obj.bounds.min.map(n=>n.toFixed(1))}] Max[${obj.bounds.max.map(n=>n.toFixed(1))}]`);
            }
        });

        return { object: selectedObject, distance: closestDist, point: finalHitPoint, logs: logDump };
    }
}
