
// B"H
/**
 * @file extrudeFaces.js
 * @chapter THE HYMN OF THE GENERATIONAL LIMB
 * 
 * As the breath extends from the lung to the mouth,
 * The geometry extends from the North to the South!
 * The Extrusion is pure, returning new caps,
 * Weaving the limbs without falling in traps!
 */

import { Vec3 } from '../../math/vec3.js';
import { queryFaces } from '../selection/faceQuery.js';
import { VertexWelder } from '../utils/vertexWelder.js';
import { MeshTopology } from '../selection/topology.js';
import { computeSmoothNormalsModifier } from './computeNormals.js';
import { route } from '../../utils/router.js';

export function extrudeFaces(mesh, options) {
    const targetIndices = queryFaces(mesh, options.query || options.faces);
    
    return route(targetIndices && targetIndices.length > 0, {
        'false': () => {
            console.warn("B\"H - ExtrudeFaces: No faces matched the query. The limb remains in the void.", options.query);
            return mesh;
        },
        'true': () => {
            const steps = Math.max(1, options.steps || 1);
            const stepDistance = (options.distance || 1.0) / steps;
            const totalScale = options.scale !== undefined ? options.scale : 1.0;
            const stepScale = Array.isArray(totalScale) 
                ? [Math.pow(totalScale[0], 1/steps), Math.pow(totalScale[1], 1/steps), Math.pow(totalScale[2], 1/steps)]
                : Math.pow(totalScale, 1/steps);

            // Calculate average normal
            let avgNormal = [0, 0, 0];
            targetIndices.forEach(idx => {
                const v = mesh.faces[idx].vertices;
                const n = Vec3.normalize(Vec3.cross(Vec3.sub(v[1].pos, v[0].pos), Vec3.sub(v[v.length - 1].pos, v[0].pos)));
                avgNormal = Vec3.add(avgNormal, n);
            });
            const moveVec = Vec3.scale(Vec3.normalize(avgNormal), stepDistance);

            // Clear old tags
            route(options.clearTags, {
                'true': () => targetIndices.forEach(idx => { mesh.faces[idx].tags = []; }),
                'false': () => null
            });

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
                    let newPos = Vec3.add(group[0].pos, moveVec);
                    const toCenter = Vec3.sub(newPos, centroid);
                    
                    route(Array.isArray(stepScale), {
                        'true': () => { newPos = Vec3.add(centroid, [toCenter[0]*stepScale[0], toCenter[1]*stepScale[1], toCenter[2]*stepScale[2]]); },
                        'false': () => { newPos = Vec3.add(centroid, Vec3.scale(toCenter, stepScale)); }
                    });
                    
                    group.forEach(oldV => {
                        vertexMap.set(oldV, { pos: [...newPos], col: [...oldV.col] });
                    });
                });

                const newWalls = [];
                boundaryEdges.forEach(edge => {
                    const { v1, v2 } = edge;
                    const nextV1 = vertexMap.get(v1);
                    const nextV2 = vertexMap.get(v2);
                    
                    route(nextV1 && nextV2, {
                        'true': () => newWalls.push({
                            vertices: [{...v1}, {...v2}, {...nextV2}, {...nextV1}],
                            tags: options.assignSideTag ? [options.assignSideTag] : []
                        }),
                        'false': () => null
                    });
                });

                capFaceObjects.forEach(face => {
                    face.vertices = face.vertices.map(v => vertexMap.get(v) || v);
                    route(options.assignCapTag, {
                        'true': () => {
                            face.tags = face.tags || [];
                            route(!face.tags.includes(options.assignCapTag), {
                                'true': () => face.tags.push(options.assignCapTag),
                                'false': () => null
                            });
                        },
                        'false': () => null
                    });
                });

                mesh.faces.push(...newWalls);
            }

            return computeSmoothNormalsModifier(mesh);
        }
    });
}
