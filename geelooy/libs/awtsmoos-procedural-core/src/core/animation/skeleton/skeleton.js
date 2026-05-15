
// B"H
import { BoneVessel } from './boneVessel.js';
import { HierarchyEngine } from './hierarchyEngine.js';
import { MatrixSynchronizer } from './matrixSynchronizer.js';
import { mat4_core } from '../../math/mat4/core.js';

/**
 * @file skeleton.js
 * @brief Orchestrates the assembly of the human spirit (Skeleton).
 */
export class Skeleton {
    constructor(boneData) {
        this.bones = [];
        this.boneMap = new Map();
        
        // 1. Manifst individual vessels
        boneData.forEach(data => {
            const bone = new BoneVessel(data.id, data.position);
            this.bones.push(bone);
            this.boneMap.set(data.id, bone);
        });

        // 2. Weave the Seder Hishtalshelus (Link hierarchy)
        HierarchyEngine.link(this.boneMap, boneData);

        // 3. CAPTURE SACRED BIND POSE
        // We initialize world matrices relative to Identity. 
        // This anchors the "Bind pose" exactly to the [0,0,0] used by modifiers.
        this.updateWorldMatrices(mat4_core.identity());
        
        // Finalize bone matrices and calculate inverse binders
        this.bones.forEach(b => {
            // b.inverseBindMatrix = Inverse(b.worldMatrix)
            mat4_core.inverse(b.inverseBindMatrix, b.worldMatrix);
            // Store world position as Bind Position for memory
            b.bindPosition = [b.worldMatrix[12], b.worldMatrix[13], b.worldMatrix[14]];
        });
        
        console.log(`B"H - Skeleton: Unified form captured for ${this.bones.length} joints.`);
    }

    getBoneById(id) { return this.boneMap.get(id); }

    /**
     * B"H - Cascades transformations down the lineage.
     */
    updateWorldMatrices(worldModelMatrix = null) {
        const rootAnchor = worldModelMatrix || mat4_core.identity();
        
        const roots = this.bones.filter(b => !b.parent);
        roots.forEach(root => {
            MatrixSynchronizer.sync(root, rootAnchor);
        });
    }

    /**
     * B"H - Final Synthesis: palette = BoneWorld * BoneInverseBind.
     */
    getFinalBoneMatrices() {
        const palette = new Float32Array(this.bones.length * 16);
        this.bones.forEach((bone, i) => {
            const final = mat4_core.identity();
            mat4_core.multiply(final, bone.worldMatrix, bone.inverseBindMatrix);
            palette.set(final, i * 16);
        });
        return palette;
    }
}
