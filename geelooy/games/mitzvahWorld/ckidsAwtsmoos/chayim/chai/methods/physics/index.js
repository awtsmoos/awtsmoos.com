// B"H
/**
 * physics/index.js - The Kav (Line) of physical existence.
 * Re-aligned for absolute first-frame stability.
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
            // B"H: NaN Guard for collision response
            if (isNaN(result.depth) || isNaN(result.normal.x)) {
                return; 
            }
            
            this.collider.translate(result.normal.multiplyScalar(result.depth));
            
            // Sliding logic
            const velocityAlongNormal = result.normal.dot(this.velocity);
            if (!isNaN(velocityAlongNormal) && velocityAlongNormal < 0) {
                 this.velocity.addScaledVector(result.normal, -velocityAlongNormal);
            }
            
            // B"H: Post-collision velocity check
            if (isNaN(this.velocity.x) || isNaN(this.velocity.y) || isNaN(this.velocity.z)) {
                this.velocity.set(0,0,0);
            }
        }
    },

    async calculateOffset() {
        if (!this.onFloor) return;
        await new Promise(resolve => requestAnimationFrame(resolve));
        const raycaster = new THREE.Raycaster();
        raycaster.set(this.collider.start, new THREE.Vector3(0, -1, 0));
        const intersects = raycaster.intersectObjects(this.olam.scene.children, true);
        if (intersects.length > 0) {
            this.offset = intersects[0].distance;
        }
    },
    
    _checkNaNAndReset() {
        const p = this.mesh.position;
        const v = this.velocity;
        const r = this.rotation;

        if (
            (this.mesh && (isNaN(p.x) || isNaN(p.y) || isNaN(p.z))) ||
            (v && (isNaN(v.x) || isNaN(v.y) || isNaN(v.z))) ||
            (r && isNaN(r.y))
        ) {
            console.trace("B\"H: Physics state corrupted! Resetting.", { 
                pos: p.clone(), 
                vel: v.clone(), 
                rot: r.clone() 
            });
            
            // B"H: Reset ALL physics state to heal the vessel completely.
            this.velocity.set(0, 0, 0);
            this.rotation.set(0,0,0); // Full reset of the Kav rotation
            this.setPosition(new THREE.Vector3(0, 15, 0)); // Resets collider and mesh position
            
            // B"H: Also reset the camera's memory to prevent it from re-corrupting the rotation
            if(this.olam && this.olam.ayin) {
                this.olam.ayin.currentDistance = 5;
                this.olam.ayin.userInputTheta = 0; 
                this.olam.ayin.userInputPhi = 0;
            }

            return true; // Skip rest of update for this frame to allow stabilization
        }
        return false;
    },

    heesHawvoos(dt) {
        // B"H: Delta Guard - Ensure a stable first heartbeat
        const deltaTime = Math.min(dt, 0.1);
        
        if (this.isTeleporting) {
            this.isTeleporting = false;
            return;
        }
        
        // B"H: Pre-update NaN Check & HEALING
        if (this._checkNaNAndReset()) {
            return; // If reset happened, stop this frame's update.
        }

        this.updateRayColor();      
        this.updateHandState();     
        this.updateBlockHighlight();
        this.updateParticles(deltaTime);

        if (this.activeObject && this.activeObject.mesh && this.activeObject.mesh.userData.onUpdate) {
            this.activeObject.mesh.userData.onUpdate(deltaTime);
        }
        
        const isWorldBusy = this.olam.worldOctree ? this.olam.worldOctree.isProcessing : true;
        const steepSlopeAngle = Math.cos(THREE.MathUtils.degToRad(50));

        // 1. Ground Check (The Relationship with the Floor)
        this.checkGround(steepSlopeAngle);

        // 2. Apply Forces (Gravity/Hover Guard)
        this.applyForces(deltaTime, isWorldBusy);

        // 3. Movement Calculations
        const moveData = this.calculateMovementVectors(deltaTime, this.onFloor);
        const { combinedVector, isWalking } = moveData;

        // B"H: Vector Safety
        if (!isNaN(combinedVector.x)) {
            this.velocity.x += combinedVector.x;
            this.velocity.z += combinedVector.z;
        }

        // 4. The Leap of Faith (Jump)
        if (this.onFloor && this.moving.jump) {
            this.jumped = true;
            this.velocity.y = this.jumpHeight;
            if (!this.didJump) {
                this.didJump = true;
                this.ayshPeula("jumped", this);
            }
        } else {
            if (this.didJump) this.didJump = false;
        }

        // 5. Physical Execution (Move & Collide)
        this.executeMovement(deltaTime);

        // 6. Ground Snap (Snapping to Reality)
        const finalGroundHit = this.checkGround(steepSlopeAngle); 
        this.snapToGround(finalGroundHit, steepSlopeAngle, isWalking);

        // 7. Animation Synchrony
        const rotationSpeed = this.rotationSpeed * deltaTime;
        let isTurning = false;

        if (this.moving.turningLeft) {
            if (!isWalking && this.onFloor) {
                this.playChaweeyoos(this.getChaweeyoos("left turn"));
                isTurning = true;
            }
            this.rotation.y += rotationSpeed;
            this.ayshPeula("rotate", this.rotation.y);
        } else if (this.moving.turningRight) {
            if (!isWalking && this.onFloor) {
                this.playChaweeyoos(this.getChaweeyoos("right turn"));
                isTurning = true;
            }
            this.rotation.y -= rotationSpeed;
            this.ayshPeula("rotate", this.rotation.y);
        }

        if (this.onFloor) {
            if (this.jumped && !this.moving.jump) {
                this.jumped = false;
                if (!this.hitFloor) {
                    this.hitFloor = true;
                    this.ayshPeula("hit floor", this);
                }
            }
            if (isWalking) {
                this.playChaweeyoos(this.getChaweeyoos("run"));
                if (!this.startedWalking) {
                    this.startedWalking = true;
                    this.ayshPeula("started walking", this);
                }
            } else if (!isTurning) {
                this.playChaweeyoos(this.getChaweeyoos("idle"));
            }
            
            if (!isWalking) {
                if (this.startedWalking) {
                    this.startedWalking = false;
                    this.ayshPeula("stopped walking", this);
                }
            }
            this.fallingFrames = 0;
        } else {
            if (this.startedWalking) {
                this.startedWalking = false;
                this.ayshPeula("stopped walking", this);
            }
            if (this.velocity.y > 0 && this.jumped) {
                this.fallingFrames = 0;
                this.playChaweeyoos(this.getChaweeyoos("jump"), { loop: false });
            } else if (this.jumped && this.velocity.y < -9) {
                this.playChaweeyoos(this.getChaweeyoos("falling"));
                this.fallingFrames = 0;
            } else if (!this.jumped && this.velocity.y < -3) {
                if (++this.fallingFrames > 14) {
                    this.playChaweeyoos(this.getChaweeyoos("falling"));
                }
            }
        }

        // 8. Visual & State Sync
        this.syncMesh(deltaTime);
        this.updateSpheres(deltaTime);
        
        if (this.activeObject) {
            this.alignObject();
        }

        Tzomayach.prototype.heesHawvoos.call(this, deltaTime);
    }
};