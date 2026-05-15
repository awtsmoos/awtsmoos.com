
// B"H
/**
 * @file extrudeFaces.js
 * @brief Performs segmented regional extrusion by cloning topology layers.
 * 
 * THE HYMN OF THE GENERATIONAL LIMB:
 * A limb is not a stretched skin, but a lineage of rings.
 * At every step, we birth a new generation of points.
 * The Old Points remain, holding the memory of where we stood.
 * The New Points advance, carrying the Cap to the new height.
 * Between them, the Walls are woven, creating the holy segments.
 * Thus the arm bends, and the light flows across the living chain.
 */
import { Vec3 } from '../../math/vec3.js';
import { queryFaces } from '../../selection/faceQuery.js';
import { VertexWelder } from '../utils/vertexWelder.js';
import { MeshTopology } from '../../selection/topology.js';
import { computeSmoothNormalsModifier } from './computeNormals.js';

export function extrudeFaces(mesh, options) {
    let targetIndices = queryFaces(mesh, options.query);
    if (!targetIndices || targetIndices.length === 0) return mesh;

    const totalDistance = options.distance || 1.0;
    const steps = Math.max(1, options.steps || 1);
    const stepDistance = totalDistance / steps;
    
    // B"H - Vector scaling allows asymmetrical volume inflation
    const totalScale = options.scale !== undefined ? options.scale : 1.0;
    const isVecScale = Array.isArray(totalScale);
    let stepScale = 1.0, ssX = 1.0, ssY = 1.0, ssZ = 1.0;
    
    if (isVecScale) {
        ssX = Math.pow(totalScale[0], 1.0 / steps);
        ssY = Math.pow(totalScale[1], 1.0 / steps);
        ssZ = Math.pow(totalScale[2], 1.0 / steps);
    } else {
        stepScale = Math.pow(totalScale, 1.0 / steps);
    }

    let avgNormal = [0, 0, 0];
    targetIndices.forEach(idx => {
        const v = mesh.faces[idx].vertices;
        if (v.length >= 3) {
            const n = Vec3.normalize(Vec3.cross(Vec3.sub(v[1].pos, v[0].pos), Vec3.sub(v[v.length-1].pos, v[0].pos)));
            avgNormal = Vec3.add(avgNormal, n);
        }
    });
    const moveVec = Vec3.scale(Vec3.normalize(avgNormal), stepDistance);

    for (let s = 0; s < steps; s++) {
        const capFaceObjects = targetIndices.map(i => mesh.faces[i]);
        const uniqueCapVertices = new Set();
        capFaceObjects.forEach(f => f.vertices.forEach(v => uniqueCapVertices.add(v)));

        const boundaryEdges = MeshTopology.getBoundaryEdges(mesh, targetIndices);
        const vertexMap = new Map();
        const groups = VertexWelder.getRegionalVertexGroups(mesh, uniqueCapVertices);
        
        let centroid = [0, 0, 0];
        groups.forEach(g => centroid = Vec3.add(centroid, g[0].pos));
        centroid = Vec3.scale(centroid, 1 / groups.length);

        groups.forEach(group => {
            const sourcePos = group[0].pos;
            let newPos = Vec3.add(sourcePos, moveVec);
            
            if (isVecScale) {
                const toCenter = Vec3.sub(newPos, centroid);
                newPos = Vec3.add(centroid, [toCenter[0] * ssX, toCenter[1] * ssY, toCenter[2] * ssZ]);
            } else if (stepScale !== 1.0) {
                const toCenter = Vec3.sub(newPos, centroid);
                newPos = Vec3.add(centroid, Vec3.scale(toCenter, stepScale));
            }

            group.forEach(oldV => {
                const newV = {
                    pos: [...newPos],
                    col:[...oldV.col], 
                    norm: oldV.norm ? [...oldV.norm] : undefined,
                    boneIndices: oldV.boneIndices ? [...oldV.boneIndices] : undefined,
                    boneWeights: oldV.boneWeights ? [...oldV.boneWeights] : undefined
                };
                vertexMap.set(oldV, newV);
            });
        });

        const newWalls =[];
        boundaryEdges.forEach(edge => {
            const { v1, v2 } = edge;
            const nextV1 = vertexMap.get(v1);
            const nextV2 = vertexMap.get(v2);

            if (nextV1 && nextV2) {
                const wall = {
                    vertices:[v1, v2, nextV2, nextV1],
                    tags: options.assignSideTag ?[options.assignSideTag] :[]
                };
                newWalls.push(wall);
            }
        });

        capFaceObjects.forEach(face => {
            face.vertices = face.vertices.map(v => {
                const newV = vertexMap.get(v);
                if (!newV) return v;
                return newV;
            });
            
            if (options.assignCapTag) {
                if (!face.tags) face.tags =[];
                if (!face.tags.includes(options.assignCapTag)) face.tags.push(options.assignCapTag);
            }
        });

        mesh.faces.push(...newWalls);
    }

    return computeSmoothNormalsModifier(mesh);
}
