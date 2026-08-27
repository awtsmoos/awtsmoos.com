
// B"H
/**
 * @file vertexTransforms.js
 * @chapter THE SHIFTING OF THE SINGLE SPARK
 */

import { Vec3 } from '../../../math/vec3.js';
import { executeCondition } from '../../../logic/pureConditionals.js';

export const translateVertexModifier = (mesh, faceIndex, vertIndex, translation) => {
    const isValid = mesh && mesh.faces && faceIndex >= 0 && faceIndex < mesh.faces.length;
    return executeCondition(isValid, () => {
        const targetFace = mesh.faces[faceIndex];
        return executeCondition(vertIndex >= 0 && vertIndex < targetFace.vertices.length, () => {
            const oldPos = [...targetFace.vertices[vertIndex].pos];
            const newPos = Vec3.add(oldPos, translation);

            mesh.faces.forEach(face => face.vertices.forEach(vertex => {
                executeCondition(Vec3.equals(vertex.pos, oldPos), () => {
                    vertex.pos = [...newPos];
                });
            }));
            return mesh;
        }, () => mesh);
    }, () => mesh);
};
