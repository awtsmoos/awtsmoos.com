// B"H
/**
 * movement.js
 * 
 * Instant WoW-style movement.
 * 
 * CRITICAL FIX: Forward/side vectors are computed directly from this.rotation.y
 * using simple trig, instead of calling getWorldDirection() on a detached Object3D
 * (nonRotatingEmptyForMovement) which was never added to the scene graph,
 * causing getWorldDirection() to always return a stale default direction.
 * This was making the velocity always axis-aligned regardless of player facing.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { PHYSICS_CONSTANTS } from './physicsConstants.js';

export default {
    _calculateMovementVelocity(deltaTime) {
        if (!this.velocity || !this.moving) return;

        // Base speed: 6 is the final standard.
        const baseSpeed = (this.speed || PHYSICS_CONSTANTS.DEFAULT_SPEED) * (this.speedScale || 1);
        const speed = this.moving.running ? baseSpeed * PHYSICS_CONSTANTS.RUN_MULTIPLIER : baseSpeed;

        let dir = new THREE.Vector3();
        this.isWalking = false;
        let isWalkingForward = false, isWalkingBack = false;

        // B"H: Compute forward and side vectors directly from rotation.y
        // This is mathematically correct and doesn't depend on scene graph state.
        // The third-person camera looks toward local +Z at rotation zero.
        const rotY = this.rotation ? this.rotation.y : 0;
        const forwardX = Math.sin(rotY);
        const forwardZ = Math.cos(rotY);
        const sideX = -Math.cos(rotY);
        const sideZ = Math.sin(rotY);

        if (this.moving.forward || this.movingAutomatically) {
            this.isWalking = true; isWalkingForward = true;
            dir.x += forwardX;
            dir.z += forwardZ;
            this.targetRotateOffset = 0;
        } else if (this.moving.backward) {
            this.isWalking = true; isWalkingBack = true;
            dir.x -= forwardX;
            dir.z -= forwardZ;
            this.targetRotateOffset = Math.PI;
        }

        if (this.moving.stridingLeft) {
            this.isWalking = true;
            // Striding left = subtract side vector (side is right)
            dir.x -= sideX;
            dir.z -= sideZ;
            this.targetRotateOffset = Math.PI / 2;
            if (isWalkingForward) this.targetRotateOffset -= Math.PI / 4;
            else if (isWalkingBack) this.targetRotateOffset += Math.PI / 4;
        } else if (this.moving.stridingRight) {
            this.isWalking = true;
            // Striding right = add side vector
            dir.x += sideX;
            dir.z += sideZ;
            this.targetRotateOffset = -Math.PI / 2;
            if (isWalkingForward) this.targetRotateOffset += Math.PI / 4;
            else if (isWalkingBack) this.targetRotateOffset -= Math.PI / 4;
        }

        if (this.isWalking && dir.length() > 0) {
            dir.normalize().multiplyScalar(speed);
            this.velocity.x = dir.x;
            this.velocity.z = dir.z;
        } else {
            this.velocity.x = 0;
            this.velocity.z = 0;
        }
    },

    _handleJump() {
        if (!this.velocity || !this.moving) return;
        
        // Jump trigger: requires being onFloor.
        if (this.onFloor && this.moving.jump && !this.didJump) {
            // B"H: silent

            this.jumped = true;
            this.velocity.y = this.jumpHeight || 12;
            this.didJump = true;
            this.onFloor = false; // Immediately airborne
            if (typeof this.ayshPeula === 'function') this.ayshPeula("jumped", this);
        }
        
        if (!this.moving.jump) {
            this.didJump = false;
        }
    }
};
