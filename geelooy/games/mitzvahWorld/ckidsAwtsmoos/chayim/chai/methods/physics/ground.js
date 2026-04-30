
// B"H
import * as THREE from '/games/scripts/build/three.module.js';
const _ground_check_ray = new THREE.Ray();

/**
 * ground.js - Handling the relationship between the Soul and the Earth.
 * 
 * Chapter 5: Standing Firm.
 * "I waited patiently for the Lord; and He inclined to me... and set my feet upon a rock." (Tehillim 40:2-3)
 */
export default {
    /**
     * checkGround - Probing the earth beneath the feet.
     */
    checkGround(steepSlopeAngle) {
        if (!this.collider || !this.collider.start) return null;

        _ground_check_ray.origin.copy(this.collider.start);
        _ground_check_ray.direction.set(0, -1, 0);
        
        let groundHit = false;
        if(this.olam && this.olam.worldOctree && typeof this.olam.worldOctree.rayIntersect === 'function') {
            try {
                groundHit = this.olam.worldOctree.rayIntersect(_ground_check_ray);
            } catch(e) {
                console.warn("B\"H - 🚨 Ground Ray failed:", e);
                return null;
            }
        }
        
        this.onFloor = groundHit && 
                       groundHit.normal && 
                       groundHit.normal.y > steepSlopeAngle && 
                       groundHit.distance <= this.radius + 0.25;

        if (!groundHit && Math.random() < 0.005) {
             console.log(`B"H - 🌌 [${this.name}] Searching for ground at Y: ${this.collider.start.y.toFixed(2)}. Result: VOID.`);
        }

        return groundHit;
    },

    /**
     * snapToGround - Ensuring the vessel remains firmly planted in reality.
     */
    snapToGround(finalGroundHit, steepSlopeAngle, isWalking) {
        if (!finalGroundHit || !finalGroundHit.normal) {
            this.onFloor = false;
            return;
        }

        // Redefine onFloor with ancestral precision
        this.onFloor = finalGroundHit.normal.y > steepSlopeAngle && finalGroundHit.distance <= this.radius + 0.25;

        if (this.onFloor && this.velocity.y <= 0) {
            const penetrationDepth = this.radius - finalGroundHit.distance;
            
            // Push out of ground
            this.collider.translate(finalGroundHit.normal.clone().multiplyScalar(penetrationDepth));

            // Kill vertical velocity components against the floor normal
            this.velocity.projectOnPlane(finalGroundHit.normal);

            if (!isWalking && (!this.moving || !this.moving.jump)) {
                this.velocity.x = 0;
                this.velocity.z = 0;
            }
            this.velocity.y = 0;
        }
    }
};
