
// B"H
/**
 * @file coreRotation.js
 * @chapter THE SPINNING OF THE SPHERES
 * 
 * THE TRACTATE OF THE ORBIT:
 * The 9 Spheres turn, the celestial bodies align,
 * By the mathematical matrices of the design.
 * We rotate the face, we twist the clay,
 * A pure dictionary directs the axis' way!
 */

import { Vec3 } from '../../../math/vec3.js';
import { executeCondition } from '../../../logic/pureConditionals.js';

export const rotateFaceModifier = (mesh, faceIndex, axis, angleRadians) => {
    return executeCondition(mesh && mesh.faces && faceIndex >= 0 && faceIndex < mesh.faces.length, () => {
        const targetFace = mesh.faces[faceIndex];
        
        let center = [0, 0, 0];
        targetFace.vertices.forEach(v => { center = Vec3.add(center, v.pos); });
        center = Vec3.scale(center, 1.0 / targetFace.vertices.length);

        const originalPositions = [];
        const newPositions = [];
        const cosA = Math.cos(angleRadians);
        const sinA = Math.sin(angleRadians);

        const ROTATION_DISPATCH = {
            'x': (l) => [l[0], l[1] * cosA - l[2] * sinA, l[1] * sinA + l[2] * cosA],
            'z': (l) => [l[0] * cosA - l[1] * sinA, l[0] * sinA + l[1] * cosA, l[2]],
            'default': (l) => [l[0] * cosA - l[2] * sinA, l[1], l[0] * sinA + l[2] * cosA] // y-axis
        };

        targetFace.vertices.forEach(v => {
            originalPositions.push([...v.pos]);
            const local = Vec3.sub(v.pos, center);
            const rotated = (ROTATION_DISPATCH[axis] || ROTATION_DISPATCH['default'])(local);
            newPositions.push(Vec3.add(rotated, center));
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
