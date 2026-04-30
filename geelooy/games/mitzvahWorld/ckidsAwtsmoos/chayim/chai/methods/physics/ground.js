
// B"H
import * as THREE from '/games/scripts/build/three.module.js';
const _ground_check_ray = new THREE.Ray();

/**
 * ground.js - Handling the relationship between the Soul and the Earth.
 * Restored to absolute precision. The void between the feet and the floor is eliminated.
 */
export default {
    /**
     * checkGround - Probing the earth beneath the feet.
     */
    checkGround(steepSlopeAngle) {
        _ground_check_ray.origin.copy(this.collider.start);
        _ground_check_ray.direction.set(0, -1, 0);
        
        let groundHit = false;
        if(this.olam.worldOctree) {
            groundHit = this.olam.worldOctree.rayIntersect(_ground_check_ray);
        }
        
        this.onFloor = groundHit && groundHit.normal.y > steepSlopeAngle && groundHit.distance <= this.radius + 0.25;
        return groundHit;
    },

    /**
     * snapToGround - Ensuring the vessel remains firmly planted in reality.
     */
    snapToGround(finalGroundHit, steepSlopeAngle, isWalking) {
        // Redefine onFloor with ancestral precision
        this.onFloor = finalGroundHit && finalGroundHit.normal.y > steepSlopeAngle && finalGroundHit.distance <= this.radius + 0.25;

        if (this.onFloor && this.velocity.y <= 0) {
            /**
             * B"H: The Restoration Force
             * We calculate EXACTLY how far off we are from a perfect kiss with the floor.
             * If penetrationDepth is positive, we are sunk in the ground.
             * If penetrationDepth is negative, we are hovering above it!
             */
            const penetrationDepth = this.radius - finalGroundHit.distance;
            
            // B"H: By removing the 'if (penetrationDepth > 0)' check, we allow the engine 
            // to PULL the capsule down, perfectly eliminating the 0.25 hover margin!
            this.collider.translate(finalGroundHit.normal.clone().multiplyScalar(penetrationDepth));

            this.velocity.projectOnPlane(finalGroundHit.normal);

            if (!isWalking && (!this.moving || !this.moving.jump)) {
                this.velocity.x = 0;
                this.velocity.z = 0;
            }
            this.velocity.y = 0;
        }
    }
};
