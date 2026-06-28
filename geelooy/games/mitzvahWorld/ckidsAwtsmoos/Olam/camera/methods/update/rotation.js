
// B"H
/**
 * @file rotation.js
 * @description
 * Chapter 4: The Independence of the Eye
 * "He who formed the eye, does He not see?" (Tehillim 94:9)
 * 
 * The camera's rotation (Theta and Phi) is now completely divorced from the physical 
 * update loop. It is modified asynchronously by the user's intent (`cameraDrag`). 
 * This file merely applies smooth following logic if the user releases control.
 */
import { THREE } from '../../../rendering/ThreeAdapter.js';

export function handleRotation() {
    if (!this.target || !this.target.mesh) return;

    // We calculate the delta of the vessel's rotation to allow the camera 
    // to gracefully follow the back of the player when walking.
    this.targetRotation = this.target.mesh.rotation.y * 180 / Math.PI;
    
    if (this.previousTargetRotation === undefined) {
        this.previousTargetRotation = this.targetRotation;
    }
    
    let rotationDelta = this.targetRotation - this.previousTargetRotation;

    if (!this.isFPS) {
        // B"H: The Pure Will (Da'as) overrides physical snapping.
        // Only auto-rotate to follow the player if the soul is NOT actively dragging the camera.
        if (!this.mouseIsDown && !this.rightMouseIsDown) {
            this.userInputTheta += rotationDelta; 
        }
    } else {
        this.desiredDistance = 0;
        // In FPS, the camera IS the face. The rotation matches exactly.
        if (!this.mouseIsDown && !this.rightMouseIsDown) {
            this.target.rotation.y = this.userInputTheta * THREE.MathUtils.DEG2RAD;
        }
    }
    
    this.previousTargetRotation = this.targetRotation;
}
