
// B"H
/**
 * @file coreScale.js
 * @chapter THE EXPANSION OF THE VESSEL
 * 
 * THE PSALM OF PROPORTION:
 * The vessel must expand to hold the infinite light,
 * And contract to form the shadows of the night.
 * From the centroid, the vectors stretch and grow,
 * Sustained by the Speech that makes the rivers flow!
 */

import { Vec3 } from '../../../math/vec3.js';
import { executeCondition } from '../../../logic/pureConditionals.js';

export const scaleFaceModifier = (mesh, faceIndex, scale) => {
    return executeCondition(mesh && mesh.faces && faceIndex >= 0 && faceIndex < mesh.faces.length, () => {
        const s = scale !== undefined ? scale : 1.0;
        const targetFace = mesh.faces[faceIndex];
        
        let center = [0, 0, 0];
        targetFace.vertices.forEach(v => { center = Vec3.add(center, v.pos); });
        center = Vec3.scale(center, 1.0 / targetFace.vertices.length);

        const originalPositions = [];
        const newPositions = [];

        targetFace.vertices.forEach(v => {
            originalPositions.push([...v.pos]);
            const dir = Vec3.sub(v.pos, center);
            const scaledDir = Vec3.scale(dir, s);
            newPositions.push(Vec3.add(center, scaledDir));
        });

        mesh.faces.forEach(face => {
            face.vertices.forEach(vertex => {
                originalPositions.forEach((origPos, i) => {
                    executeCondition(Vec3.equals(vertex.pos, origPos), () => {
                        vertex.pos = [...newPositions[i]];
                    });
                });
            });
        });
        
        return mesh;
    }, () => mesh);
};
