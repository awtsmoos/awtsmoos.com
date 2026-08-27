
// B"H
/**
 * @file attachmentResolver.js
 * @brief Performs the sacred union of child and bone through matrix transformation.
 * 
 * THE CALCULUS OF CONCENTRICITY:
 * To place the Yarmulke and Hair such that the head is INSIDE them, we must align
 * their origins with the geometric center of the skull. 
 * This center is derived by taking 'head_top' and dropping down by the radius.
 */

import { mat4_core } from '../../../../math/mat4/core.js';
import { mat4_transformations } from '../../../../math/mat4/transformations.js';

export class AttachmentResolver {
    static bind(localMatrix, child, parent) {
        if (!child.attachment || !child.attachment.bone || !parent || !parent.skeletonInstance) return;

        const bone = parent.skeletonInstance.getBoneById(child.attachment.bone);
        if (!bone) return;

        const boneTransform = mat4_core.identity();
        for (let i = 0; i < 16; i++) boneTransform[i] = bone.worldMatrix[i];

        let offsetX = 0, offsetY = 0, offsetZ = 0;

        if (child.attachment.useExportedPoint && parent.exportedPoints) {
            const pointName = child.attachment.useExportedPoint;
            const pt = parent.exportedPoints[pointName];
            
            if (pt) {
                // Map Point (Object Space) -> Bone (Local Rest Space)
                const invBind = bone.inverseBindMatrix;
                const x = pt[0], y = pt[1], z = pt[2];
                let w = invBind[3]*x + invBind[7]*y + invBind[11]*z + invBind[15];
                w = w || 1.0;
                
                offsetX += (invBind[0]*x + invBind[4]*y + invBind[8]*z + invBind[12]) / w;
                offsetY += (invBind[1]*x + invBind[5]*y + invBind[9]*z + invBind[13]) / w;
                offsetZ += (invBind[2]*x + invBind[6]*y + invBind[10]*z + invBind[14]) / w;
                
                // B"H - INTENSE DIAGNOSTIC
                if (!child.__loggedPoint) {
                    console.log(`B"H - [${child.id}] using exported point '${pointName}' at world [${pt.map(c=>c.toFixed(2)).join(', ')}]`);
                    child.__loggedPoint = true;
                }

            } else if (!child.__warnedPoint) {
                 console.warn(`B"H - Attachment [${child.id}] desires exported point '${pointName}', but it was not found in the vessel of [${parent.id}].`);
                 child.__warnedPoint = true;
            }
        } 
        
        if (child.attachment.offset) {
            offsetX += child.attachment.offset[0];
            offsetY += child.attachment.offset[1];
            offsetZ += child.attachment.offset[2];
        }

        if (!child.__loggedInit) {
            console.log(`B"H - Attachment [${child.id}] bound to [${bone.id}]. Final Local Vector: [${offsetX.toFixed(3)}, ${offsetY.toFixed(3)}, ${offsetZ.toFixed(3)}]`);
            child.__loggedInit = true;
        }

        mat4_transformations.translate(boneTransform, [offsetX, offsetY, offsetZ]);
        mat4_core.multiply(localMatrix, boneTransform, localMatrix);
    }
}
