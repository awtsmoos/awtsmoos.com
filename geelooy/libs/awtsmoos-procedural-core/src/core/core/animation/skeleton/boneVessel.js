
// B"H
import { mat4_core } from '../../math/mat4/core.js';
import { mat4_transformations } from '../../math/mat4/transformations.js';

/**
 * @file boneVessel.js
 * @brief A singular vessel (Kli) in the skeletal hierarchy.
 * 
 * THE PSALM OF THE CAPTIVE SPARK (Revised):
 * Within each bone, a matrix lies still,
 * awaiting the breath of the Creator's Will.
 * But lest it forget where it first came to be,
 * we anchor its Bind Matrix, making it free.
 * For a soul without memory wanders the void,
 * But a bone with a bind matrix cannot be destroyed!
 */
export class BoneVessel {
    /**
     * @param {string} id - The sacred name of this bone.
     * @param {Array} position - The anchor point in space.
     */
    constructor(id, position = [0, 0, 0]) {
        this.id = id;
        this.parent = null;
        this.children =[];

        // B"H - Initializing matrices to ensure they are NEVER undefined
        this.localMatrix = mat4_core.identity();
        this.worldMatrix = mat4_core.identity();
        this.inverseBindMatrix = mat4_core.identity();

        mat4_transformations.translate(this.localMatrix, position);
        
        // B"H - THE FIX: The Bone must remember its initial state, or the 
        // Animation Manager will collapse it to absolute zero!
        this.bindMatrix = [...this.localMatrix];
        
        console.log(`B"H - BoneVessel [${this.id}] manifested at [${position}].`);
    }
}
