// B"H
import { PHYSICS_CONSTANTS } from './physicsConstants.js';

export default {
    _applyPhysicsForces(deltaTime) {
        if (!this.velocity) return;
        const GRAVITY = (this.olam && this.olam.GRAVITY) ? this.olam.GRAVITY : PHYSICS_CONSTANTS.DEFAULT_GRAVITY;

        if (this.onFloor) {
            this.velocity.y = 0;
        } else {
            this.velocity.y -= GRAVITY * deltaTime;
            // Small air resistance only — no horizontal damping.
            this.velocity.x *= (1 - deltaTime * PHYSICS_CONSTANTS.AIR_DAMPING);
            this.velocity.z *= (1 - deltaTime * PHYSICS_CONSTANTS.AIR_DAMPING);
        }
    }
};
