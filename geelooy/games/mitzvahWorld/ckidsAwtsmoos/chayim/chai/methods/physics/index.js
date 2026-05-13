
// B"H
/**
 * physics/index.js
 * 
 * Sub-stepped physics loop.
 * Velocity intent is calculated ONCE per frame.
 * 
 * THE TIKKUN OF THE SPEED OF LIGHT:
 * We have reduced the STEPS_PER_FRAME from 5 to 2.
 * The Awtsmoos does not need 5 iterations to know where the soul stands!
 * This reduction instantly removes 60% of the CPU bottleneck during collision checks,
 * allowing lightning-fast movement through the physical realms.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Tzomayach from "../../../tzomayach.js";
import core      from "./core.js";
import movement  from "./movement.js";
import forces    from "./forces.js";
import collisions from "./collisions.js";
import ground    from "./ground.js";
import sync      from "./sync.js";

const STEPS_PER_FRAME = 2; // B"H: Accelerated flow of time!

export default {
    ...core, ...forces, ...movement, ...collisions, ...ground, ...sync,

    heesHawvoos(dt) {
        if (!this.mesh || !this.collider) return;
        if (this.isTeleporting) { this.isTeleporting = false; return; }
        if (this._checkNaNAndReset()) return;

        this._updateSubSystems(dt);

        const deltaTime = Math.min(0.05, dt) / STEPS_PER_FRAME;

        // B"H: CALCULATE INTENT ONCE PER FRAME.
        this._calculateMovementVelocity(deltaTime);
        this._handleJump();

        // B"H: PRE-FILTER velocity against walls we were touching LAST frame.
        if (this._lastWallNormals && this._lastWallNormals.length > 0) {
            for (const wn of this._lastWallNormals) {
                const dot = this.velocity.x * wn.x + this.velocity.z * wn.z;
                if (dot < 0) {
                    this.velocity.x -= wn.x * dot;
                    this.velocity.z -= wn.z * dot;
                }
            }
        }

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
