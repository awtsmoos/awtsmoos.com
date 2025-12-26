
// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import Utils from "../../../../utils.js";

export default {
    calculateMovementVectors(deltaTime, onFloor) {
        var speedDelta = deltaTime * (onFloor ? (this.speed * this.speedScale) : 8);
        if (!this.moving.running) {
            speedDelta *= 0.5;
        }

        let combinedVector = new THREE.Vector3();
        var isWalking = false;
        var isWalkingForward = false;
        var isWalkingBack = false;

        if (this.moving.forward || this.movingAutomatically) {
            isWalking = true;
            isWalkingForward = true;
            combinedVector.add(this.getForwardVector().multiplyScalar(speedDelta));
            this.targetRotateOffset = 0;
        } else if (this.moving.backward) {
            isWalking = true;
            isWalkingBack = true;
            combinedVector.add(this.getForwardVector().multiplyScalar(-speedDelta));
            this.targetRotateOffset = -Math.PI;
        }

        if (this.moving.stridingLeft) {
            isWalking = true;
            combinedVector.add(Utils.getSideVector(this.nonRotatingEmptyForMovement, this.worldSideDirectionVector).multiplyScalar(-speedDelta));
            this.targetRotateOffset = Math.PI / 2;
            if (isWalkingForward) this.targetRotateOffset -= Math.PI / 4;
            else if (isWalkingBack) this.targetRotateOffset += Math.PI / 4;
        } else if (this.moving.stridingRight) {
            isWalking = true;
            combinedVector.add(Utils.getSideVector(this.nonRotatingEmptyForMovement, this.worldSideDirectionVector).multiplyScalar(speedDelta));
            this.targetRotateOffset = -Math.PI / 2;
            if (isWalkingForward) this.targetRotateOffset += Math.PI / 4;
            else if (isWalkingBack) this.targetRotateOffset -= Math.PI / 4;
        }

        // Normalize speed if moving diagonally
        let totalMagnitude = combinedVector.length();
        let maxMagnitude = Math.abs(speedDelta);
        let scalingFactor = (totalMagnitude > maxMagnitude) ? (maxMagnitude / totalMagnitude) : 1;
        combinedVector.multiplyScalar(scalingFactor);

        return { combinedVector, isWalking, isWalkingForward, isWalkingBack };
    }
};
