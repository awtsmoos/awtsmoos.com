
// B"H
/**
 * @file topologyQueries.js
 * @chapter THE WEBBING OF THE SPHERES
 * 
 * THE CHANT OF THE RECURSIVE FLOOD:
 * Why build a wall of "ifs" when the water can flow?
 * We recursively expand, letting the frontier grow.
 * Adjacent faces found by mapping the set,
 * Filtering the visited, catching them in the net.
 * All matter everywhere is sustained by this linkage!
 * 
 * @module TopologyQueries
 */

import { Vec3 } from '../../../math/vec3.js';
import { getFaceNormal } from './utils.js';

const _expandFrontier = (frontier, resultSet, mesh, adj, limit, stopTag) => {
    const newFrontier = new Set(
        Array.from(frontier).flatMap(curr => {
            const currNorm = getFaceNormal(mesh.faces[curr]);
            return Array.from(adj.getAdjacent(curr)).filter(adjIdx => {
                const face = mesh.faces[adjIdx];
                const hasTag = (face.tags || []).includes(stopTag);
                const dot = Vec3.dot(currNorm, getFaceNormal(face));
                const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
                
                const isValid = !resultSet.has(adjIdx) && !hasTag && angle <= limit;
                isValid && resultSet.add(adjIdx);
                return isValid;
            });
        })
    );
    return newFrontier.size > 0 ? _expandFrontier(newFrontier, resultSet, mesh, adj, limit, stopTag) : resultSet;
};

const _growSteps = (currentSet, steps, adj) => {
    return steps <= 0 ? currentSet : _growSteps(new Set(
        Array.from(currentSet).flatMap(idx => Array.from(adj.getAdjacent(idx)))
    ).union(currentSet), steps - 1, adj);
};

// Polyfill for Set.prototype.union (for environments where it's missing)
Set.prototype.union = Set.prototype.union || function(other) {
    const res = new Set(this);
    for (const elem of other) res.add(elem);
    return res;
};

export const TOPOLOGY_QUERIES = Object.freeze({
    'connected': (mesh, params, allIndices, ctx) => {
        const startFace = params.startFace;
        const VALIDATE = {
            true: () => _expandFrontier(new Set([startFace]), new Set([startFace]), mesh, ctx.getAdjacency(mesh), params.angleLimit || Math.PI/4, params.stopAtTag),
            false: () => new Set()
        };
        return VALIDATE[startFace >= 0 && startFace < mesh.faces.length]();
    },

    'grow': (mesh, params, allIndices, ctx) => {
        const initial = ctx.executeQuery(mesh, params.fromQuery, allIndices, ctx);
        return _growSteps(initial, params.steps || 1, ctx.getAdjacency(mesh));
    },

    'boundary': (mesh, params, allIndices, ctx) => {
        const initial = ctx.executeQuery(mesh, params.fromQuery, allIndices, ctx);
        const adj = ctx.getAdjacency(mesh);
        return new Set(
            Array.from(initial).filter(idx => 
                Array.from(adj.getAdjacent(idx)).some(neighbor => !initial.has(neighbor))
            )
        );
    }
});
