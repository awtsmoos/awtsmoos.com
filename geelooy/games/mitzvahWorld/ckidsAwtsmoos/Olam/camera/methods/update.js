//B"H
import * as THREE from '/games/scripts/build/three.module.js';

/**
 * Update logic for the Ayin (Camera).
 * Hardened against NaN values to ensure the gaze remains steady
 * through the constant creation and recreation of the world.
 */
export default function update() {
    if (!this.target || !this.target.mesh) return;
    
    const pos = this.target.mesh.position;
    // B"H: Extreme Guard - Verify all physical dimensions are manifested
    if (isNaN(pos.x) || isNaN(pos.y) || isNaN(pos.z)) {
        // If target is in the abyss, attempt to anchor the camera to the last known origin
        return;
    }

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
            const f = this.target.modelMesh || this.target.mesh;
            if(f) f.visible = true;
            this.target.rotation.y = this.userInputTheta * THREE.MathUtils.DEG2RAD;
            this.previousTargetRotation = this.target.rotation.y * 180 / Math.PI;
        } else {
            const dY = (typeof this.deltaY === 'number' && !isNaN(this.deltaY)) ? this.deltaY : 0;
            this.desiredDistance -= dY * 0.02 * this.zoomRate * Math.abs(this.desiredDistance) * this.speedDistance;
            this.desiredDistance = Math.max(Math.min(this.desiredDistance, this.maxDistance), this.minDistance);
        }
    } else {
        if(this.lastDistance === null) {
            this.lastDistance = this.desiredDistance;
            const f = this.target.modelMesh || this.target.mesh;
            if(f) f.visible = false;
            this.target.rotation.y = this.userInputTheta * THREE.MathUtils.DEG2RAD;
            this.previousTargetRotation = this.target.rotation.y * 180 / Math.PI;
        }
        this.desiredDistance = 0;
    }

    this.targetRotation = this.target.mesh.rotation.y * 180 / Math.PI;
    if (this.previousTargetRotation === undefined) this.previousTargetRotation = this.targetRotation;
    const rotationDelta = this.targetRotation - this.previousTargetRotation;

    if(!this.isFPS) {
        if (!(this.mouseIsDown || this.rightMouseIsDown)) {
            this.userInputTheta += rotationDelta;
        }
        this.previousTargetRotation = this.targetRotation;
    } 

    this.deltaY = 0;
    this.userInputPhi = this.clampAngle(this.userInputPhi, this.yMinLimit, this.yMaxLimit);
    
    // B"H: Convert Degree accumulators to Radians for Three.js Euler
    this.euler = new THREE.Euler(this.userInputPhi * THREE.MathUtils.DEG2RAD, this.userInputTheta * THREE.MathUtils.DEG2RAD, 0, 'YXZ');
    const rotation = new THREE.Quaternion().setFromEuler(this.euler);
    this.correctedDistance = this.desiredDistance;

    const tHeight = typeof(this.targetHeight) === 'number' && !isNaN(this.targetHeight) ? this.targetHeight : 1.5;
    const currentHeight = this.isFPS ? -tHeight * 0.95 : -tHeight;
    const vTargetOffset = new THREE.Vector3(0, currentHeight, 0);
    
    let position = new THREE.Vector3().copy(this.target.mesh.position);
    position.sub(vTargetOffset);
    position.sub(new THREE.Vector3(0, 0, this.desiredDistance).applyQuaternion(rotation)); 

    if(!this.isFPS) {
        const trueTargetPosition = this.target.mesh.position.clone().sub(vTargetOffset);
        const dir = position.clone().sub(trueTargetPosition);
        if (dir.lengthSq() > 0.00001) {
            this.raycaster.set(trueTargetPosition, dir.normalize());
            const collisionResult = this.olam.worldOctree ? this.olam.worldOctree.rayIntersect(this.raycaster.ray) : null;

            if (collisionResult) {
                const distanceToObject = collisionResult.distance - this.offsetFromWall;
                if (distanceToObject < this.correctedDistance) {
                    this.correctedDistance = distanceToObject;
                }
            }
        }
    }
    
    let finalDistance = Math.min(this.maxDistance, Math.max(this.minDistance, this.correctedDistance));
    this.currentDistance = THREE.MathUtils.lerp(this.currentDistance, finalDistance, 0.1);
    
    position = new THREE.Vector3().copy(this.target.mesh.position).sub(vTargetOffset);
    position.sub(new THREE.Vector3(0, 0, this.currentDistance).applyQuaternion(rotation)); 
    
    if(this.isFPS || this.rightMouseIsDown) this.target.rotation.y = this.euler.y;

    this.camera.rotation.copy(this.euler);
    if (!isNaN(position.x)) {
        this.camera.position.copy(position);
        this.cameraFollower.position.copy(position);
    }

    const lookAtPos = this.target.mesh.position.clone();
    lookAtPos.y += tHeight;
    if (!isNaN(lookAtPos.x)) {
        this.camera.lookAt(lookAtPos);
    }
}