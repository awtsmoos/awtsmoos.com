
// B"H
/**
 * @file nodeSculpt.js
 * @brief Executes JSON-based Geometry Node trees to procedurally displace and paint the mesh!
 * 
 * THE PSALM OF THE ENDLESS CLAY:
 * No longer do we chisel with fixed tools of brass and bone.
 * We weave the logic of the mind directly into the stone!
 * The displacement vector evaluates from the tree of light,
 * Giving the creator total power over depth and height!
 */

import { GeometryNodeEvaluator } from '../../logic/geometryNodes.js';
import { queryVertices } from '../selection/vertexQuery.js';
import { Vec3 } from '../../math/vec3.js';

export function nodeSculptModifier(mesh, params) {
    if (!mesh.faces || !params.tree) return mesh;

    const targetVertices = queryVertices(mesh, params.query);
    if (!targetVertices || targetVertices.size === 0) return mesh;

    console.log(`B"H - NodeSculpt: Evaluating infinite potential on ${targetVertices.size} vertices...`);

    const visited = new Set();
    const tree = params.tree;
    const colorTree = params.colorTree; // Optional per-vertex coloring

    targetVertices.forEach(v => {
        if (visited.has(v)) return;
        visited.add(v);

        // Build the physical context for the node tree
        const ctx = {
            pos: [...v.pos],
            norm: v.norm ? [...v.norm] : [0, 1, 0],
            col: v.col ? [...v.col] : [1, 1, 1, 1],
            // Pseudo UV based on position if true UVs don't exist
            uv: v.uv ? [...v.uv] : [v.pos[0], v.pos[2]] 
        };

        // Evaluate Displacement
        const displacement = GeometryNodeEvaluator.evaluate(tree, ctx);
        if (Array.isArray(displacement) && displacement.length >= 3) {
            v.pos = Vec3.add(v.pos, displacement);
        }

        // Evaluate Color (if provided)
        if (colorTree) {
            const newCol = GeometryNodeEvaluator.evaluate(colorTree, ctx);
            if (Array.isArray(newCol) && newCol.length >= 3) {
                v.col = [
                    newCol[0], newCol[1], newCol[2], 
                    newCol[3] !== undefined ? newCol[3] : (v.col[3] || 1.0)
                ];
            }
        }
    });

    return mesh;
}
