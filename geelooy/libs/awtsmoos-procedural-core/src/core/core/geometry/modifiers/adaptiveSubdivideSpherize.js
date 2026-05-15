
// B"H
/**
 * @file adaptiveSubdivideSpherize.js
 * @brief A divine modifier that heavily subdivides a localized region, 
 *        automatically heals the boundary with the unsubdivided mesh by triangulating the gap, 
 *        and then pulls all internal points outward into a perfect spherical form.
 * 
 * THE HYMN OF THE MENDED GAP:
 * When the inner world multiplies, and the outer world stands still,
 * A gap appears in the garment, against the Creator's Will.
 * We find the broken edge, we draw a line to the core,
 * And triangulate the border, so the void is seen no more!
 * Then we breathe into the vessel, expanding it with grace,
 * Until the blocky extrusion becomes a perfect, rounded face.
 */

import { Vec3 } from '../../math/vec3.js';
import { VertexWelder } from '../utils/vertexWelder.js';
import { queryFaces } from '../selection/faceQuery.js';

function lerpColor(c1, c2, t) {
    if (!c1 || !c2) return [1, 1, 1, 1];
    return[
        c1[0] + (c2[0] - c1[0]) * t,
        c1[1] + (c2[1] - c1[1]) * t,
        c1[2] + (c2[2] - c1[2]) * t,
        c1[3] + (c2[3] - c1[3]) * t
    ];
}

export function adaptiveSpherizeModifier(mesh, params) {
    const targetFaceIndices = queryFaces(mesh, params.query);
    if (!targetFaceIndices || !targetFaceIndices.length) return mesh;

    const levels = params.levels || 2;
    let currentFaces = mesh.faces;
    let targetSet = new Set(targetFaceIndices);

    for (let l = 0; l < levels; l++) {
        const nextFaces =[];
        const newTargetSet = new Set();
        const edgeMidpoints = new Map(); 

        const getEdgeKey = (v1, v2) => {
            const h1 = VertexWelder.getPositionHash(v1.pos);
            const h2 = VertexWelder.getPositionHash(v2.pos);
            return h1 < h2 ? `${h1}_${h2}` : `${h2}_${h1}`;
        };

        // Pass 1: generate midpoints for all edges of TARGET faces
        for (let i = 0; i < currentFaces.length; i++) {
            if (!targetSet.has(i)) continue;
            const face = currentFaces[i];
            const v = face.vertices;
            for (let j = 0; j < v.length; j++) {
                const v1 = v[j];
                const v2 = v[(j + 1) % v.length];
                const key = getEdgeKey(v1, v2);
                if (!edgeMidpoints.has(key)) {
                    edgeMidpoints.set(key, {
                        pos: Vec3.lerp(v1.pos, v2.pos, 0.5),
                        col: lerpColor(v1.col, v2.col, 0.5),
                        boneIndices: v1.boneIndices ? [...v1.boneIndices] : undefined,
                        boneWeights: v1.boneWeights ? [...v1.boneWeights] : undefined
                    });
                }
            }
        }

        // Pass 2: build new faces and automatically triangulate neighbors
        for (let i = 0; i < currentFaces.length; i++) {
            const face = currentFaces[i];
            const v = face.vertices;
            const tags = face.tags ? [...face.tags] :[];

            if (targetSet.has(i)) {
                // Subdivide the target face into 4 smaller faces
                let centerPos = [0, 0, 0];
                let centerCol =[0, 0, 0, 0];
                for (let j = 0; j < v.length; j++) {
                    centerPos = Vec3.add(centerPos, v[j].pos);
                    if(v[j].col) {
                        centerCol[0]+=v[j].col[0]; centerCol[1]+=v[j].col[1]; centerCol[2]+=v[j].col[2]; centerCol[3]+=v[j].col[3];
                    } else {
                        centerCol[0]+=1; centerCol[1]+=1; centerCol[2]+=1; centerCol[3]+=1;
                    }
                }
                centerPos = Vec3.scale(centerPos, 1 / v.length);
                centerCol = centerCol.map(c => c / v.length);
                const centerV = { pos: centerPos, col: centerCol, boneIndices: v[0].boneIndices, boneWeights: v[0].boneWeights };

                if (v.length === 4) {
                    const m01 = edgeMidpoints.get(getEdgeKey(v[0], v[1]));
                    const m12 = edgeMidpoints.get(getEdgeKey(v[1], v[2]));
                    const m23 = edgeMidpoints.get(getEdgeKey(v[2], v[3]));
                    const m30 = edgeMidpoints.get(getEdgeKey(v[3], v[0]));
                    
                    const addTargetFace = (verts) => {
                        const newIdx = nextFaces.length;
                        nextFaces.push({ vertices: verts, tags });
                        newTargetSet.add(newIdx);
                    };

                    addTargetFace([v[0], m01, centerV, m30]);
                    addTargetFace([m01, v[1], m12, centerV]);
                    addTargetFace([centerV, m12, v[2], m23]);
                    addTargetFace([m30, centerV, m23, v[3]]);
                } else if (v.length === 3) {
                    const m01 = edgeMidpoints.get(getEdgeKey(v[0], v[1]));
                    const m12 = edgeMidpoints.get(getEdgeKey(v[1], v[2]));
                    const m20 = edgeMidpoints.get(getEdgeKey(v[2], v[0]));
                    const addTargetFace = (verts) => {
                        const newIdx = nextFaces.length;
                        nextFaces.push({ vertices: verts, tags });
                        newTargetSet.add(newIdx);
                    };
                    addTargetFace([v[0], m01, m20]);
                    addTargetFace([m01, v[1], m12]);
                    addTargetFace([m20, m12, v[2]]);
                    addTargetFace([m01, m12, m20]); 
                } else {
                    nextFaces.push(face);
                }
            } else {
                // NON-target face. Check if any edges were split by the inner subdivision.
                let hasSplitEdge = false;
                const newVertices =[];
                for (let j = 0; j < v.length; j++) {
                    const v1 = v[j];
                    const v2 = v[(j + 1) % v.length];
                    newVertices.push(v1);
                    const key = getEdgeKey(v1, v2);
                    if (edgeMidpoints.has(key)) {
                        hasSplitEdge = true;
                        newVertices.push(edgeMidpoints.get(key));
                    }
                }

                if (hasSplitEdge) {
                    // THE MENDING: Automatically Triangulate adjacent un-subdivided face!
                    // We pull all points to the face's centroid, creating a flawless, crack-free fan.
                    let centerPos = [0, 0, 0];
                    let centerCol =[0, 0, 0, 0];
                    for (let j = 0; j < v.length; j++) {
                        centerPos = Vec3.add(centerPos, v[j].pos);
                        if(v[j].col) {
                            centerCol[0]+=v[j].col[0]; centerCol[1]+=v[j].col[1]; centerCol[2]+=v[j].col[2]; centerCol[3]+=v[j].col[3];
                        } else {
                            centerCol[0]+=1; centerCol[1]+=1; centerCol[2]+=1; centerCol[3]+=1;
                        }
                    }
                    centerPos = Vec3.scale(centerPos, 1 / v.length);
                    centerCol = centerCol.map(c => c / v.length);
                    const centerV = { pos: centerPos, col: centerCol, boneIndices: v[0].boneIndices, boneWeights: v[0].boneWeights };

                    for (let j = 0; j < newVertices.length; j++) {
                        const nv1 = newVertices[j];
                        const nv2 = newVertices[(j + 1) % newVertices.length];
                        nextFaces.push({ vertices:[nv1, nv2, centerV], tags });
                    }
                } else {
                    nextFaces.push(face);
                }
            }
        }
        currentFaces = nextFaces;
        targetSet = newTargetSet;
    }

    // PASS 3: SPHERIZE THE TARGET VERTICES
    if (params.radius && params.center) {
        const center = params.center;
        const radius = params.radius;
        
        const targetVertices = new Set();
        targetSet.forEach(idx => {
            currentFaces[idx].vertices.forEach(v => targetVertices.add(v));
        });

        // The fade bounds prevent the neck from turning into a bubble
        const blendMinY = params.blendMinY !== undefined ? params.blendMinY : center[1] - radius;
        const blendMaxY = params.blendMaxY !== undefined ? params.blendMaxY : center[1];

        targetVertices.forEach(v => {
            const dir = Vec3.sub(v.pos, center);
            const dist = Math.sqrt(dir[0]*dir[0] + dir[1]*dir[1] + dir[2]*dir[2]);
            const norm = dist > 0.001 ? Vec3.scale(dir, 1 / dist) : [0, 1, 0];
            
            // Inflate to perfect sphere radius
            let targetPos = Vec3.add(center, Vec3.scale(norm, radius));

            // Optional structural modifiers (e.g. elongating the head)
            if (params.elongateY) targetPos[1] += (norm[1] > 0 ? norm[1] * params.elongateY : 0);
            if (params.elongateZ) targetPos[2] += (norm[2] > 0 ? norm[2] * params.elongateZ : 0);

            // Smoothly blend the spherization so the neck stays connected gracefully
            let blend = 1.0;
            if (v.pos[1] < blendMaxY) {
                blend = (v.pos[1] - blendMinY) / (blendMaxY - blendMinY);
                blend = Math.max(0, Math.min(1, blend));
                blend = blend * blend * (3 - 2 * blend); // smoothstep
            }

            v.pos = Vec3.lerp(v.pos, targetPos, blend);
        });
    }

    mesh.faces = currentFaces;
    return mesh;
}
