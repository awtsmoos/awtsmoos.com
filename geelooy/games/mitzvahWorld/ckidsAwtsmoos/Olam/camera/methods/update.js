// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import CameraMath from './calculatePosition.js';

/**
 * update - The constant adjustment of the spiritual eye (Ayin).
 * Calculates the kav (line) between the target and the observer.
 */
export default function update() {
    if (!this.target || !this.target.mesh) return;
    
    // B"H: NaN Guard - If the world forge is in flux, do not glitch the eye.
    // This prevents the camera from getting invalid matrices which crashes the renderer.
    if (isNaN(this.target.mesh.position.x) || isNaN(this.target.mesh.position.y) || isNaN(this.target.mesh.position.z)) {
        return;
    }

    this.newMovement = false;
    
    // Mouse movement input logic
    const isWDown = this.rightMouseIsDown && this.mouseIsDown;
    if(isWDown) {
        if(this.target.olam) this.target.olam.ayshPeula("setInput", { code: "KeyW" });
        this.sentToOlam = true;
    } else if(this.sentToOlam) {
        this.sentToOlam = false;
        if(this.target.olam) this.target.olam.ayshPeula("setInputOut", { code: "KeyW" });
    }

    // --- Distance and Mode Logic ---
    if(!this.isFPS) {
        if(this.lastDistance !== null) {
            // Restore from FPS mode
            this.desiredDistance = this.lastDistance;
            this.lastDistance = null; 
            if(this.target.modelMesh) this.target.modelMesh.visible = true;
            else if(this.target.mesh) this.target.mesh.visible = true;

            this.target.rotation.y = this.userInputTheta * THREE.MathUtils.DEG2RAD;
            this.previousTargetRotation = this.target.rotation.y * 180 / Math.PI;
            if(this.target.rotateOffset !== undefined) this.target.rotateOffset = 0;
        } else {
            // Standard Zoom
            const dY = (typeof this.deltaY === 'number' && !isNaN(this.deltaY)) ? this.deltaY : 0;
            this.desiredDistance -= dY * 0.02 * this.zoomRate * Math.abs(this.desiredDistance) * this.speedDistance;
            this.desiredDistance = THREE.MathUtils.clamp(this.desiredDistance, this.minDistance, this.maxDistance);
        }
    } else {
        // FPS Mode: Target is hidden, distance is zero
        if(this.lastDistance === null) {
            this.lastDistance = this.desiredDistance;
            if(this.target.modelMesh) this.target.modelMesh.visible = false;
            else if(this.target.mesh) this.target.mesh.visible = false;

            this.target.rotation.y = this.userInputTheta * THREE.MathUtils.DEG2RAD;
            this.previousTargetRotation = this.target.rotation.y * 180 / Math.PI;
            if(this.target.rotateOffset !== undefined) this.target.rotateOffset = 0;
        }
        this.desiredDistance = 0;
    }

    // --- Rotation Sync ---
    this.targetRotation = this.target.mesh.rotation.y * 180 / Math.PI;
    if (this.previousTargetRotation === undefined) this.previousTargetRotation = this.targetRotation;
    const rotationDelta = this.targetRotation - this.previousTargetRotation;

    if(!this.isFPS) {
        if (!(this.mouseIsDown || this.rightMouseIsDown)) {
            // Camera follows target rotation when not being manually rotated
            this.userInputTheta += rotationDelta;
        } 
        // Note: manual rotation (dragging) is handled in rotateAroundTarget via controls.js
        this.previousTargetRotation = this.targetRotation;
    } 

    this.deltaY = 0;
    this.userInputPhi = this.clampAngle(this.userInputPhi, this.yMinLimit, this.yMaxLimit);
    
    this.euler = new THREE.Euler(this.userInputPhi * THREE.MathUtils.DEG2RAD, this.userInputTheta * THREE.MathUtils.DEG2RAD, 0, 'YXZ');
    const rotation = new THREE.Quaternion().setFromEuler(this.euler);
    
    // --- Final Position Calculation ---
    let tHeight = (typeof(this.targetHeight) === 'number' && !isNaN(this.targetHeight)) ? this.targetHeight : 1.5;
    
    const { position: rawPosition, vTargetOffset } = CameraMath.calculateDesiredPosition(this.target.mesh, rotation, tHeight, this.desiredDistance, this.isFPS);
    
    this.correctedDistance = this.desiredDistance;
    let isCorrected = false;

    // 1. Wall Collision Detection
    if(!this.isFPS) {
        const trueTargetPosition = this.target.mesh.position.clone().sub(vTargetOffset);
        const dist = CameraMath.checkWallCollision(trueTargetPosition, rawPosition, this.olam.worldOctree, this.offsetFromWall, this.desiredDistance);
        if (dist < this.correctedDistance) {
            this.correctedDistance = dist;
            isCorrected = true;
        }
    }

    // 2. Smoothing
    let smoothedDistance = (!isCorrected || this.correctedDistance > this.currentDistance) ?
        this.lerp(this.currentDistance, this.correctedDistance, 0.02 * this.zoomDampening) :
        this.correctedDistance;
    
    // 3. Player Vessel Clipping Guard
    let minimumAllowedDistance = this.minDistance;
    if (!this.isFPS && this.target.collider) {
        minimumAllowedDistance = CameraMath.checkPlayerCollision(this.target.mesh.position, vTargetOffset, rotation, this.target.collider, this.minDistance);
    }
    
    this.currentDistance = THREE.MathUtils.clamp(Math.max(minimumAllowedDistance, smoothedDistance), this.minDistance, this.maxDistance);
    
    // 4. Set Final Position
    const finalPosInfo = CameraMath.calculateDesiredPosition(this.target.mesh, rotation, tHeight, this.currentDistance, this.isFPS);
    const finalPosition = finalPosInfo.position;

    // 5. FPS and Mouse State Alignments
    if(this.isFPS) {
         if (this.mouseIsDown || this.rightMouseIsDown) {
             this.target.rotation.y = this.euler.y;
         } else {
             this.euler.y = this.target.rotation.y;
             const rot = new THREE.Quaternion().setFromEuler(this.euler);
             const posFPS = CameraMath.calculateDesiredPosition(this.target.mesh, rot, tHeight, this.currentDistance, true).position;
             finalPosition.copy(posFPS);
             this.userInputTheta = this.euler.y * THREE.MathUtils.RAD2DEG;
         }
    } else if(this.rightMouseIsDown) {
        this.target.rotation.y = this.euler.y;
    }

    // 6. Apply to Camera - Only if Valid
    if (!isNaN(finalPosition.x) && !isNaN(finalPosition.y) && !isNaN(finalPosition.z)) {
        this.camera.rotation.copy(this.euler);
        this.camera.position.copy(finalPosition);
        this.cameraFollower.position.copy(finalPosition);
    } else {
        console.warn("B\"H: Camera calculated NaN position. Skipping update.");
    }

    // 7. LookAt Sync
    const lookAtPos = this.target.mesh.position.clone();
    lookAtPos.y += tHeight;
    if (!isNaN(lookAtPos.x)) {
        this.camera.lookAt(lookAtPos);
        this.cameraFollower.lookAt(lookAtPos);
    }
}