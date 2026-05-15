
// B"H
/**
 * @file headWeights.js
 * @brief Manually assigns skeletal influences to UV sphere vertices.
 */
import { WEIGHT_TABLE } from './headConstants.js';

export function applyHeadWeights(mesh) {
    const visited = new Set();
    
    mesh.faces.forEach(face => {
        face.vertices.forEach(v => {
            if (visited.has(v)) return;
            visited.add(v);

            const r = v.ringIdx;
            // Bone 0: Skull (Head)
            // Bone 1: Jaw (Rotating)
            
            let jawWeight = WEIGHT_TABLE[r] || 0;
            
            // Only vertices in the front area should be influenced by the jaw transition?
            // No, the entire lower skull/jaw ring rotates.
            
            v.boneIndices = [0, 1, 0, 0];
            v.boneWeights = [1.0 - jawWeight, jawWeight, 0, 0];
        });
    });
    
    return mesh;
}
