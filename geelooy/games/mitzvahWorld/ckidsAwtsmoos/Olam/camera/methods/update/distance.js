
// B"H
import { THREE } from '../../../rendering/ThreeAdapter.js';

export function calculateFinalDistance(isCorrected, rotation, vTargetOffset) {
    let smoothedDistance = (!isCorrected || this.correctedDistance > this.currentDistance) ?
        this.lerp(this.currentDistance, this.correctedDistance, 0.02 * this.zoomDampening) :
        this.correctedDistance;

    let minimumAllowedDistance = this.minDistance;

    if (!this.isFPS && this.target.collider) {
        const collider = this.target.collider;
        const pivotPoint = this.target.mesh.position.clone().sub(vTargetOffset);
        const sphereCenter = new THREE.Vector3().addVectors(collider.start, collider.end).multiplyScalar(0.5);
        const safetyRadius = collider.radius + this.playerCollisionBuffer;

        const pivotToCameraDir = new THREE.Vector3(0, 0, 1).applyQuaternion(rotation);
        const pivotToSphereCenterVec = sphereCenter.clone().sub(pivotPoint);

        const a = 1; 
        const b = -2 * pivotToCameraDir.dot(pivotToSphereCenterVec);
        const c = pivotToSphereCenterVec.lengthSq() - safetyRadius * safetyRadius;

        const discriminant = b * b - 4 * a * c;

        if (discriminant >= 0) {
            const sqrtDiscriminant = Math.sqrt(discriminant);
            const dist1 = (-b - sqrtDiscriminant) / (2 * a);
            const dist2 = (-b + sqrtDiscriminant) / (2 * a);

            if (dist1 > 0 && dist1 < dist2) {
                 minimumAllowedDistance = Math.max(this.minDistance, dist1);
            } else if (dist2 > 0) {
                 minimumAllowedDistance = Math.max(this.minDistance, dist2);
            }
        }
    }

    let finalDistance = Math.max(minimumAllowedDistance, smoothedDistance);
    finalDistance = Math.min(this.maxDistance, finalDistance); 

    if (finalDistance === minimumAllowedDistance && smoothedDistance < minimumAllowedDistance) {
        this.desiredDistance = minimumAllowedDistance;
    }

    return finalDistance;
}
