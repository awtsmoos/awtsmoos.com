// B"H
import * as THREE from '/games/scripts/build/three.module.js';
const _ground_check_ray = new THREE.Ray();

/**
 * ground.js - Handling the relationship between the Soul and the Earth.
 * Restored to the ancestral "Perfected" state for maximum stability.
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
        
        // B"H: Reverted to perfected 0.25 buffer as mandated by the legacy code.
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
             * If we are sinking or slightly above, restore position exactly to the surface.
             */
            const penetrationDepth = this.radius - finalGroundHit.distance;
            if (penetrationDepth > 0) {
                this.collider.translate(finalGroundHit.normal.clone().multiplyScalar(penetrationDepth));
            }

            this.velocity.projectOnPlane(finalGroundHit.normal);

            if (!isWalking && !this.moving.jump) {
                this.velocity.x = 0;
                this.velocity.z = 0;
            }
            this.velocity.y = 0;
        }
    }
};
