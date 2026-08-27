
// B"H
/**
 * @file topological.js
 * @brief Handlers that walk the mesh edges or read internal semantic data.
 * 
 * As Aleph, Beis, and Nun link to form "Even", the vertices link to form edges.
 * These queries traverse those sacred links, feeling the curvature and distance
 * of the surface itself, rather than cutting blindly through the void.
 */
import { VertexWelder } from '../../utils/vertexWelder.js';
import { Vec3 } from '../../../math/vec3.js';

export const TOPOLOGICAL_QUERIES = {
    'ring': (mesh, params, allVertices, context) => {
        const resultSet = new Set();
        allVertices.forEach(v => {
            if (v.ringIdx === params) resultSet.add(v);
        });
        return resultSet;
    },

    'segment': (mesh, params, allVertices, context) => {
        const resultSet = new Set();
        allVertices.forEach(v => {
            if (v.segIdx === params) resultSet.add(v);
        });
        return resultSet;
    },
    
    'tag': (mesh, params, allVertices, context) => {
        const resultSet = new Set();
        const targetTag = params;
        const vertexToFacesMap = new Map();
        
        mesh.faces.forEach(face => {
            face.vertices.forEach(v => {
                const hash = VertexWelder.getPositionHash(v.pos);
                if (!vertexToFacesMap.has(hash)) vertexToFacesMap.set(hash, []);
                vertexToFacesMap.get(hash).push(face);
            });
        });

        allVertices.forEach(v => {
            const hash = VertexWelder.getPositionHash(v.pos);
            const faces = vertexToFacesMap.get(hash);
            if (faces) {
                for (const face of faces) {
                    if (face.tags && face.tags.includes(targetTag)) {
                        resultSet.add(v);
                        break; 
                    }
                }
            }
        });
        return resultSet;
    },

    'walk': (mesh, params, allVertices, context) => {
        return performWalk(mesh, params, allVertices, context);
    },
    
    'grow': (mesh, params, allVertices, context) => {
        return performWalk(mesh, params, allVertices, context);
    },

    // B"H - THE GEODESIC WALK
    // Measures true distance across the skin of the creation using Dijkstra's algorithm.
    'geodesicWalk': (mesh, params, allVertices, context) => {
        const { fromQuery, maxDistance } = params;
        const startVerts = context.handleQuery(mesh, fromQuery, allVertices);
        
        const adjacency = context.getAdjacency(mesh);
        const distances = new Map();
        const resultSet = new Set();
        
        // Priority queue approximation (simple array sorted per step)
        let queue = [];

        startVerts.forEach(v => {
            const h = VertexWelder.getPositionHash(v.pos);
            distances.set(h, 0);
            resultSet.add(v);
            queue.push({ v, h, dist: 0 });
        });

        while (queue.length > 0) {
            // Sort to process closest first (Dijkstra)
            queue.sort((a, b) => a.dist - b.dist);
            const current = queue.shift();

            if (current.dist > maxDistance) continue;

            const neighbors = adjacency.getNeighborHashes(current.v);
            neighbors.forEach(nHash => {
                const nVert = adjacency.getVertexByHash(nHash);
                if (!nVert) return;

                const stepDist = Vec3.dist(current.v.pos, nVert.pos);
                const newDist = current.dist + stepDist;

                if (newDist <= maxDistance) {
                    if (!distances.has(nHash) || newDist < distances.get(nHash)) {
                        distances.set(nHash, newDist);
                        resultSet.add(nVert);
                        queue.push({ v: nVert, h: nHash, dist: newDist });
                    }
                }
            });
        }

        return resultSet;
    },

    // B"H - THE CURVATURE DISCERNMENT
    // Evaluates if a vertex sits on a peak (convex), a valley (concave), or a plain (flat).
    'curvature': (mesh, params, allVertices, context) => {
        const { type = 'convex', threshold = 0.5 } = params;
        const resultSet = new Set();
        const adjacency = context.getAdjacency(mesh);

        allVertices.forEach(v => {
            // Reconstruct pseudo-normal for the vertex if not perfectly stored
            if (!v.norm) return;

            const neighbors = adjacency.getNeighborHashes(v);
            if (neighbors.size === 0) return;

            let avgNeighborPos = [0, 0, 0];
            let count = 0;

            neighbors.forEach(nHash => {
                const nVert = adjacency.getVertexByHash(nHash);
                if (nVert) {
                    avgNeighborPos = Vec3.add(avgNeighborPos, nVert.pos);
                    count++;
                }
            });

            avgNeighborPos = Vec3.scale(avgNeighborPos, 1.0 / count);
            
            // Vector from vertex to the average of its neighbors
            const toNeighbors = Vec3.sub(avgNeighborPos, v.pos);
            const dist = Vec3.dot(toNeighbors, toNeighbors);
            
            if (dist < 1e-6) return; // Completely flat or isolated

            const dirToNeighbors = Vec3.normalize(toNeighbors);
            const dot = Vec3.dot(v.norm, dirToNeighbors);

            // If dot < 0, neighbors are "behind" the normal -> CONVEX (Peak)
            // If dot > 0, neighbors are "in front" of the normal -> CONCAVE (Valley)
            
            if (type === 'convex' && dot < -threshold) resultSet.add(v);
            else if (type === 'concave' && dot > threshold) resultSet.add(v);
            else if (type === 'flat' && Math.abs(dot) <= threshold) resultSet.add(v);
        });

        return resultSet;
    }
};

function performWalk(mesh, params, allVertices, context) {
    const adjacency = context.getAdjacency(mesh);
    const startQueryKey = params.from ? 'from' : 'startQuery';
    const startQueryObj = params[startQueryKey];
    
    const wrappedStart = typeof startQueryObj === 'string' ? { tag: startQueryObj } : startQueryObj;
    
    const startVerts = context.handleQuery(mesh, wrappedStart, allVertices);
    const result = new Set(startVerts);
    let frontier = new Set(startVerts);

    for (let i = 0; i < params.steps; i++) {
        const nextFrontier = new Set();
        frontier.forEach(v => {
            const neighbors = adjacency.getNeighborHashes(v);
            neighbors.forEach(nHash => {
                const nVert = adjacency.getVertexByHash(nHash);
                if (nVert && !result.has(nVert)) {
                    result.add(nVert);
                    nextFrontier.add(nVert);
                }
            });
        });
        frontier = nextFrontier;
    }
    return result;
}
