
// B"H
/**
 * @file heal.js
 * @brief The Healer of Topological Rifts (T-Junction Resolver).
 * 
 * THE PSALM OF THE SEAMLESS GARMENT:
 * The blade cuts deep, and the edges fray,
 * Leaving points adrift in the geometry's play.
 * When the spirit moves, and the bones command,
 * The disconnected points slip through the hand.
 * But the Healer walks the borders, seeking the lost,
 * Binding them into the edge, whatever the cost.
 * No T-junction shall survive the sweep of His sight,
 * And the garment remains whole, seamless and bright!
 */

import { Vec3 } from '../../math/vec3.js';
import { VertexWelder } from '../utils/vertexWelder.js';

export function healTopologyModifier(mesh, params = {}) {
    const tolerance = params.tolerance || 1e-3;
    if (!mesh.faces || mesh.faces.length === 0) return mesh;

    console.log(`B"H - Healer: Commencing topological mending of ${mesh.faces.length} faces...`);

    // 1. Gather all unique physical vertex positions in the realm
    const weldedMap = VertexWelder.getWeldedMap(mesh);
    const uniquePositions = Array.from(weldedMap.keys()).map(hash => {
        return Array.from(weldedMap.get(hash))[0].pos;
    });

    const newFaces =[];
    let healedCount = 0;

    // 2. Walk every face and examine its borders
    mesh.faces.forEach(face => {
        let newVerts =[];
        const v = face.vertices;
        const numVerts = v.length;

        for (let i = 0; i < numVerts; i++) {
            const v1 = v[i];
            const v2 = v[(i + 1) % numVerts];
            const p1 = v1.pos;
            const p2 = v2.pos;

            newVerts.push(v1);

            const pointsOnEdge =[];
            const len = Vec3.dist(p1, p2);

            // If the edge has substance, check for stray points
            if (len > tolerance) {
                // AABB Optimization for the edge
                const minX = Math.min(p1[0], p2[0]) - tolerance;
                const maxX = Math.max(p1[0], p2[0]) + tolerance;
                const minY = Math.min(p1[1], p2[1]) - tolerance;
                const maxY = Math.max(p1[1], p2[1]) + tolerance;
                const minZ = Math.min(p1[2], p2[2]) - tolerance;
                const maxZ = Math.max(p1[2], p2[2]) + tolerance;

                for (let j = 0; j < uniquePositions.length; j++) {
                    const p = uniquePositions[j];
                    
                    // Quick Reject: Outside AABB
                    if (p[0] < minX || p[0] > maxX || p[1] < minY || p[1] > maxY || p[2] < minZ || p[2] > maxZ) continue;
                    
                    // Quick Reject: Point is basically one of the endpoints
                    if (Vec3.distSq(p, p1) < tolerance*tolerance || Vec3.distSq(p, p2) < tolerance*tolerance) continue;

                    // Mathematical check: Does point P lie on line segment A-B?
                    // If dist(A,P) + dist(P,B) == dist(A,B), it lies on the segment!
                    const d1 = Vec3.dist(p1, p);
                    const d2 = Vec3.dist(p, p2);

                    if (Math.abs((d1 + d2) - len) < tolerance) {
                        pointsOnEdge.push({ pos: p, dist: d1 });
                        healedCount++;
                    }
                }
            }

            // Insert discovered points into the edge sequence, sorted by distance from start
            if (pointsOnEdge.length > 0) {
                pointsOnEdge.sort((a, b) => a.dist - b.dist);
                
                pointsOnEdge.forEach(pt => {
                    const t = pt.dist / len;
                    // Interpolate the colors so the seam is invisible
                    const newV = {
                        pos: [...pt.pos],
                        col: v1.col && v2.col ? [
                            v1.col[0] + (v2.col[0]-v1.col[0])*t,
                            v1.col[1] + (v2.col[1]-v1.col[1])*t,
                            v1.col[2] + (v2.col[2]-v1.col[2])*t,
                            v1.col[3] + (v2.col[3]-v1.col[3])*t,
                        ] :[1,1,1,1]
                    };
                    newVerts.push(newV);
                });
            }
        }

        // 3. Force Fan Triangulation of the newly enriched face
        // This ensures the face remains planar and correctly bound for the skinning engine
        if (newVerts.length >= 3) {
            for (let j = 2; j < newVerts.length; j++) {
                newFaces.push({
                    vertices: [newVerts[0], newVerts[j - 1], newVerts[j]],
                    tags: face.tags ? [...face.tags] :[]
                });
            }
        }
    });

    mesh.faces = newFaces;
    console.log(`B"H - Healer: Resolved ${healedCount} T-junction rifts. Mesh is now watertight.`);
    return mesh;
}
