
// B"H
/**
 * @file index.js
 * @description
 * Chapter 3: The Gaze of the Infinite
 * "He looks upon the earth, and it trembles; He touches the mountains, and they smoke." (Tehillim 104:32)
 * The Ayin (Eye) is the vessel through which the soul perceives the Olam.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { handleRotation } from "./rotation.js";
import { calculateFinalDistance } from "./distance.js";
import HeightCalculator from "./HeightCalculator.js?v=player-gltf-sanitize-20260527";

export default function update() {
    if (!this.target) return;
    
    if (isNaN(this.target.mesh.position.x) || isNaN(this.target.mesh.position.y) || isNaN(this.target.mesh.position.z)) {
        return;
    }

    this.newMovement = false;
    
    // B"H: Input bridge for simultaneous mouse actions
    if (this.rightMouseIsDown && this.mouseIsDown) {
        if (this.target.olam) {
            this.target.olam.ayshPeula("setInput", { code: "KeyW" });
            this.sentToOlam = true;
        }    
    } else if (this.sentToOlam) {
        this.sentToOlam = false;
        this.target.olam.ayshPeula("setInputOut", { code: "KeyW" });
    }

    handleRotation.call(this);

    this.deltaY = 0;
    this.userInputPhi = this.clampAngle(this.userInputPhi, this.yMinLimit, this.yMaxLimit);

    this.euler = new THREE.Euler(this.userInputPhi * THREE.MathUtils.DEG2RAD, this.userInputTheta * THREE.MathUtils.DEG2RAD, 0, 'YXZ');
    let rotation = new THREE.Quaternion().setFromEuler(this.euler);

    // B"H: Dynamic Summit Detection via modular calculus
    let targetHeadHeight = HeightCalculator.calculate(this.target, this.targetHeight);
    
    // Apply the Sacred Offset
    const finalAnchorY = -targetHeadHeight + (this.anchorOffset ? this.anchorOffset.y : 0);
    const vTargetOffset = new THREE.Vector3(0, finalAnchorY, 0);
    
    let position = new THREE.Vector3().copy(this.target.mesh.position).sub(vTargetOffset);
    position.sub(new THREE.Vector3(0, 0, this.desiredDistance).applyQuaternion(rotation)); 
    
    let isCorrected = false;
    this.correctedDistance = this.desiredDistance;

    // Obstacle Detection (Collision)
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

    // Final Placement calculation
    position = new THREE.Vector3().copy(this.target.mesh.position).sub(vTargetOffset);
    position.sub(new THREE.Vector3(0, 0, this.currentDistance).applyQuaternion(rotation)); 

    // Character Orientation Sync
    if (this.isFPS) {
        if (this.mouseIsDown || this.rightMouseIsDown) {
            this.target.rotation.y = this.euler.y;
        } else {
            this.euler.y = this.target.rotation.y;
            rotation = new THREE.Quaternion().setFromEuler(this.euler);
            position = new THREE.Vector3().copy(this.target.mesh.position).sub(vTargetOffset);
            position.sub(new THREE.Vector3(0, 0, this.currentDistance).applyQuaternion(rotation)); 
            this.userInputTheta = this.euler.y * 180 / Math.PI;
        }
    } else if (this.rightMouseIsDown) {
        this.target.rotation.y = this.euler.y;
    }

    // Apply Transformation to the Perceiving Eye
    this.camera.rotation.copy(this.euler);
    if(position && !isNaN(position.x) && !isNaN(position.y) && !isNaN(position.z)) {
        this.camera.position.copy(position);
        this.cameraFollower.position.copy(position);
    }

    // Look intensely at the focal point of the head
    const focusPoint = this.target.mesh.position.clone();
    focusPoint.y += (targetHeadHeight - (this.anchorOffset ? this.anchorOffset.y : 0));
    
    if (!isNaN(focusPoint.x)) {
        this.camera.lookAt(focusPoint);
        this.cameraFollower.lookAt(focusPoint);
    }
}
