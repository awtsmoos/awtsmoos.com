
// B"H
/**
 * @file spatial.js
 * @brief Handlers for pure 3D volume intersections (Boxes, Spheres, Cylinders).
 * 
 * "His word of 'let there be' stands inside the heavens forever."
 * The coordinates define the space, but the Word sustains the geometry within it.
 * This scroll now comprehends the Semantic Anchors, allowing the bounds to shift 
 * and breathe with the living vessel!
 */
import { Vec3 } from '../../../math/vec3.js';
import { SpatialMath } from '../../../physics/spatial/math.js';

export const SPATIAL_QUERIES = {
    'box': (mesh, params, allVertices, context) => {
        const resultSet = new Set();
        allVertices.forEach(v => {
            if (v.pos[0] >= params.min[0] && v.pos[0] <= params.max[0] &&
                v.pos[1] >= params.min[1] && v.pos[1] <= params.max[1] &&
                v.pos[2] >= params.min[2] && v.pos[2] <= params.max[2]) {
                resultSet.add(v);
            }
        });
        return resultSet;
    },

    'sphere': (mesh, params, allVertices, context) => {
        const resultSet = new Set();
        const r2 = params.radius * params.radius;
        allVertices.forEach(v => {
            if (Vec3.distSq(v.pos, params.center) <= r2) resultSet.add(v);
        });
        return resultSet;
    },

    'projectedBox': (mesh, params, allVertices, context) => {
        const resultSet = new Set();
        const { axis, min, max } = params;
        const indices = axis === 'x' ? [1, 2] : axis === 'y' ? [0, 2] : [0, 1];
        allVertices.forEach(v => {
            if (v.pos[indices[0]] >= min[0] && v.pos[indices[0]] <= max[0] &&
                v.pos[indices[1]] >= min[1] && v.pos[indices[1]] <= max[1]) {
                resultSet.add(v);
            }
        });
        return resultSet;
    },

    // B"H - THE SEMANTIC SPHERE
    // Seeks a named point in the Book of Memory (exportedPoints)
    'semanticSphere': (mesh, params, allVertices, context) => {
        const resultSet = new Set();
        const pts = context.objectData?.exportedPoints || {};
        const center = pts[params.pointName];
        
        if (!center) {
            console.warn(`B"H - SemanticSphere: The point '${params.pointName}' does not exist in memory!`);
            return resultSet;
        }

        const r2 = params.radius * params.radius;
        allVertices.forEach(v => {
            if (Vec3.distSq(v.pos, center) <= r2) resultSet.add(v);
        });
        return resultSet;
    },

    // B"H - THE SEMANTIC CYLINDER
    // Creates a holy pillar between two named points, selecting all matter within it.
    'semanticCylinder': (mesh, params, allVertices, context) => {
        const resultSet = new Set();
        const pts = context.objectData?.exportedPoints || {};
        const p1 = pts[params.startPoint];
        const p2 = pts[params.endPoint];

        if (!p1 || !p2) {
            console.warn(`B"H - SemanticCylinder: Missing points '${params.startPoint}' or '${params.endPoint}'.`);
            return resultSet;
        }

        const r2 = params.radius * params.radius;
        allVertices.forEach(v => {
            const d2 = SpatialMath.distSqPointToSegment(v.pos, p1, p2);
            if (d2 <= r2) resultSet.add(v);
        });
        return resultSet;
    }
};
