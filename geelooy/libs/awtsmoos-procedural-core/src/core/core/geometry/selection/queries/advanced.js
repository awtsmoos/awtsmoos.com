
// B"H
/**
 * @file advanced.js
 * @brief The Master Tools of the Digital Sculptor.
 * 
 * Includes the Node Select engine, allowing infinite permutations of logic!
 */

import { VirtualViewport } from '../virtualViewport.js';
import { Vec3 } from '../../../math/vec3.js';
import { SpatialMath } from '../../../physics/spatial/math.js';
import { GeometryNodeEvaluator } from '../../../logic/geometryNodes.js';

export const ADVANCED_QUERIES = {
    'screenBox': (mesh, params, allVertices, context) => {
        const resultSet = new Set();
        const { camera, rect, selectBackfaces } = params;
        const vpMat = VirtualViewport.getVPMatrix(camera);

        const minX = rect.minX ?? -1.0; const maxX = rect.maxX ?? 1.0;
        const minY = rect.minY ?? -1.0; const maxY = rect.maxY ?? 1.0;

        const camForward = camera.target ? Vec3.normalize(Vec3.sub(camera.target, camera.pos || [0,0,10])) : [0,0,-1];

        allVertices.forEach(v => {
            const ndc = VirtualViewport.projectPoint(v.pos, vpMat);
            if (!ndc) return; 
            
            if (ndc[0] >= minX && ndc[0] <= maxX && ndc[1] >= minY && ndc[1] <= maxY) {
                if (!selectBackfaces && v.norm) {
                    if (Vec3.dot(v.norm, camForward) > 0.1) return; 
                }
                resultSet.add(v);
            }
        });
        return resultSet;
    },

    'screenRayBrush': (mesh, params, allVertices, context) => {
        const resultSet = new Set();
        const { camera, screenX, screenY, radius = 0.5 } = params;
        
        const ray = VirtualViewport.getRay(screenX, screenY, camera);
        if (!ray) return resultSet;

        const radSq = radius * radius;

        allVertices.forEach(v => {
            const p2 = Vec3.add(ray.origin, Vec3.scale(ray.direction, 1000.0));
            const distSq = SpatialMath.distSqPointToSegment(v.pos, ray.origin, p2);
            
            if (distSq <= radSq) {
                resultSet.add(v);
            }
        });
        return resultSet;
    },

    'cylinder': (mesh, params, allVertices, context) => {
        const resultSet = new Set();
        const { start, end, radius } = params;
        const radSq = radius * radius;

        allVertices.forEach(v => {
            const distSq = SpatialMath.distSqPointToSegment(v.pos, start, end);
            if (distSq <= radSq) resultSet.add(v);
        });
        return resultSet;
    },

    'symmetry': (mesh, params, allVertices, context) => {
        const resultSet = new Set();
        const { axis = 'x', sourceQuery, tolerance = 0.1 } = params;
        
        const sourceVerts = context.handleQuery(mesh, sourceQuery, allVertices);
        const axisIdx = axis === 'x' ? 0 : (axis === 'y' ? 1 : 2);
        
        const mirroredTargets = Array.from(sourceVerts).map(v => {
            const m = [...v.pos];
            m[axisIdx] = -m[axisIdx];
            return m;
        });

        const tolSq = tolerance * tolerance;
        allVertices.forEach(v => {
            for (const target of mirroredTargets) {
                if (Vec3.distSq(v.pos, target) <= tolSq) {
                    resultSet.add(v);
                    break;
                }
            }
        });
        return resultSet;
    },

    // B"H - THE UTTERANCE OF THE NODE TREE
    // Evaluates a pure JSON Logic Tree for every vertex.
    'nodeSelect': (mesh, params, allVertices, context) => {
        const resultSet = new Set();
        const { tree } = params;

        if (!tree) return resultSet;

        allVertices.forEach(v => {
            const ctx = {
                pos: [...v.pos],
                norm: v.norm ? [...v.norm] : [0,1,0],
                uv: v.uv ? [...v.uv] : [0,0]
            };
            
            // If the tree evaluates to true (or a positive number), select the vertex!
            const res = GeometryNodeEvaluator.evaluate(tree, ctx);
            if (res === true || (typeof res === 'number' && res > 0)) {
                resultSet.add(v);
            }
        });

        return resultSet;
    },

    // B"H - THE BONE ISOLATOR
    // Extracts vertices influenced strongly by a specific joint.
    'boneWeight': (mesh, params, allVertices, context) => {
        const resultSet = new Set();
        const { boneIndex, threshold = 0.5 } = params;

        allVertices.forEach(v => {
            if (v.boneIndices && v.boneWeights) {
                for (let i = 0; i < 4; i++) {
                    if (v.boneIndices[i] === boneIndex && v.boneWeights[i] >= threshold) {
                        resultSet.add(v);
                        break;
                    }
                }
            }
        });
        return resultSet;
    },

    // B"H - THE EDGE ANGLE DISCERNMENT (Sharpness)
    // Selects vertices that lie on a sharp corner/crease.
    'edgeAngle': (mesh, params, allVertices, context) => {
        const resultSet = new Set();
        const { thresholdDegrees = 45 } = params;
        const thresholdRad = (thresholdDegrees * Math.PI) / 180;
        const cosThreshold = Math.cos(thresholdRad);

        // We need faces to evaluate true edge sharpness
        const adjacency = context.getAdjacency(mesh); // Provides topological access
        
        allVertices.forEach(v => {
            // Simple approximation: If the vertex normal differs greatly from its neighbors, it's on an edge
            // A more exact implementation would iterate the faces sharing this vertex.
            const neighbors = adjacency.getNeighborHashes(v);
            if (neighbors.size === 0 || !v.norm) return;

            let isSharp = false;
            for (const nHash of neighbors) {
                const nVert = adjacency.getVertexByHash(nHash);
                if (nVert && nVert.norm) {
                    if (Vec3.dot(v.norm, nVert.norm) < cosThreshold) {
                        isSharp = true;
                        break;
                    }
                }
            }
            if (isSharp) resultSet.add(v);
        });

        return resultSet;
    }
};
