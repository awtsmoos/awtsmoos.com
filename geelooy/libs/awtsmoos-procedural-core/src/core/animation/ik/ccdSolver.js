
// B"H
/**
 * @file ccdSolver.js
 * @brief Simple CCD IK solver. Rotates bones in a chain to bring an effector to a target.
 */
import { Vec3 } from '../../math/vec3.js';
import { mat4_transformations } from '../../math/mat4/transformations.js';

export function solveCCD(skeleton, effectorId, targetPos, iterations = 10, threshold = 0.1) {
    if (!skeleton) return;
    const effectorBone = skeleton.getBoneById(effectorId);
    if (!effectorBone) return;

    for (let iter = 0; iter < iterations; iter++) {
        let current = effectorBone.parent;
        while (current) {
            const effectorPos = [effectorBone.worldMatrix[12], effectorBone.worldMatrix[13], effectorBone.worldMatrix[14]];
            const currentPos = [current.worldMatrix[12], current.worldMatrix[13], current.worldMatrix[14]];

            if (Vec3.dist(effectorPos, targetPos) < threshold) break;

            const toEffector = Vec3.normalize(Vec3.sub(effectorPos, currentPos));
            const toTarget = Vec3.normalize(Vec3.sub(targetPos, currentPos));

            const cosAngle = Vec3.dot(toEffector, toTarget);
            if (cosAngle < 0.9999) {
                const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
                const axis = Vec3.normalize(Vec3.cross(toEffector, toTarget));
                
                // This is a simplified rotation application. A more robust solution
                // would use quaternions to avoid gimbal lock and provide smoother interpolation.
                mat4_transformations.rotateX(current.localMatrix, axis[0] * angle);
                mat4_transformations.rotateY(current.localMatrix, axis[1] * angle);
                mat4_transformations.rotateZ(current.localMatrix, axis[2] * angle);
                
                // After modifying a bone's local matrix, we must update the world matrices
                // for all subsequent bones in the chain for the next iteration.
                skeleton.updateWorldMatrices();
            }
            current = current.parent;
            if (!current || current === skeleton.bones[0]) break; // Stop at root or if no parent
        }
    }
}
