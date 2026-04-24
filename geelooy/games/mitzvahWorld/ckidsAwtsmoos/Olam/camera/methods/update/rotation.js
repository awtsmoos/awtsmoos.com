
// B"H
import * as THREE from '/games/scripts/build/three.module.js';

export function handleRotation() {
    if(!this.isFPS) {
        if(this.lastDistance) {
            this.desiredDistance = this.lastDistance;
            this.lastDistance = null; 
            var f = this.target.modelMesh || this.target.mesh;
            f.visible = true;

            this.target.rotation.y = this.userInputTheta * THREE.MathUtils.DEG2RAD;
            this.previousTargetRotation = this.target.rotation.y * 180/Math.PI;
            this.target.rotateOffset = 0;
        } else {
            const dY = (typeof this.deltaY === 'number' && !isNaN(this.deltaY)) ? this.deltaY : 0;
            this.desiredDistance -= dY * 0.02 * this.zoomRate * Math.abs(this.desiredDistance) * this.speedDistance;
            this.desiredDistance = Math.max(Math.min(this.desiredDistance, this.maxDistance), this.minDistance);
        }
    } else {
        if(this.lastDistance === null) {
            this.lastDistance = this.desiredDistance;
            var f = this.target.modelMesh || this.target.mesh;
            f.visible = false;
            this.target.rotation.y = this.userInputTheta * THREE.MathUtils.DEG2RAD;
            this.previousTargetRotation = this.target.rotation.y * 180/Math.PI;
            this.target.rotateOffset = 0;
        }
        this.desiredDistance = 0;
    }
    
    this.targetRotation = this.target.mesh.rotation.y * 180 / Math.PI;
    if (this.previousTargetRotation === undefined) this.previousTargetRotation = this.targetRotation;
    let rotationDelta = this.targetRotation - this.previousTargetRotation;

    if(!this.isFPS) {
        if (this.mouseIsDown || this.rightMouseIsDown) {
            this.userInputTheta -= this.mouseX * this.xSpeed * this.sensitivity;
        } else {
            this.userInputTheta += rotationDelta;
        }
        this.userInputPhi -= this.mouseY * this.ySpeed * this.sensitivity;
        this.previousTargetRotation = this.targetRotation;
    } 
}
