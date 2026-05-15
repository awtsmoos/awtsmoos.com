
// B"H
/**
 * @file headSculptor.js
 * @brief Manifests the head base as a perfect UV sphere with sacred proportions.
 */
import { createUvSphereMesh } from '../primitives/uvSphere.js';
import { computeSmoothNormalsModifier } from '../modifiers/index.js';

export function createHumanoidHeadBase() {
    console.log('B"H - Sculptor: Manifesting UV Sphere (24 Rings, 32 Segments)...');
    
    // 1. Manifest the raw sphere according to the divine layout
    let head = createUvSphereMesh({ 
        radius: 3.5, 
        rings: 24, 
        segments: 32, 
        color: [0.94, 0.76, 0.64, 1.0] 
    });

    // 2. Assign Default Bone Weights (All to Bone 0 for initial test)
    // This ensures the Skinned Shader has valid data to work with.
    head.faces.forEach(face => {
        face.vertices.forEach(v => {
            v.boneIndices = [0, 0, 0, 0];
            v.boneWeights = [1.0, 0.0, 0.0, 0.0];
        });
    });

    return computeSmoothNormalsModifier(head);
}
