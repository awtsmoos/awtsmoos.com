
// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import CameraMath from './calculatePosition.js';

export default function update() {
    if (!this.target || !this.target.mesh) return;
    
    // B"H: NaN Check
    if (isNaN(this.target.mesh.position.x) || isNaN(this.target.mesh.position.y)) return;

    this.newMovement = false;
    const isWDown = this.rightMouseIsDown && this.mouseIsDown;
    
    if(isWDown) {
        if(this.target.olam) this.target.olam.ayshPeula("setInput", { code: "KeyW" });
        this.sentToOlam = true;
    } else if(this.sentToOlam) {
        this.sentToOlam = false;
        if(this.target.olam) this.target.olam.ayshPeula("setInputOut", { code: "KeyW" });
    }

    if(!this.isFPS) {
        if(this.lastDistance !== null) {
            this.desiredDistance = this.lastDistance;
            this.lastDistance = null; 
            if(this.target.modelMesh) this.target.modelMesh.visible = true;
            else if(this.target.mesh) this.target.mesh.visible = true;

            this.target.rotation.y = this.userInputTheta * THREE.MathUtils.DEG2RAD;
            this.previousTargetRotation = this.target.rotation.y * 180 / Math.PI;
            if(this.target.rotateOffset !== undefined) this.target.rotateOffset = 0;
        } else {
            const dY = (typeof this.deltaY === 'number' && !isNaN(this.deltaY)) ? this.deltaY : 0;
            this.desiredDistance -= dY * 0.02 * this.zoomRate * Math.abs(this.desiredDistance) * this.speedDistance;
            this.desiredDistance = Math.max(Math.min(this.desiredDistance, this.maxDistance), this.minDistance);
        }
    } else {
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

    this.targetRotation = this.target.mesh.rotation.y * 180 / Math.PI;
    if (this.previousTargetRotation === undefined) this.previousTargetRotation = this.targetRotation;
    const rotationDelta = this.targetRotation - this.previousTargetRotation;

    if(!this.isFPS) {
        if (!(this.mouseIsDown || this.rightMouseIsDown)) {
            this.userInputTheta += rotationDelta;
        } else {
             this.userInputTheta -= this.mouseX * this.xSpeed * this.sensitivity;
        }
        this.userInputPhi -= this.mouseY * this.ySpeed * this.sensitivity;
        this.previousTargetRotation = this.targetRotation;
    } 

    this.deltaY = 0;
    this.userInputPhi = this.clampAngle(this.userInputPhi, this.yMinLimit, this.yMaxLimit);
    
    this.euler = new THREE.Euler(this.userInputPhi * THREE.MathUtils.DEG2RAD, this.userInputTheta * THREE.MathUtils.DEG2RAD, 0, 'YXZ');
    const rotation = new THREE.Quaternion().setFromEuler(this.euler);
    
    // --- Modular Math Calls ---
    let tHeight = typeof(this.targetHeight) === 'number' && !isNaN(this.targetHeight) ? this.targetHeight : 1.5;
    
    // 1. Initial Position Calculation
    const { position: rawPosition, vTargetOffset } = CameraMath.calculateDesiredPosition(this.target.mesh, rotation, tHeight, this.desiredDistance, this.isFPS);
    
    this.correctedDistance = this.desiredDistance;
    let isCorrected = false;

    // 2. Wall Collision
    if(!this.isFPS) {
        const trueTargetPosition = this.target.mesh.position.clone().sub(vTargetOffset);
        const dist = CameraMath.checkWallCollision(trueTargetPosition, rawPosition, this.olam.worldOctree, this.offsetFromWall, this.desiredDistance);
        if (dist < this.correctedDistance) {
            this.correctedDistance = dist;
            isCorrected = true;
        }
    }

    let smoothedDistance = (!isCorrected || this.correctedDistance > this.currentDistance) ?
        this.lerp(this.currentDistance, this.correctedDistance, 0.02 * this.zoomDampening) :
        this.correctedDistance;
    
    // 3. Player Sphere Collision
    let minimumAllowedDistance = this.minDistance;
    if (!this.isFPS && this.target.collider) {
        minimumAllowedDistance = CameraMath.checkPlayerCollision(this.target.mesh.position, vTargetOffset, rotation, this.target.collider, this.minDistance);
    }
    
    let finalDistance = Math.max(minimumAllowedDistance, smoothedDistance);
    finalDistance = Math.min(this.maxDistance, finalDistance); 
    
    if (finalDistance === minimumAllowedDistance && smoothedDistance < minimumAllowedDistance) {
        this.desiredDistance = minimumAllowedDistance;
    }
    
    this.currentDistance = finalDistance;
    
    // 4. Final Position
    const finalPosInfo = CameraMath.calculateDesiredPosition(this.target.mesh, rotation, tHeight, this.currentDistance, this.isFPS);
    const finalPosition = finalPosInfo.position;

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

    this.camera.rotation.copy(this.euler);
    if (!isNaN(finalPosition.x)) {
        this.camera.position.copy(finalPosition);
        this.cameraFollower.position.copy(finalPosition);
    }

    const lookAtPos = this.target.mesh.position.clone();
    lookAtPos.y += tHeight;
    if (!isNaN(lookAtPos.x)) {
        this.camera.lookAt(lookAtPos);
        this.cameraFollower.lookAt(lookAtPos);
    }
}
