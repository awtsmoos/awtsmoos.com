// B"H
import { Vec3 } from '../../math/vec3.js';
import { generatePath, samplePathFrames } from '../../math/pathUtils.js';
import { mat4_core } from '../../math/mat4/core.js';
import { mat4_transformations } from '../../math/mat4/transformations.js';

/**
 * @file array.js
 * @brief Duplicates a mesh along a path or with a linear offset.
 *        Optimized to be safe for all JavaScript parsers.
 */

/**
 * B"H - Transforms a mesh's vertices and normals by a 4x4 matrix.
 */
function transformMesh(mesh, matrix) {
    const transformedFaces = [];
    const normalMatrix = mat4_core.identity();
    const invMat = mat4_core.inverse(mat4_core.identity(), matrix);
    if(invMat) mat4_core.transpose(normalMatrix, invMat);

    mesh.faces.forEach(face => {
        const newVerts = face.vertices.map(v => {
            const transformedPos = mat4_core.multiplyVec4(matrix, [...v.pos, 1.0]);
            const newV = { pos: [transformedPos[0], transformedPos[1], transformedPos[2]], col: [...v.col] };

            if (v.norm) {
                const transformedNorm = mat4_core.multiplyVec4(normalMatrix, [...v.norm, 0.0]);
                newV.norm = [transformedNorm[0], transformedNorm[1], transformedNorm[2]];
            }
            return newV;
        });
        transformedFaces.push({ vertices: newVerts });
    });
    return { faces: transformedFaces };
}

// B"H - Add Vec4 multiply helper to mat4_core
mat4_core.multiplyVec4 = (m, v) => {
    const x = v[0], y = v[1], z = v[2], w = v[3];
    return [
        m[0] * x + m[4] * y + m[8] * z + m[12] * w,
        m[1] * x + m[5] * y + m[9] * z + m[13] * w,
        m[2] * x + m[6] * y + m[10] * z + m[14] * w,
        m[3] * x + m[7] * y + m[11] * z + m[15] * w
    ];
};

/**
 * @brief Duplicates a mesh along a path or with a linear offset.
 */
export function arrayModifier(mesh, params) {
    const { count = 2, offset, path } = params;
    
    if (!mesh.faces || count < 1) return mesh;

    const allFaces = [];
    
    if (path) {
        // --- Path-based Array ---
        const pathPoints = generatePath(path);
        if (pathPoints.length < 2) return mesh; 
        
        const frames = samplePathFrames(pathPoints, count, path.closed || false);
        
        frames.forEach(frame => {
            const { pos, tangent, normal, binormal } = frame;
            
            const transform = [
                binormal[0], binormal[1], binormal[2], 0,
                tangent[0], tangent[1], tangent[2], 0,
                normal[0], normal[1], normal[2], 0,
                pos[0], pos[1], pos[2], 1
            ];
            
            const newMesh = transformMesh(mesh, transform);
            allFaces.push(...newMesh.faces);
        });

    } else if (offset) {
        // --- Transform-based Array ---
        if (Array.isArray(offset)) {
            allFaces.push(...mesh.faces); 
            for (let i = 1; i < count; i++) {
                const m = mat4_core.identity();
                mat4_transformations.translate(m, [offset[0] * i, offset[1] * i, offset[2] * i]);
                const newMesh = transformMesh(mesh, m);
                allFaces.push(...newMesh.faces);
            }
        } else if (typeof offset === 'object') {
            const posOff = offset.position || [0, 0, 0];
            const rotOff = offset.rotation || [0, 0, 0];
            const scaleOff = offset.scale || [1, 1, 1];

            const stepMatrix = mat4_core.identity();
            mat4_transformations.scale(stepMatrix, scaleOff);
            mat4_transformations.rotateX(stepMatrix, rotOff[0]);
            mat4_transformations.rotateY(stepMatrix, rotOff[1]);
            mat4_transformations.rotateZ(stepMatrix, rotOff[2]);
            mat4_transformations.translate(stepMatrix, posOff);

            allFaces.push(...mesh.faces); 

            let cumulativeMatrix = mat4_core.identity();
            for (let i = 1; i < count; i++) {
                mat4_core.multiply(cumulativeMatrix, cumulativeMatrix, stepMatrix);
                const newMesh = transformMesh(mesh, cumulativeMatrix);
                allFaces.push(...newMesh.faces);
            }
        }
    } else {
        return mesh; 
    }

    return { faces: allFaces };
}
