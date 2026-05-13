/**
 * B"H
 * @file WanderingAI.js
 * @description
 * 🚶 THE PATH OF PROVIDENCE 🚶
 * 
 * Chapter 33: The Wandering Soul.
 * "A man's steps are established by the L-rd."
 * 
 * Simple AI logic for NPCs to wander back and forth within a specific range.
 */

import * as THREE from '/games/scripts/build/three.module.js';

export default {
    /**
     * B"H: Initialize wandering parameters.
     */
    initWandering() {
        if (!this.options.isWandering) return;
        
        this.wanderOrigin = this.mesh.position.clone();
        this.wanderRange = this.options.wanderRange || 10;
        this.wanderTarget = this.createNewWanderTarget();
        this.isWandering = true;
        this.wanderPauseTimer = 0;
    },

    createNewWanderTarget() {
        const offset = new THREE.Vector3(
            (Math.random() - 0.5) * 2 * this.wanderRange,
            0,
            (Math.random() - 0.5) * 2 * this.wanderRange
        );
        return this.wanderOrigin.clone().add(offset);
    },

    updateWandering(dt) {
        if (!this.isWandering || this.state === "talking") return;

        if (this.wanderPauseTimer > 0) {
            this.wanderPauseTimer -= dt;
            this.moving.forward = false;
            return;
        }

        const dist = this.mesh.position.distanceTo(this.wanderTarget);
        if (dist < 1.0) {
            // Reached target, pause for a bit
            this.wanderPauseTimer = 2 + Math.random() * 3;
            this.wanderTarget = this.createNewWanderTarget();
            this.moving.forward = false;
        } else {
            // Move toward target
            this.mesh.lookAt(this.wanderTarget);
            this.rotation.y = this.mesh.rotation.y;
            this.moving.forward = true;
        }
    }
}
