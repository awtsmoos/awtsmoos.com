
/**
 * B"H
 * @file OctreeMath.js
 * Collision mathematics for OctreeWorld.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _tempTri = new THREE.Triangle();
const _plane = new THREE.Plane();

export default class OctreeMath {
    
    /**
     * Resolves collision between a Triangle and Capsule.
     * Features "Face Biasing" to prevent jitter on staircases.
     */
    static checkTriangleCapsule(tri, cap) {
        _plane.set(0,0,0,0); // reset
        tri.getPlane(_plane);
        
        const d1 = _plane.distanceToPoint(cap.start) - cap.radius;
        const d2 = _plane.distanceToPoint(cap.end) - cap.radius;
        
        // Separation Check (One sided or fully deep)
        if ((d1 > 0 && d2 > 0) || (d1 < -cap.radius && d2 < -cap.radius)) return false;

        const delta = Math.abs(d1 / (Math.abs(d1) + Math.abs(d2)));
        const intersectPoint = _v3.copy(cap.start).lerp(cap.end, delta);
        
        // 1. FACE COLLISION (Preferred for stability)
        if (tri.containsPoint(intersectPoint)) {
            return { normal: _plane.normal.clone(), depth: Math.abs(Math.min(d1, d2)) };
        }
        
        // 2. EDGE COLLISION
        const target = new THREE.Vector3();
        tri.closestPointToPoint(intersectPoint, target);
        const distSq = target.distanceToSquared(intersectPoint);
        const r2 = cap.radius * cap.radius;

        if(distSq < r2) {
            const dist = Math.sqrt(distSq);
            const depth = cap.radius - dist;
            
            // Vector from geometry -> capsule axis
            const norm = new THREE.Vector3().subVectors(intersectPoint, target).normalize();
            
            // B"H STAIR SMOOTHING:
            // If the push vector is roughly UP (similar to face normal), assume it's a floor step 
            // and use the clean face normal to prevent sliding off the edge.
            if(norm.dot(_plane.normal) > 0.5) {
                 return { normal: _plane.normal.clone(), depth: depth };
            }

            return { normal: norm, depth: depth };
        }
        return false;
    }
}
