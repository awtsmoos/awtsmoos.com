// B"H
/**
 * @file OctreeMath.js
 * Collision mathematics for OctreeWorld.
 */
import * as THREE from '/games/scripts/build/three.module.js';

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _tempTri = new THREE.Triangle();
const _plane = new THREE.Plane();

/**
 * OctreeMath - The geometry of intersection.
 */
export default class OctreeMath {
    
    /**
     * Resolves collision between a Triangle and Capsule.
     * Features "Face Biasing" to prevent jitter on staircases.
     */
    static checkTriangleCapsule(tri, cap) {
        _plane.set(0,0,0,0); 
        tri.getPlane(_plane);
        
        const d1 = _plane.distanceToPoint(cap.start) - cap.radius;
        const d2 = _plane.distanceToPoint(cap.end) - cap.radius;
        
        if ((d1 > 0 && d2 > 0) || (d1 < -cap.radius && d2 < -cap.radius)) return false;

        // B"H: Added safety guard against potential NaN if d1 and d2 are exactly zero by checking sum.
        const totalDist = Math.abs(d1) + Math.abs(d2);
        const delta = totalDist < 1e-10 ? 0.5 : Math.abs(d1 / totalDist);
        const intersectPoint = _v3.copy(cap.start).lerp(cap.end, delta);
        
        if (tri.containsPoint(intersectPoint)) {
            return { normal: _plane.normal.clone(), depth: Math.abs(Math.min(d1, d2)) };
        }
        
        const target = new THREE.Vector3();
        tri.closestPointToPoint(intersectPoint, target);
        const distSq = target.distanceToSquared(intersectPoint);
        const r2 = cap.radius * cap.radius;

        if(distSq < r2) {
            const dist = Math.sqrt(distSq);
            const depth = cap.radius - dist;
            const norm = new THREE.Vector3().subVectors(intersectPoint, target).normalize();
            
            // B"H STAIR SMOOTHING:
            // If the push vector is somewhat aligned with the face normal,
            // use the face normal instead of the edge normal.
            // This prevents sliding off edges of stairs.
            if(norm.dot(_plane.normal) > 0.5) {
                 return { normal: _plane.normal.clone(), depth: depth };
            }

            return { normal: norm, depth: depth };
        }
        return false;
    }
}
