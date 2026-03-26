
// B"H
/**
 * @file handlers.js
 * @brief The sacred algorithms for advanced face selection.
 *        Every facet of Blender's selection system shall be emulated and surpassed!
 */
import { Vec3 } from '../../../math/vec3.js';
import { SpatialMath } from '../../../physics/spatial/math.js';
import { getFaceNormal, getFaceCentroid } from './utils.js';
import { VirtualViewport } from '../virtualViewport.js';

function hash(n) { return n - Math.floor(n); }
function simple3DNoise(x, y, z) {
    const p = Math.floor(x) * 12.9898 + Math.floor(y) * 78.233 + Math.floor(z) * 37.719;
    return hash(Math.sin(p) * 43758.5453);
}

export const FACE_QUERY_HANDLERS = {
    // --- FOUNDATIONAL SPATIAL QUERIES ---
    
    'tag': (mesh, params, allIndices, ctx) => {
        const result = new Set();
        allIndices.forEach(idx => {
            if (mesh.faces[idx].tags && mesh.faces[idx].tags.includes(params)) {
                result.add(idx);
            }
        });
        return result;
    },

    'box': (mesh, params, allIndices, ctx) => {
        const result = new Set();
        allIndices.forEach(idx => {
            const cent = getFaceCentroid(mesh.faces[idx]);
            if (cent[0] >= params.min[0] && cent[0] <= params.max[0] &&
                cent[1] >= params.min[1] && cent[1] <= params.max[1] &&
                cent[2] >= params.min[2] && cent[2] <= params.max[2]) {
                result.add(idx);
            }
        });
        return result;
    },

    'semanticSphere': (mesh, params, allIndices, ctx) => {
        const result = new Set();
        const pts = ctx.objectData?.exportedPoints || {};
        const center = pts[params.pointName];
        if (!center) return result;
        const r2 = params.radius * params.radius;
        allIndices.forEach(idx => {
            if (Vec3.distSq(getFaceCentroid(mesh.faces[idx]), center) <= r2) result.add(idx);
        });
        return result;
    },

    'semanticCylinder': (mesh, params, allIndices, ctx) => {
        const result = new Set();
        const pts = ctx.objectData?.exportedPoints || {};
        const p1 = pts[params.startPoint];
        const p2 = pts[params.endPoint];
        if (!p1 || !p2) return result;
        const r2 = params.radius * params.radius;
        allIndices.forEach(idx => {
            if (SpatialMath.distSqPointToSegment(getFaceCentroid(mesh.faces[idx]), p1, p2) <= r2) result.add(idx);
        });
        return result;
    },

    'normalDot': (mesh, params, allIndices, ctx) => {
        const result = new Set();
        const dir = Array.isArray(params) ? params : params.dir;
        const threshold = params.threshold !== undefined ? params.threshold : 0.9;
        allIndices.forEach(idx => {
            const normal = getFaceNormal(mesh.faces[idx]);
            if (Vec3.dot(normal, dir) >= threshold) result.add(idx);
        });
        return result;
    },

    'closest': (mesh, params, allIndices, ctx) => {
        const { to, count = 1, fromQuery } = params;
        const baseSet = fromQuery ? ctx.executeQuery(mesh, fromQuery, allIndices, ctx) : allIndices;
        const arr = Array.from(baseSet).map(idx => ({ idx, dist: Vec3.distSq(getFaceCentroid(mesh.faces[idx]), to) }));
        arr.sort((a, b) => a.dist - b.dist);
        return new Set(arr.slice(0, count).map(x => x.idx));
    },

    'checker': (mesh, params, allIndices, ctx) => {
        const { fromQuery, nth = 2, offset = 0 } = params;
        const baseSet = fromQuery ? ctx.executeQuery(mesh, fromQuery, allIndices, ctx) : allIndices;
        const result = new Set();
        let i = 0;
        baseSet.forEach(idx => {
            if ((i + offset) % nth === 0) result.add(idx);
            i++;
        });
        return result;
    },

    // --- TOPOLOGICAL QUERIES ---

    'connected': (mesh, params, allIndices, ctx) => {
        const result = new Set();
        const { startFace, angleLimit = Math.PI / 4, stopAtTag } = params;
        if (startFace === undefined || startFace < 0 || startFace >= mesh.faces.length) return result;

        const adjacency = ctx.getAdjacency(mesh);
        let frontier = new Set([startFace]);
        result.add(startFace);

        while(frontier.size > 0) {
            const nextFrontier = new Set();
            frontier.forEach(currIdx => {
                const currFace = mesh.faces[currIdx];
                const currNorm = getFaceNormal(currFace);
                
                adjacency.getAdjacent(currIdx).forEach(adjIdx => {
                    if (result.has(adjIdx)) return;
                    const adjFace = mesh.faces[adjIdx];
                    if (stopAtTag && adjFace.tags && adjFace.tags.includes(stopAtTag)) return;
                    const adjNorm = getFaceNormal(adjFace);
                    const dot = Vec3.dot(currNorm, adjNorm);
                    if (Math.acos(Math.max(-1, Math.min(1, dot))) <= angleLimit) {
                        result.add(adjIdx);
                        nextFrontier.add(adjIdx);
                    }
                });
            });
            frontier = nextFrontier;
        }
        return result;
    },

    'coplanar': (mesh, params, allIndices, ctx) => {
        const result = new Set();
        const { targetFace, distanceTolerance = 0.05, angleTolerance = 0.05 } = params;
        if (targetFace === undefined || !mesh.faces[targetFace]) return result;
        const tf = mesh.faces[targetFace];
        const tNorm = getFaceNormal(tf);
        const tCent = getFaceCentroid(tf);
        const d = Vec3.dot(tNorm, tCent);

        allIndices.forEach(idx => {
            const face = mesh.faces[idx];
            const norm = getFaceNormal(face);
            const cent = getFaceCentroid(face);
            if (Math.acos(Math.max(-1, Math.min(1, Vec3.dot(tNorm, norm)))) <= angleTolerance) {
                if (Math.abs(Vec3.dot(tNorm, cent) - d) <= distanceTolerance) result.add(idx);
            }
        });
        return result;
    },

    'grow': (mesh, params, allIndices, ctx) => {
        const { fromQuery, steps = 1 } = params;
        const initialSelection = new Set(ctx.executeQuery(mesh, fromQuery, allIndices, ctx));
        const result = new Set(initialSelection);
        let frontier = new Set(initialSelection);
        const adjacency = ctx.getAdjacency(mesh);

        for (let i = 0; i < steps; i++) {
            const nextFrontier = new Set();
            frontier.forEach(currIdx => {
                adjacency.getAdjacent(currIdx).forEach(adjIdx => {
                    if (!result.has(adjIdx)) {
                        result.add(adjIdx);
                        nextFrontier.add(adjIdx);
                    }
                });
            });
            frontier = nextFrontier;
        }
        return result;
    },

    'shrink': (mesh, params, allIndices, ctx) => {
        const { fromQuery, steps = 1 } = params;
        let currentSet = new Set(ctx.executeQuery(mesh, fromQuery, allIndices, ctx));
        
        for (let i = 0; i < steps; i++) {
            const boundary = ctx.executeQuery(mesh, { boundary: { fromQuery: currentSet } }, allIndices, ctx);
            const nextSet = new Set();
            currentSet.forEach(idx => {
                if (!boundary.has(idx)) nextSet.add(idx);
            });
            currentSet = nextSet;
        }
        return currentSet;
    },

    'boundary': (mesh, params, allIndices, ctx) => {
        const { fromQuery } = params;
        const initialSelection = (fromQuery instanceof Set) ? fromQuery : new Set(ctx.executeQuery(mesh, fromQuery, allIndices, ctx));
        const boundary = new Set();
        const adjacency = ctx.getAdjacency(mesh);

        initialSelection.forEach(idx => {
            let isBoundary = false;
            for (const neighbor of adjacency.getAdjacent(idx)) {
                if (!initialSelection.has(neighbor)) {
                    isBoundary = true;
                    break;
                }
            }
            if (isBoundary) boundary.add(idx);
        });
        return boundary;
    },

    'geodesicWalk': (mesh, params, allIndices, ctx) => {
        const { fromQuery, maxDistance } = params;
        const startFaces = ctx.executeQuery(mesh, fromQuery, allIndices, ctx);
        const adjacency = ctx.getAdjacency(mesh);
        const distances = new Map();
        const resultSet = new Set();
        let queue = [];

        startFaces.forEach(idx => {
            distances.set(idx, 0);
            resultSet.add(idx);
            queue.push({ idx, dist: 0 });
        });

        while (queue.length > 0) {
            queue.sort((a, b) => a.dist - b.dist);
            const current = queue.shift();
            if (current.dist > maxDistance) continue;

            adjacency.getAdjacent(current.idx).forEach(nIdx => {
                const stepDist = Vec3.dist(getFaceCentroid(mesh.faces[current.idx]), getFaceCentroid(mesh.faces[nIdx]));
                const newDist = current.dist + stepDist;

                if (newDist <= maxDistance) {
                    if (!distances.has(nIdx) || newDist < distances.get(nIdx)) {
                        distances.set(nIdx, newDist);
                        resultSet.add(nIdx);
                        queue.push({ idx: nIdx, dist: newDist });
                    }
                }
            });
        }
        return resultSet;
    },

    'curvature': (mesh, params, allIndices, ctx) => {
        const { type = 'convex', threshold = 0.5 } = params;
        const resultSet = new Set();
        const adjacency = ctx.getAdjacency(mesh);

        allIndices.forEach(idx => {
            const n = getFaceNormal(mesh.faces[idx]);
            const neighbors = adjacency.getAdjacent(idx);
            if (neighbors.size === 0) return;

            let avgNormal = [0,0,0];
            neighbors.forEach(nIdx => {
                avgNormal = Vec3.add(avgNormal, getFaceNormal(mesh.faces[nIdx]));
            });
            avgNormal = Vec3.normalize(avgNormal);

            const dot = Vec3.dot(n, avgNormal);
            // Simplified logic: If normals diverge heavily, it's sharp.
            if (dot < threshold) resultSet.add(idx);
        });
        return resultSet;
    },

    // --- ADVANCED MATH & NOISE ---

    'mathExpression': (mesh, params, allIndices, ctx) => {
        const resultSet = new Set();
        const { expression } = params;
        if (!expression) return resultSet;

        try {
            const evaluator = new Function('x', 'y', 'z', `return ${expression};`);
            allIndices.forEach(idx => {
                const c = getFaceCentroid(mesh.faces[idx]);
                if (evaluator(c[0], c[1], c[2])) resultSet.add(idx);
            });
        } catch (e) {
            console.error(`B"H - MathExpression Query Failed:`, e);
        }
        return resultSet;
    },

    'noiseMask': (mesh, params, allIndices, ctx) => {
        const resultSet = new Set();
        const { scale = 1.0, threshold = 0.5 } = params;
        allIndices.forEach(idx => {
            const c = getFaceCentroid(mesh.faces[idx]);
            const n = simple3DNoise(c[0] * scale, c[1] * scale, c[2] * scale);
            if (n > threshold) resultSet.add(idx);
        });
        return resultSet;
    },

    // --- VIEWPORT & LOGIC ---

    'screenBox': (mesh, params, allIndices, ctx) => {
        const result = new Set();
        const { camera, rect, centerOnly = true } = params;
        const vpMat = VirtualViewport.getVPMatrix(camera);
        const minX = rect.minX ?? -1.0; const maxX = rect.maxX ?? 1.0;
        const minY = rect.minY ?? -1.0; const maxY = rect.maxY ?? 1.0;

        allIndices.forEach(idx => {
            const face = mesh.faces[idx];
            if (centerOnly) {
                const cent = getFaceCentroid(face);
                const ndc = VirtualViewport.projectPoint(cent, vpMat);
                if (ndc && ndc[0] >= minX && ndc[0] <= maxX && ndc[1] >= minY && ndc[1] <= maxY) result.add(idx);
            } else {
                let allInside = true;
                for (const v of face.vertices) {
                    const ndc = VirtualViewport.projectPoint(v.pos, vpMat);
                    if (!ndc || ndc[0] < minX || ndc[0] > maxX || ndc[1] < minY || ndc[1] > maxY) {
                        allInside = false; break;
                    }
                }
                if (allInside) result.add(idx);
            }
        });
        return result;
    },

    'inverse': (mesh, params, allIndices, ctx) => {
        const toInvert = ctx.executeQuery(mesh, params, allIndices, ctx);
        return new Set([...allIndices].filter(i => !toInvert.has(i)));
    },

    'and': (mesh, params, allIndices, ctx) => {
        let andResult = new Set(allIndices);
        params.forEach(subQ => {
            const subRes = ctx.executeQuery(mesh, subQ, allIndices, ctx);
            andResult = new Set([...andResult].filter(i => subRes.has(i)));
        });
        return andResult;
    },
    
    'or': (mesh, params, allIndices, ctx) => {
        const orResult = new Set();
        params.forEach(subQ => {
            const subRes = ctx.executeQuery(mesh, subQ, allIndices, ctx);
            subRes.forEach(i => orResult.add(i));
        });
        return orResult;
    }
};
