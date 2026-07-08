
// B"H
import { THREE } from '../../rendering/ThreeAdapter.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
    calculateDesiredPosition(targetMesh, rotation, targetHeight, desiredDistance, isFPS) {
        if (!targetMesh) return new THREE.Vector3();

        const vTargetOffset = new THREE.Vector3(0, isFPS ? -targetHeight * 0.95 : -targetHeight, 0);
        const position = new THREE.Vector3().copy(targetMesh.position);
        
        position.sub(vTargetOffset);
        position.sub(new THREE.Vector3(0, 0, desiredDistance).applyQuaternion(rotation));
        
        return { position, vTargetOffset };
    },

    checkWallCollision(start, end, worldOctree, offsetFromWall, currentDistance) {
        const dir = end.clone().sub(start);
        const len = dir.length();
        if (len < 0.00001) return currentDistance;

        const raycaster = new THREE.Raycaster(start, dir.normalize(), 0, len);
        const collisionResult = worldOctree ? worldOctree.rayIntersect(raycaster.ray) : null;

        if (collisionResult) {
            return Math.max(0.1, collisionResult.distance - offsetFromWall);
        }
        return currentDistance;
    },

    checkPlayerCollision(meshPosition, vTargetOffset, rotation, collider, minDistance) {
        const pivotPoint = meshPosition.clone().sub(vTargetOffset);
        const sphereCenter = new THREE.Vector3().addVectors(collider.start, collider.end).multiplyScalar(0.5);
        // Safety margin to prevent clipping
        const safetyRadius = collider.radius + 0.77; 

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

            if (dist1 > 0 && dist1 < dist2) return Math.max(minDistance, dist1);
            if (dist2 > 0) return Math.max(minDistance, dist2);
        }
        return minDistance;
    }
};
