// B"H
/**
 * Old working mitzvahWorld camera follow math restored.
 * It follows `target.mesh.position` directly and avoids the newer dynamic height
 * calculator that was pushing the view far away from the player.
 */
import * as THREE from '/games/scripts/build/three.module.js';

function lerpFallback(a, b, t) {
    return a + (b - a) * t;
}

export default function update() {
    if (!this.target || !this.target.mesh) return;

    if (isNaN(this.target.mesh.position.x) || isNaN(this.target.mesh.position.y) || isNaN(this.target.mesh.position.z)) {
        return;
    }

    this.newMovement = false;

    if (this.rightMouseIsDown && this.mouseIsDown) {
        if (this.target.olam) {
            this.target.olam.ayshPeula("setInput", { code: "KeyW" });
            this.sentToOlam = true;
        }
    } else if (this.sentToOlam) {
        this.sentToOlam = false;
        this.target.olam.ayshPeula("setInputOut", { code: "KeyW" });
    }

    if (!this.isFPS) {
        if (this.lastDistance) {
            this.desiredDistance = this.lastDistance;
            this.lastDistance = null;
            const f = this.target.modelMesh || this.target.mesh;
            if (f) f.visible = true;

            this.target.rotation.y = this.userInputTheta * THREE.MathUtils.DEG2RAD;
            this.previousTargetRotation = this.target.rotation.y * 180 / Math.PI;
            this.target.rotateOffset = 0;
        } else {
            const dY = (typeof this.deltaY === 'number' && !isNaN(this.deltaY)) ? this.deltaY : 0;
            this.desiredDistance -= dY * 0.02 * this.zoomRate * Math.abs(this.desiredDistance) * this.speedDistance;
            this.desiredDistance = Math.max(Math.min(this.desiredDistance, this.maxDistance), this.minDistance);
        }
    } else {
        if (this.lastDistance === null) {
            this.lastDistance = this.desiredDistance;
            const f = this.target.modelMesh || this.target.mesh;
            if (f) f.visible = false;

            this.target.rotation.y = this.userInputTheta * THREE.MathUtils.DEG2RAD;
            this.previousTargetRotation = this.target.rotation.y * 180 / Math.PI;
            this.target.rotateOffset = 0;
        }
        this.desiredDistance = 0;
    }

    this.targetRotation = this.target.mesh.rotation.y * 180 / Math.PI;
    if (this.previousTargetRotation === undefined) this.previousTargetRotation = this.targetRotation;
    const rotationDelta = this.targetRotation - this.previousTargetRotation;

    if (!this.isFPS) {
        if (this.mouseIsDown || this.rightMouseIsDown) {
            this.userInputTheta -= this.mouseX * this.xSpeed * this.sensitivity;
        } else {
            this.userInputTheta += rotationDelta;
        }
        this.userInputPhi -= this.mouseY * this.ySpeed * this.sensitivity;
        this.previousTargetRotation = this.targetRotation;
    }

    this.deltaY = 0;
    this.userInputPhi = this.clampAngle(this.userInputPhi, this.yMinLimit, this.yMaxLimit);

    this.euler = new THREE.Euler(
        this.userInputPhi * THREE.MathUtils.DEG2RAD,
        this.userInputTheta * THREE.MathUtils.DEG2RAD,
        0,
        'YXZ'
    );
    let rotation = new THREE.Quaternion().setFromEuler(this.euler);

    let isCorrected = false;
    this.correctedDistance = this.desiredDistance;

    const vTargetOffset = new THREE.Vector3(0, -this.targetHeight, 0);
    let position = new THREE.Vector3().copy(this.target.mesh.position);
    position.sub(vTargetOffset);
    position.sub(new THREE.Vector3(0, 0, this.desiredDistance).applyQuaternion(rotation));

    if (!this.isFPS) {
        const trueTargetPosition = new THREE.Vector3().copy(this.target.mesh.position).sub(vTargetOffset);
        this.raycaster.set(trueTargetPosition, position.clone().sub(trueTargetPosition).normalize());

        const collisionResult = this.olam.worldOctree ? this.olam.worldOctree.rayIntersect(this.raycaster.ray) : null;
        if (collisionResult) {
            const distanceToObject = collisionResult.distance - this.offsetFromWall;
            if (distanceToObject < this.correctedDistance) {
                this.correctedDistance = distanceToObject;
                isCorrected = true;
            }
        }
    }

    const lerp = typeof this.lerp === 'function' ? this.lerp.bind(this) : lerpFallback;
    const smoothedDistance = (!isCorrected || this.correctedDistance > this.currentDistance)
        ? lerp(this.currentDistance, this.correctedDistance, 0.02 * this.zoomDampening)
        : this.correctedDistance;

    let minimumAllowedDistance = this.minDistance;

    if (!this.isFPS && this.target.collider) {
        const collider = this.target.collider;
        const pivotPoint = this.target.mesh.position.clone().sub(vTargetOffset);
        const sphereCenter = new THREE.Vector3().addVectors(collider.start, collider.end).multiplyScalar(0.5);
        const safetyRadius = collider.radius + this.playerCollisionBuffer;
        const pivotToCameraDir = new THREE.Vector3(0, 0, 1).applyQuaternion(rotation);
        const pivotToSphereCenterVec = sphereCenter.clone().sub(pivotPoint);

        const b = -2 * pivotToCameraDir.dot(pivotToSphereCenterVec);
        const c = pivotToSphereCenterVec.lengthSq() - safetyRadius * safetyRadius;
        const discriminant = b * b - 4 * c;

        if (discriminant >= 0) {
            const sqrtDiscriminant = Math.sqrt(discriminant);
            const dist1 = (-b - sqrtDiscriminant) / 2;
            const dist2 = (-b + sqrtDiscriminant) / 2;
            if (dist1 > 0 && dist1 < dist2) minimumAllowedDistance = Math.max(this.minDistance, dist1);
            else if (dist2 > 0) minimumAllowedDistance = Math.max(this.minDistance, dist2);
        }
    }

    let finalDistance = Math.max(minimumAllowedDistance, smoothedDistance);
    finalDistance = Math.min(this.maxDistance, finalDistance);
    if (finalDistance === minimumAllowedDistance && smoothedDistance < minimumAllowedDistance) {
        this.desiredDistance = minimumAllowedDistance;
    }
    this.currentDistance = finalDistance;

    position = new THREE.Vector3().copy(this.target.mesh.position);
    position.sub(vTargetOffset);
    position.sub(new THREE.Vector3(0, 0, this.currentDistance).applyQuaternion(rotation));

    let did = false;
    if (this.isFPS) {
        if (this.mouseIsDown || this.rightMouseIsDown) {
            this.target.rotation.y = this.euler.y;
        } else {
            did = true;
            this.euler.y = this.target.rotation.y;
            rotation = new THREE.Quaternion().setFromEuler(this.euler);
            position = new THREE.Vector3().copy(this.target.mesh.position);
            position.sub(vTargetOffset);
            position.sub(new THREE.Vector3(0, 0, this.currentDistance).applyQuaternion(rotation));
            this.userInputTheta = this.euler.y * 180 / Math.PI;
        }
    } else if (this.rightMouseIsDown) {
        this.target.rotation.y = this.euler.y;
    }

    this.camera.rotation.copy(this.euler);
    if (position && !isNaN(position.x) && !isNaN(position.y) && !isNaN(position.z)) {
        this.camera.position.copy(position);
        this.cameraFollower.position.copy(position);
    }

    const pos = this.target.mesh.position.clone();
    pos.y += this.targetHeight;
    if (!isNaN(pos.x)) {
        this.camera.lookAt(pos);
        this.cameraFollower.lookAt(pos);
    }

    if (did) {
        // Kept for old behavior extension point.
    }
}
