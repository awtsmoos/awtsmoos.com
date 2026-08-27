// B"H
/**
 * @file clothCollision.js
 * @brief Handles the divine dialogue between yielding cloth particles and firm static geometry.
 */
import { Vec3 } from '../../math/vec3.js';

/**
 * B"H - Calculates the closest point on a triangle to a given point.
 * A direct revelation from the `collisionSolver`.
 */
function closestPointTriangle(p, a, b, c) {
    const ab = Vec3.sub(b,a), ac = Vec3.sub(c,a), ap = Vec3.sub(p,a);
    const d1 = Vec3.dot(ab,ap), d2 = Vec3.dot(ac,ap);
    if (d1 <= 0 && d2 <= 0) return a;
    const bp = Vec3.sub(p,b), d3 = Vec3.dot(ab,bp), d4 = Vec3.dot(ac,bp);
    if (d3 >= 0 && d4 <= d3) return b;
    const vc = d1 * d4 - d3 * d2;
    if (vc <= 0 && d1 >= 0 && d3 <= 0) {
        const v = d1 / (d1 - d3); return Vec3.add(a, Vec3.scale(ab, v));
    }
    const cp = Vec3.sub(p,c), d5 = Vec3.dot(ab,cp), d6 = Vec3.dot(ac,cp);
    if (d6 >= 0 && d5 <= d6) return c;
    const vb = d5 * d2 - d1 * d6;
    if (vb <= 0 && d2 >= 0 && d6 <= 0) {
        const w = d2 / (d2 - d6); return Vec3.add(a, Vec3.scale(ac, w));
    }
    const va = d3 * d6 - d5 * d4;
    if (va <= 0 && (d4-d3) >= 0 && (d5-d6) >= 0) {
        const w = (d4 - d3) / ((d4 - d3) + (d5 - d6)); return Vec3.add(b, Vec3.scale(Vec3.sub(c, b), w));
    }
    const denom = 1 / (va + vb + vc);
    const v = vb * denom, w = vc * denom;
    return Vec3.add(a, Vec3.add(Vec3.scale(ab, v), Vec3.scale(ac, w)));
}

/**
 * B"H - Projects cloth particles out of static colliders.
 */
export function handleClothCollisions(cloth, staticColliders) {
    if (!staticColliders || staticColliders.length === 0) return;
    
    cloth.particles.forEach(p => {
        if (p.pinned) return;

        staticColliders.forEach(collider => {
            // Use a query radius slightly larger than the particle radius to catch near misses
            const candidates = collider.octree.querySphere(p.pos, 1.0); 
            if (candidates.length === 0) return;
            
            let bestPenetration = -1;
            let bestNormal = [0, 1, 0];
            let bestClosestPoint = [0, 0, 0];

            for (const triIdx of candidates) {
                const tm = collider.mesh;
                const i0 = tm.indices[triIdx * 3], i1 = tm.indices[triIdx * 3 + 1], i2 = tm.indices[triIdx * 3 + 2];
                const p0 = [tm.positions[i0*3], tm.positions[i0*3+1], tm.positions[i0*3+2]];
                const p1 = [tm.positions[i1*3], tm.positions[i1*3+1], tm.positions[i1*3+2]];
                const p2 = [tm.positions[i2*3], tm.positions[i2*3+1], tm.positions[i2*3+2]];
                
                const closest = closestPointTriangle(p.pos, p0, p1, p2);
                const distSq = Vec3.distSq(p.pos, closest);
                const particleRadius = 0.25; // A whisper of volume

                if (distSq < particleRadius * particleRadius) {
                    const dist = Math.sqrt(distSq);
                    const penetration = particleRadius - dist;
                    if (penetration > bestPenetration) {
                        bestPenetration = penetration;
                        if (dist > 1e-6) {
                            bestNormal = Vec3.scale(Vec3.sub(p.pos, closest), 1 / dist);
                        } else {
                            bestNormal = Vec3.normalize(Vec3.cross(Vec3.sub(p1, p0), Vec3.sub(p2, p0)));
                        }
                    }
                }
            }
            
            if (bestPenetration > 0) {
                // Positional correction
                p.pos = Vec3.add(p.pos, Vec3.scale(bestNormal, bestPenetration * 1.05));
            }
        });
    });
}