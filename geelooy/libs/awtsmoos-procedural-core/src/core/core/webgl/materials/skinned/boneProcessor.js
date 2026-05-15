
// B"H
/**
 * @file boneProcessor.js
 * @brief Manages the skeletal synchronization ritual for skinned meshes.
 */
import { mat4_core } from '../../../math/mat4/core.js';

export class BoneProcessor {
    /**
     * B"H - Updates the skeleton in local space and returns the final palette.
     */
    static process(skeleton, animationManager, objectId, currentTime) {
        if (!skeleton) return null;

        // 1. Animate bones locally (Phase 1: Local Desire)
        animationManager.updateSkeleton(skeleton, objectId, currentTime);

        // 2. Refresh local-to-model hierarchy (Phase 2: Local Form)
        // We anchor ALWAYS to identity here. This represents the object's origin.
        // The World Transformation happens in the Shader.
        skeleton.updateWorldMatrices(mat4_core.identity());

        // 3. Extract final weighted matrices (Phase 3: The Gift of Form)
        return skeleton.getFinalBoneMatrices();
    }
}
