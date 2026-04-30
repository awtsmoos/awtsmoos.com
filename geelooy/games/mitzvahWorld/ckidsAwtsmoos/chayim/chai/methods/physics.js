
/**
 * B"H
 * @file physics.js
 * The 'Kav' (Line) of physics that maintains order in the Olam.
 * Refactored into distinct functional steps. Fully safe-guarded against the void.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Utils from "../../../utils.js";
import Tzomayach from "../../tzomayach.js";

const _ground_check_ray = new THREE.Ray();

export default {
    
    setPosition(vec3) {
        if (!vec3 || isNaN(vec3.x) || isNaN(vec3.y) || isNaN(vec3.z)) {
            console.warn("B\"H: Attempted to set invalid position. Ignoring.");
            return;
        }
        if (!this.collider) return;
        this.collider.start.set(vec3.x, vec3.y + this.height / 2, vec3.z);
        this.collider.end.set(vec3.x, vec3.y + this.height, vec3.z);
        this.collider.radius = this.radius;
        this.isTeleporting = true;
    },

    collisions() {
        if (!this.olam || !this.olam.worldOctree || !this.collider) return; 
        const result = this.olam.worldOctree.capsuleIntersect(this.collider);
        if (result) {
            this.collider.translate(result.normal.multiplyScalar(result.depth));
            if(this.velocity) this.velocity.addScaledVector(result.normal, -result.normal.dot(this.velocity));
        }
    },

    async calculateOffset() {
        if (!this.onFloor || !this.collider) return;
        await new Promise(resolve => requestAnimationFrame(resolve));
        const raycaster = new THREE.Raycaster();
        raycaster.set(this.collider.start, new THREE.Vector3(0, -1, 0));
        const intersects = raycaster.intersectObjects(this.olam.scene.children, true);
        if (intersects.length > 0) this.offset = intersects[0].distance;
    },

    getCapsule() {
        if(!this.collider) return null;
        return { radius: this.collider.radius, height: this.collider.end.y - this.collider.start.y };
    },

    heesHawvoos(dt) {
        if (!this.mesh || !this.collider) return; // B"H: Extreme Safety Guard
        const deltaTime = Math.min(dt, 0.1);
        if (this.isTeleporting) { this.isTeleporting = false; return; }
        
        if (this._checkNaNAndReset()) return;

        this._updateSubSystems(deltaTime);
        
        const isWorldBusy = this.olam && this.olam.worldOctree ? this.olam.worldOctree.isProcessing : true;

        this._checkGround();
        this._applyPhysicsForces(deltaTime, isWorldBusy);
        this._calculateMovementVelocity(deltaTime);
        this._handleJump();
        this._executeMovement(deltaTime);
        this._resolveGroundCollision();
        this._checkAbyss();
        this._updateAnimationState(deltaTime);
        this._syncMesh(deltaTime);
        
        if (this.activeObject && typeof this.alignObject === 'function') this.alignObject();
        Tzomayach.prototype.heesHawvoos.call(this, deltaTime);
    },

    _checkNaNAndReset() {
        if (!this.mesh) return false;
        if (isNaN(this.mesh.position.x) || isNaN(this.mesh.position.y) || isNaN(this.mesh.position.z)) {
            console.warn("B\"H: Player position NaN! Resetting.", { was: this.mesh.position.clone() });
            if(this.velocity) this.velocity.set(0, 0, 0);
            this.setPosition(new THREE.Vector3(0, 15, 0));
            if(this.olam && this.olam.ayin) this.olam.ayin.currentDistance = 5;
            return true;
        }
        return false;
    },

    _updateSubSystems(deltaTime) {
        if(typeof this.updateRayColor === 'function') this.updateRayColor();      
        if(typeof this.updateHandState === 'function') this.updateHandState();     
        if(typeof this.updateBlockHighlight === 'function') this.updateBlockHighlight();
        if(typeof this.updateParticles === 'function') this.updateParticles(deltaTime);
        if (this.activeObject && this.activeObject.mesh && this.activeObject.mesh.userData && this.activeObject.mesh.userData.onUpdate) {
            this.activeObject.mesh.userData.onUpdate(deltaTime);
        }
    },

    _checkGround() {
        if(!this.collider) return;
        const steepSlopeAngle = Math.cos(THREE.MathUtils.degToRad(50));
        _ground_check_ray.origin.copy(this.collider.start);
        _ground_check_ray.direction.set(0, -1, 0);
        let groundHit = false;
        if(this.olam && this.olam.worldOctree) {
            groundHit = this.olam.worldOctree.rayIntersect(_ground_check_ray);
        }
        this.onFloor = groundHit && groundHit.normal.y > steepSlopeAngle && groundHit.distance <= this.radius + 0.25;
        this.groundHitResult = groundHit; 
    },

    _applyPhysicsForces(deltaTime, isWorldBusy) {
        if(!this.velocity) return;
        let damping = Math.exp(-20 * deltaTime) - 1;
        if (!this.onFloor) {
            if (!isWorldBusy && this.olam) this.velocity.y -= this.olam.GRAVITY * deltaTime;
            else this.velocity.y = 0; 
            
            const airDamping = damping * 0.1;
            this.velocity.x += this.velocity.x * airDamping;
            this.velocity.z += this.velocity.z * airDamping;
        } else {
            this.velocity.addScaledVector(this.velocity, damping);
        }
        this.velocity.y = Math.max(this.velocity.y, -50); 
    },

    _calculateMovementVelocity(deltaTime) {
        if(!this.velocity || !this.moving) return;
        var speedDelta = deltaTime * (this.onFloor ? ((this.speed || 10) * (this.speedScale || 1)) : 8);
        if (!this.moving.running) speedDelta *= 0.5;

        let combinedVector = new THREE.Vector3();
        this.isWalking = false;
        let isWalkingForward = false, isWalkingBack = false;

        if (this.moving.forward || this.movingAutomatically) {
            this.isWalking = true; isWalkingForward = true;
            if(typeof this.getForwardVector === 'function') combinedVector.add(this.getForwardVector().multiplyScalar(speedDelta));
            this.targetRotateOffset = 0;
        } else if (this.moving.backward) {
            this.isWalking = true; isWalkingBack = true;
            if(typeof this.getForwardVector === 'function') combinedVector.add(this.getForwardVector().multiplyScalar(-speedDelta));
            this.targetRotateOffset = -Math.PI;
        }

        if (this.moving.stridingLeft) {
            this.isWalking = true;
            if(this.nonRotatingEmptyForMovement) combinedVector.add(Utils.getSideVector(this.nonRotatingEmptyForMovement, this.worldSideDirectionVector).multiplyScalar(-speedDelta));
            this.targetRotateOffset = Math.PI / 2;
            if (isWalkingForward) this.targetRotateOffset -= Math.PI / 4;
            else if (isWalkingBack) this.targetRotateOffset += Math.PI / 4;
        } else if (this.moving.stridingRight) {
            this.isWalking = true;
            if(this.nonRotatingEmptyForMovement) combinedVector.add(Utils.getSideVector(this.nonRotatingEmptyForMovement, this.worldSideDirectionVector).multiplyScalar(speedDelta));
            this.targetRotateOffset = -Math.PI / 2;
            if (isWalkingForward) this.targetRotateOffset += Math.PI / 4;
            else if (isWalkingBack) this.targetRotateOffset -= Math.PI / 4;
        }

        let totalMagnitude = combinedVector.length();
        let maxMagnitude = Math.abs(speedDelta);
        let scalingFactor = (totalMagnitude > maxMagnitude) ? (maxMagnitude / totalMagnitude) : 1;
        combinedVector.multiplyScalar(scalingFactor);

        this.velocity.x += combinedVector.x;
        this.velocity.z += combinedVector.z;
    },

    _handleJump() {
        if(!this.velocity || !this.moving) return;
        if (this.onFloor && this.moving.jump) {
            this.jumped = true;
            this.velocity.y = this.jumpHeight || 10;
            if (!this.didJump) {
                this.didJump = true;
                if(typeof this.ayshPeula === 'function') this.ayshPeula("jumped", this);
            }
        } else {
            if (this.didJump) this.didJump = false;
        }
    },

    _executeMovement(deltaTime) {
        if(!this.velocity || !this.collider) return;
        const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime);
        const capsule = this.collider;
        let numSteps = Math.ceil(deltaPosition.length() / (capsule.radius * 0.5));
        if (numSteps > 10) numSteps = 10; 

        if(this.olam && this.olam.worldOctree) {
            if (numSteps > 1) {
                const stepDelta = deltaPosition.clone().divideScalar(numSteps);
                for (let i = 0; i < numSteps; i++) {
                    capsule.translate(stepDelta);
                    this.collisions();
                }
            } else {
                capsule.translate(deltaPosition);
                this.collisions();
            }
        }
    },

    _resolveGroundCollision() {
        if(!this.collider || !this.velocity) return;
        const steepSlopeAngle = Math.cos(THREE.MathUtils.degToRad(50));
        let finalGroundHit = false;
        if(this.olam && this.olam.worldOctree) finalGroundHit = this.olam.worldOctree.rayIntersect(_ground_check_ray);
        
        this.onFloor = finalGroundHit && finalGroundHit.normal.y > steepSlopeAngle && finalGroundHit.distance <= this.radius + 0.25;

        if (this.onFloor && this.velocity.y <= 0) {
            const penetrationDepth = this.radius - finalGroundHit.distance;
            if (penetrationDepth > 0) {
                this.collider.translate(finalGroundHit.normal.clone().multiplyScalar(penetrationDepth));
            }
            this.velocity.projectOnPlane(finalGroundHit.normal);
            if (!this.isWalking && (!this.moving || !this.moving.jump)) {
                this.velocity.x = 0; this.velocity.z = 0;
            }
            this.velocity.y = 0;
        }
    },

    _checkAbyss() {
        if(!this.collider) return;
        if (this.collider.start.y < -100) {
            if (!this._abyssLogTime || Date.now() - this._abyssLogTime > 5000) {
                console.log("B\"H: Player fell into abyss. Suspending gravity until reality catches up.");
                this._abyssLogTime = Date.now();
            }
            
            if(this.velocity) this.velocity.set(0, 0, 0);
            this.setPosition(new THREE.Vector3(0, 15, 0));
            
            if(this.olam && this.olam.worldOctree) {
                this.olam.worldOctree.isProcessing = true; 
            }
        }
    },

    _updateAnimationState(deltaTime) {
        if(!this.moving || !this.rotation) return;
        var rotationSpeed = (this.rotationSpeed || 2) * deltaTime;
        this.isTurning = false;

        const p = typeof this.playChaweeyoos === 'function' ? this.playChaweeyoos.bind(this) : ()=>{};
        const g = typeof this.getChaweeyoos === 'function' ? this.getChaweeyoos.bind(this) : ()=>null;
        const a = typeof this.ayshPeula === 'function' ? this.ayshPeula.bind(this) : ()=>{};

        if (this.moving.turningLeft) {
            if (!this.isWalking && this.onFloor) {
                p(g("left turn"));
                this.isTurning = true;
            }
            this.rotation.y += rotationSpeed;
            a("rotate", this.rotation.y);
        } else if (this.moving.turningRight) {
            if (!this.isWalking && this.onFloor) {
                p(g("right turn"));
                this.isTurning = true;
            }
            this.rotation.y -= rotationSpeed;
            a("rotate", this.rotation.y);
        }

        if (this.onFloor) {
            if (this.jumped && !this.moving.jump) {
                this.jumped = false;
                if (!this.hitFloor) {
                    this.hitFloor = true;
                    a("hit floor", this);
                }
            }
            if (this.isWalking) {
                p(g("run"));
                if (!this.startedWalking) {
                    this.startedWalking = true;
                    a("started walking", this);
                }
            } else if (!this.isTurning) {
                p(g("idle"));
            }
            if (!this.isWalking && this.startedWalking) {
                this.startedWalking = false;
                a("stopped walking", this);
            }
            this.fallingFrames = 0;
        } else {
            if (this.startedWalking) {
                this.startedWalking = false;
                a("stopped walking", this);
            }
            if (this.velocity && this.velocity.y > 0 && this.jumped) {
                this.fallingFrames = 0;
                p(g("jump"), { loop: false });
            } else if (this.velocity && this.jumped && this.velocity.y < -9) {
                p(g("falling"));
                this.fallingFrames = 0;
            } else if (this.velocity && !this.jumped && this.velocity.y < -3) {
                if (++this.fallingFrames > 14) p(g("falling"));
            }
        }
    },

    _syncMesh(deltaTime) {
        if (!this.mesh || !this.collider || !this.collider.start) return;
        
        // Center of physics
        this.mesh.position.copy(this.collider.start);
        
        // B"H: ABSOLUTE BOTTOM OF THE PHYSICS BOUNDARY
        const capsuleBottomY = this.collider.start.y - this.radius;

        if(this.rotation) this.mesh.rotation.y = this.rotation.y;
        
        if (this.emptyCopy && this.emptyCopy.rotation) this.emptyCopy.rotation.copy(this.mesh.rotation);
        if (this.nonRotatingEmptyForMovement && this.nonRotatingEmptyForMovement.rotation) this.nonRotatingEmptyForMovement.rotation.copy(this.mesh.rotation);

        this.targetRotateOffset = this.targetRotateOffset || 0;
        this.rotateOffset = this.rotateOffset || 0;
        this.lerpTurnSpeed = this.lerpTurnSpeed || 0.145;

        let angularDistance = this.targetRotateOffset - this.rotateOffset;
        if (angularDistance > Math.PI) angularDistance -= 2 * Math.PI;
        else if (angularDistance < -Math.PI) angularDistance += 2 * Math.PI;
        if (Math.abs(angularDistance - Math.PI) < 0.01) angularDistance = -Math.PI;
        
        this.rotateOffset += angularDistance * this.lerpTurnSpeed;
        if (this.rotateOffset > Math.PI) this.rotateOffset -= 2 * Math.PI;
        else if (this.rotateOffset < -Math.PI) this.rotateOffset += 2 * Math.PI;

        if (this.modelMesh && this.rotation) {
            this.modelMesh.rotation.y = this.rotation.y + this.rotateOffset;
            
            // B"H: TIKKUN OF ALIGNMENT
            // Ensure the visual mesh is aligned flawlessly with the physical reality.
            this.modelMesh.position.x = this.mesh.position.x;
            this.modelMesh.position.z = this.mesh.position.z;

            // The pivot offset tells us how far the feet are from the origin of the mesh.
            const pivotToFeet = this.visualYOffset || 0;
            const userSink = this.groundingOffset || 0;

            // Place the feet perfectly on the bottom of the capsule!
            this.modelMesh.position.y = capsuleBottomY - pivotToFeet - userSink;

            if (this.lastRotateOffset !== this.rotateOffset) {
                if(typeof this.ayshPeula === 'function') this.ayshPeula("rotate", this.modelMesh.rotation.y);
                this.lastRotateOffset = this.rotateOffset;
            }
        }
        
        if (this.emptyCopy) this.emptyCopy.position.copy(this.mesh.position);
        if (this.nonRotatingEmptyForMovement) this.nonRotatingEmptyForMovement.position.copy(this.mesh.position);
        if (this.modelMesh && this.emptyCopy) this.emptyCopy.rotation.copy(this.modelMesh.rotation);

        if (this.activeRay && this.olam && this.olam.ayin && this.olam.ayin.isFPS && this.rayAnchor) {
            const camera = this.olam.ayin.camera;
            if(camera) {
                this.rayAnchor.position.copy(camera.position);
                const cameraEuler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
                this.rayAnchor.rotation.y = cameraEuler.y;
            }
        }
        if(typeof this.updateSpheres === 'function') this.updateSpheres(deltaTime);
    }
};
