// B"H
/**
 * ground.js
 * 
 * Authoritative Ground Snapping.
 * If grounded, we skip velocity-based Y movement to prevent slope jitter.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

const _ray = new THREE.Ray();
const _rayDir = new THREE.Vector3(0, -1, 0);

export default {
    _snapToGround() {
        if (!this.olam || !this.olam.worldOctree || !this.collider) return;

        // Skip snapping if we are jumping upward.
        if (this.jumped && this.velocity.y > 0) {
            this.onFloor = false;
            return;
        }

        const rayStart = this.collider.start.clone();
        rayStart.y += 1.5; // Look from above
        
        _ray.origin.copy(rayStart);
        _ray.direction.copy(_rayDir);

        const hit = this.olam.worldOctree.rayIntersect(_ray);

        // Standard snap distance (max 2.5 from ray start).
        if (hit && hit.distance < 2.5) {
            const groundY = hit.position.y;
            const currentFeetY = this.collider.start.y - this.radius;
            const diff = groundY - currentFeetY;

            // Authoritative snap if within 1 unit of the floor.
            if (Math.abs(diff) < 1.0) {
                if (!this.onFloor) {
                    // B"H: Landing detected — silent to keep void peaceful
                }

                // Snap Y perfectly.
                this.collider.translate({ x: 0, y: diff, z: 0 });
                
                this.onFloor = true;
                this.velocity.y = 0; // Lock vertical velocity
                this.jumped = false;
                return; 
            }
        }
        
        // If we reach here, no ground was found close enough.
        this.onFloor = false;
    }
};
