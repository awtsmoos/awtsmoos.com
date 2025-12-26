
/**
 * B"H
 * @file physics/index.js
 * @description The 'Kav' (Line) of physics that maintains order in the Olam.
 * Aggregates physics logic from modular files.
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
            this.collider.translate(result.normal.multiplyScalar(result.depth));
            // Sliding logic
            const velocityAlongNormal = result.normal.dot(this.velocity);
            if (velocityAlongNormal < 0) {
                 this.velocity.addScaledVector(result.normal, -velocityAlongNormal);
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

    heesHawvoos(dt) {
        const deltaTime = Math.min(dt, 0.1);
        
        if (this.isTeleporting) {
            this.isTeleporting = false;
            return;
        }
        
        // B"H: NaN Protection
        if (this.mesh && (isNaN(this.mesh.position.x) || isNaN(this.mesh.position.y) || isNaN(this.mesh.position.z))) {
            console.warn("B\"H: Player position became NaN! Resetting to safe default.");
            this.velocity.set(0, 0, 0);
            this.setPosition(new THREE.Vector3(0, 15, 0)); 
            if(this.olam && this.olam.ayin) {
                this.olam.ayin.currentDistance = 5;
            }
            return;
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

        // 1. Ground Check
        this.checkGround(steepSlopeAngle);

        // 2. Forces
        this.applyForces(deltaTime, isWorldBusy);

        // 3. Movement Calc
        const moveData = this.calculateMovementVectors(deltaTime, this.onFloor);
        const { combinedVector, isWalking } = moveData;

        this.velocity.x += combinedVector.x;
        this.velocity.z += combinedVector.z;

        // 4. Jump
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

        // 5. Execution
        this.executeMovement(deltaTime);

        // 6. Ground Stick (Re-check ground after movement)
        const finalGroundHit = this.checkGround(steepSlopeAngle); 
        this.snapToGround(finalGroundHit, steepSlopeAngle, isWalking);

        // 7. Animation
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

        // 8. Sync
        this.syncMesh(deltaTime);
        this.updateSpheres(deltaTime);
        
        if (this.activeObject) {
            this.alignObject();
        }

        Tzomayach.prototype.heesHawvoos.call(this, deltaTime);
    }
};
