// B"H
/**
 * physics/index.js
 * 
 * Sub-stepped physics loop.
 * Velocity intent is calculated ONCE per frame.
 * Wall normals from the previous frame are used to pre-filter input velocity,
 * preventing the capsule from ever pushing into a known wall (eliminates jitter).
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Tzomayach from "../../../tzomayach.js";
import core      from "./core.js";
import movement  from "./movement.js";
import forces    from "./forces.js";
import collisions from "./collisions.js";
import ground    from "./ground.js";
import sync      from "./sync.js";

const STEPS_PER_FRAME = 5;

export default {
    ...core, ...forces, ...movement, ...collisions, ...ground, ...sync,

    heesHawvoos(dt) {
        if (!this.mesh || !this.collider) return;
        if (this.isTeleporting) { this.isTeleporting = false; return; }
        if (this._checkNaNAndReset()) return;

        this._updateSubSystems(dt);

        const deltaTime = Math.min(0.05, dt) / STEPS_PER_FRAME;

        // B"H: CALCULATE INTENT ONCE PER FRAME.
        // If we do this inside the loop, we overwrite the wall-slide adjustment.
        this._calculateMovementVelocity(deltaTime);
        this._handleJump();

        // B"H: PRE-FILTER velocity against walls we were touching LAST frame.
        // This is the critical fix for jitter: without this, every frame the input
        // resets velocity to point directly into the wall, sub-step 1 pushes the capsule
        // INTO the wall, collision pushes it OUT, creating an oscillation.
        // By pre-filtering, the capsule never enters the wall in the first place.
        if (this._lastWallNormals && this._lastWallNormals.length > 0) {
            for (const wn of this._lastWallNormals) {
                const dot = this.velocity.x * wn.x + this.velocity.z * wn.z;
                if (dot < 0) {
                    this.velocity.x -= wn.x * dot;
                    this.velocity.z -= wn.z * dot;
                }
            }
        }

        // Reset collector for this frame's wall contacts
        this._frameWallNormals = [];

        for (let i = 0; i < STEPS_PER_FRAME; i++) {
            // 1. Apply gravity.
            this._applyPhysicsForces(deltaTime);

            // 2. Move collider.
            if (this.onFloor) {
                this.collider.translate({
                    x: this.velocity.x * deltaTime,
                    y: 0,
                    z: this.velocity.z * deltaTime
                });
            } else {
                const deltaPos = this.velocity.clone().multiplyScalar(deltaTime);
                this.collider.translate(deltaPos);
            }

            // 3. Resolve walls and slide velocity.
            this.collisions();

            // 4. Authoritative ground snap.
            this._snapToGround();
        }

        // Store this frame's wall normals for pre-filtering next frame.
        // If no walls were hit, clear so player can freely move again.
        this._lastWallNormals = (this._frameWallNormals && this._frameWallNormals.length > 0)
            ? this._frameWallNormals
            : null;

        this._checkAbyss();
        this._updateAnimationState(dt);
        this._syncMesh(dt);

        if (this.activeObject && typeof this.alignObject === 'function') this.alignObject();
        Tzomayach.prototype.heesHawvoos.call(this, dt);
    }
};
