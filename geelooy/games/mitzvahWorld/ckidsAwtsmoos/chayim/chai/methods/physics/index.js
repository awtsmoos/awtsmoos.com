
// B"H
/**
 * physics/index.js - The Kav (Line) of physical existence.
 * Chapter 11: The Protection from the Abyss.
 * 
 * If a value becomes NaN, it is like the world returning to Tohu.
 * We must detect this immediately and restore order (Tikun).
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Tzomayach from "../../../tzomayach.js"; 
import core from "./core.js";
import movement from "./movement.js";
import forces from "./forces.js";
import ground from "./ground.js";
import execution from "./execution.js";
import sync from "./sync.js";

export default {
    ...core,
    ...movement,
    ...forces,
    ...ground,
    ...execution,
    ...sync,

    collisions() {
        if (!this.olam.worldOctree) return; 
        const result = this.olam.worldOctree.capsuleIntersect(this.collider);
        if (result) {
            if (isNaN(result.depth) || isNaN(result.normal.x)) return; 
            this.collider.translate(result.normal.multiplyScalar(result.depth));
            const velocityAlongNormal = result.normal.dot(this.velocity);
            if (!isNaN(velocityAlongNormal) && velocityAlongNormal < 0) {
                 this.velocity.addScaledVector(result.normal, -velocityAlongNormal);
            }
        }
    },

    _checkNaNAndReset() {
        if (!this.mesh) return false;
        const p = this.mesh.position;
        const v = this.velocity;

        if (
            isNaN(p.x) || isNaN(p.y) || isNaN(p.z) ||
            isNaN(v.x) || isNaN(v.y) || isNaN(v.z)
        ) {
            console.error("B\"H - 🚨 NAN DETECTED! Shattering prevented. Invoking the Holy Reset.");
            this.velocity.set(0, 0, 0);
            this.setPosition(new THREE.Vector3(0, 15, 0));
            return true;
        }
        return false;
    },

    heesHawvoos(dt) {
        // B"H: Delta Guard
        const deltaTime = Math.min(dt, 0.1);
        
        if (this.isTeleporting) {
            this.isTeleporting = false;
            return;
        }
        
        // 1. Order Check
        if (this._checkNaNAndReset()) return;

        this.updateRayColor();      
        this.updateHandState();     
        this.updateBlockHighlight();
        this.updateParticles(deltaTime);

        const isWorldBusy = this.olam.worldOctree ? this.olam.worldOctree.isProcessing : true;
        const steepSlopeAngle = Math.cos(THREE.MathUtils.degToRad(50));

        // 2. The Relationship with the Floor
        this.checkGround(steepSlopeAngle);

        // 3. Apply Forces (Gravity/Hover Guard)
        this.applyForces(deltaTime, isWorldBusy);

        // 4. Movement Calculations
        const moveData = this.calculateMovementVectors(deltaTime, this.onFloor);
        const { combinedVector, isWalking } = moveData;

        if (!isNaN(combinedVector.x)) {
            this.velocity.x += combinedVector.x;
            this.velocity.z += combinedVector.z;
        }

        // 5. Jump
        if (this.onFloor && this.moving.jump) {
            this.jumped = true;
            this.velocity.y = this.jumpHeight;
        }

        // 6. Execution
        this.executeMovement(deltaTime);

        // 7. Ground Snap
        const finalGroundHit = this.checkGround(steepSlopeAngle); 
        this.snapToGround(finalGroundHit, steepSlopeAngle, isWalking);

        // 8. Animation Sync
        // ... (Animation logic follows)

        this.syncMesh(deltaTime);
        this.updateSpheres(deltaTime);
        
        Tzomayach.prototype.heesHawvoos.call(this, deltaTime);
    }
};
