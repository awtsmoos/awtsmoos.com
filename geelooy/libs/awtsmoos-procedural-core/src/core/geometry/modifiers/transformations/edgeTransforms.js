
// B"H
/**
 * @file edgeTransforms.js
 * @chapter THE BENDING OF THE BORDERS
 */

import { Vec3 } from '../../../math/vec3.js';
import { executeCondition } from '../../../logic/pureConditionals.js';

const updateSharedVertices = (mesh, oldPositions, newPositions) => {
    mesh.faces.forEach(face => face.vertices.forEach(vertex => {
        oldPositions.forEach((origPos, i) => {
            executeCondition(Vec3.equals(vertex.pos, origPos), () => {
                vertex.pos = [...newPositions[i]];
            });
        });
    }));
};

const getEdgeData = (mesh, faceIndex, edgeIndex) => {
    const isValid = mesh && mesh.faces && faceIndex >= 0 && faceIndex < mesh.faces.length;
    return executeCondition(isValid, () => {
        const targetFace = mesh.faces[faceIndex];
        const numVerts = targetFace.vertices.length;
        return executeCondition(edgeIndex >= 0 && edgeIndex < numVerts, () => {
            const idx1 = edgeIndex;
            const idx2 = (edgeIndex + 1) % numVerts;
            return {
                p1: [...targetFace.vertices[idx1].pos],
                p2: [...targetFace.vertices[idx2].pos]
            };
        }, () => null);
    }, () => null);
};

export const translateEdgeModifier = (mesh, faceIndex, edgeIndex, translation) => {
    return executeCondition(translation && translation.length === 3, () => {
        const edge = getEdgeData(mesh, faceIndex, edgeIndex);
        return executeCondition(!!edge, () => {
            const newP1 = Vec3.add(edge.p1, translation);
            const newP2 = Vec3.add(edge.p2, translation);
            updateSharedVertices(mesh, [edge.p1, edge.p2], [newP1, newP2]);
            return mesh;
        }, () => mesh);
    }, () => mesh);
};

export const scaleEdgeModifier = (mesh, faceIndex, edgeIndex, scale) => {
    const edge = getEdgeData(mesh, faceIndex, edgeIndex);
    return executeCondition(!!edge, () => {
        const center = Vec3.scale(Vec3.add(edge.p1, edge.p2), 0.5);
        const newP1 = Vec3.add(center, Vec3.scale(Vec3.sub(edge.p1, center), scale));
        const newP2 = Vec3.add(center, Vec3.scale(Vec3.sub(edge.p2, center), scale));
        updateSharedVertices(mesh, [edge.p1, edge.p2], [newP1, newP2]);
        return mesh;
    }, () => mesh);
};

export const rotateEdgeModifier = (mesh, faceIndex, edgeIndex, axis, angleRadians) => {
    const edge = getEdgeData(mesh, faceIndex, edgeIndex);
    return executeCondition(!!edge, () => {
        const center = Vec3.scale(Vec3.add(edge.p1, edge.p2), 0.5);
        const cosA = Math.cos(angleRadians);
        const sinA = Math.sin(angleRadians);

        const ROTATION_DISPATCH = {
            'x': (l) => [l[0], l[1] * cosA - l[2] * sinA, l[1] * sinA + l[2] * cosA],
            'z': (l) => [l[0] * cosA - l[1] * sinA, l[0] * sinA + l[1] * cosA, l[2]],
            'default': (l) => [l[0] * cosA - l[2] * sinA, l[1], l[0] * sinA + l[2] * cosA]
        };

        const transform = (p) => {
            const local = Vec3.sub(p, center);
            const rotated = (ROTATION_DISPATCH[axis] || ROTATION_DISPATCH['default'])(local);
            return Vec3.add(rotated, center);
        };

        updateSharedVertices(mesh, [edge.p1, edge.p2], [transform(edge.p1), transform(edge.p2)]);
        return mesh;
    }, () => mesh);
};
