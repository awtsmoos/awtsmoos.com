// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import { PHYSICS_CONSTANTS } from './physicsConstants.js';

export default {
    _updateAnimationState(deltaTime) {
        var rotationSpeed = this.rotationSpeed * deltaTime;
        this.isTurning = false;

        if (this.moving.turningLeft) {
            if (!this.isWalking && this.onFloor) {
                this.playChaweeyoos(this.getChaweeyoos("left turn"));
                this.isTurning = true;
            }
            this.rotation.y += rotationSpeed;
            this.ayshPeula("rotate", this.rotation.y);
        } else if (this.moving.turningRight) {
            if (!this.isWalking && this.onFloor) {
                this.playChaweeyoos(this.getChaweeyoos("right turn"));
                this.isTurning = true;
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
            if (this.isWalking) {
                this.playChaweeyoos(this.getChaweeyoos("run"));
                if (!this.startedWalking) {
                    this.startedWalking = true;
                    this.ayshPeula("started walking", this);
                }
            } else if (!this.isTurning) {
                this.playChaweeyoos(this.getChaweeyoos("idle"));
            }
            if (!this.isWalking && this.startedWalking) {
                this.startedWalking = false;
                this.ayshPeula("stopped walking", this);
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
                if (++this.fallingFrames > 14) this.playChaweeyoos(this.getChaweeyoos("falling"));
            }
        }
    },

    _syncMesh(deltaTime) {
        if (!this.mesh || !this.collider) return;
        this.mesh.position.copy(this.collider.start);
        this.mesh.position.y -= this.radius;
        this.mesh.rotation.y = this.rotation.y;
        
        if (this?.emptyCopy?.rotation) this.emptyCopy.rotation.copy(this.mesh.rotation);
        if (this?.nonRotatingEmptyForMovement?.rotation) this.nonRotatingEmptyForMovement.rotation.copy(this.mesh.rotation);

        let angularDistance = this.targetRotateOffset - this.rotateOffset;
        if (angularDistance > Math.PI) angularDistance -= 2 * Math.PI;
        else if (angularDistance < -Math.PI) angularDistance += 2 * Math.PI;
        if (Math.abs(angularDistance - Math.PI) < 0.01) angularDistance = -Math.PI;
        
        this.rotateOffset += angularDistance * this.lerpTurnSpeed;
        if (this.rotateOffset > Math.PI) this.rotateOffset -= 2 * Math.PI;
        else if (this.rotateOffset < -Math.PI) this.rotateOffset += 2 * Math.PI;

        if (this.modelMesh) {
            this.modelMesh.rotation.y = this.rotation.y + this.rotateOffset;
            if (this.lastRotateOffset !== this.rotateOffset) {
                this.ayshPeula("rotate", this.modelMesh.rotation.y);
                this.lastRotateOffset = this.rotateOffset;
            }
            this.modelMesh.position.copy(this.mesh.position);
            this.modelMesh.position.y += Number(this.modelMesh.userData?.visualGroundOffsetY || 0);
        }
        
        if(this.emptyCopy) this.emptyCopy.position.copy(this.mesh.position);
        if(this.nonRotatingEmptyForMovement) this.nonRotatingEmptyForMovement.position.copy(this.mesh.position);
        if(this.emptyCopy && this.modelMesh) this.emptyCopy.rotation.copy(this.modelMesh.rotation);

        if (this.activeRay && this.olam && this.olam.ayin && this.olam.ayin.isFPS) {
            const camera = this.olam.ayin.camera;
            if (this.rayAnchor) {
                this.rayAnchor.position.copy(camera.position);
                const cameraEuler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
                this.rayAnchor.rotation.y = cameraEuler.y;
            }
        }
        
        if(typeof this.updateSpheres === 'function') {
            this.updateSpheres(deltaTime);
        }
    }
};
