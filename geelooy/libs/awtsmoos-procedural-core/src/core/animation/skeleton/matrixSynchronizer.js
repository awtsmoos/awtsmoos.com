
// B"H
/**
 * @file matrixSynchronizer.js
 * @brief High-frequency transform propagation.
 */
import { mat4_core } from '../../math/mat4/core.js';

export class MatrixSynchronizer {
    /**
     * @param {BoneVessel} bone - Current node in the cascade.
     * @param {Array} parentWorld - The divine light from above (Matrix).
     */
    static sync(bone, parentWorld) {
        if (!bone) return;
        
        // Cascading the World Matrix T*R*S
        mat4_core.multiply(bone.worldMatrix, parentWorld, bone.localMatrix);

        // Branching through the children
        const children = bone.children;
        for (let i = 0; i < children.length; i++) {
            this.sync(children[i], bone.worldMatrix);
        }
    }
}
