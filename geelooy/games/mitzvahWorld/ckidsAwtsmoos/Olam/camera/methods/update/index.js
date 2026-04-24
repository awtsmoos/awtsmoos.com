
// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import { handleRotation } from "./rotation.js";
import { calculateFinalDistance } from "./distance.js";

export default function update() {
    if (!this.target) return;
    
    if (isNaN(this.target.mesh.position.x) || isNaN(this.target.mesh.position.y) || isNaN(this.target.mesh.position.z)) {
        return;
    }

    this.newMovement = false;
    
    if (this.rightMouseIsDown && this.mouseIsDown) {
        if (this.target.olam) {
            this.target.olam.ayshPeula("setInput", { code: "KeyW" });
            this.sentToOlam = true;
        }    
    } else {
        if (this.sentToOlam) {
            this.sentToOlam = false;
            this.target.olam.ayshPeula("setInputOut", { code: "KeyW" });
        }
    }

    handleRotation.call(this);

    this.deltaY = 0;
    this.userInputPhi = this.clampAngle(this.userInputPhi, this.yMinLimit, this.yMaxLimit);

    this.euler = new THREE.Euler(this.userInputPhi * THREE.MathUtils.DEG2RAD, this.userInputTheta * THREE.MathUtils.DEG2RAD, 0, 'YXZ');
    let rotation = new THREE.Quaternion().setFromEuler(this.euler);

    const vTargetOffset = new THREE.Vector3(0, -this.targetHeight, 0);
    let position = new THREE.Vector3().copy(this.target.mesh.position).sub(vTargetOffset);
    position.sub(new THREE.Vector3(0, 0, this.desiredDistance).applyQuaternion(rotation)); 
    
    let isCorrected = false;
    this.correctedDistance = this.desiredDistance;

    if (!this.isFPS) {
        let trueTargetPosition = new THREE.Vector3().copy(this.target.mesh.position).sub(vTargetOffset);
        this.raycaster.set(trueTargetPosition, position.clone().sub(trueTargetPosition).normalize());
        
        let collisionResult = this.olam.worldOctree ? this.olam.worldOctree.rayIntersect(this.raycaster.ray) : null;
        if (collisionResult) {
            let distanceToObject = collisionResult.distance - this.offsetFromWall;
            if (distanceToObject < this.correctedDistance) {
                this.correctedDistance = distanceToObject;
                isCorrected = true;
            }
        }
    }
    
    this.currentDistance = calculateFinalDistance.call(this, isCorrected, rotation, vTargetOffset);

    position = new THREE.Vector3().copy(this.target.mesh.position).sub(vTargetOffset);
    position.sub(new THREE.Vector3(0, 0, this.currentDistance).applyQuaternion(rotation)); 

    var did = false;
    if (this.isFPS) {
        if (this.mouseIsDown || this.rightMouseIsDown) {
            this.target.rotation.y = this.euler.y;
        } else {
            did = true;
            this.euler.y = this.target.rotation.y;
            rotation = new THREE.Quaternion().setFromEuler(this.euler);
            position = new THREE.Vector3().copy(this.target.mesh.position).sub(vTargetOffset);
            position.sub(new THREE.Vector3(0, 0, this.currentDistance).applyQuaternion(rotation)); 
            this.userInputTheta = this.euler.y * 180/Math.PI;
        }
    } else if (this.rightMouseIsDown) {
        this.target.rotation.y = this.euler.y;
    }

    this.camera.rotation.copy(this.euler);
    if(position && !isNaN(position.x) && !isNaN(position.y) && !isNaN(position.z)) {
        this.camera.position.copy(position);
        this.cameraFollower.position.copy(position);
    }

    var pos = this.target.mesh.position.clone();
    pos.y += this.targetHeight;
    if (!isNaN(pos.x)) {
        this.camera.lookAt(pos);
        this.cameraFollower.lookAt(pos);
    }
}
