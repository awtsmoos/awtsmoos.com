
// B"H
import { Vec3 } from '../../math/vec3.js';

/**
 * @file extrudeBorder.js
 * @brief Identifies boundary edges and extrudes them with an optional inward slant (inset).
 */
export function extrudeBorderModifier(mesh, height, inset = 0.0) {
    if (!mesh.faces || mesh.faces.length === 0) return mesh;

    const edgeMap = new Map();
    const getVid = (p) => `${Math.round(p[0]*100)}|${Math.round(p[1]*100)}|${Math.round(p[2]*100)}`;

    mesh.faces.forEach(face => {
        const v = face.vertices;
        for (let i = 0; i < v.length; i++) {
            const v1 = v[i], v2 = v[(i + 1) % v.length];
            const id1 = getVid(v1.pos), id2 = getVid(v2.pos);
            const key = id1 < id2 ? `${id1}<->${id2}` : `${id2}<->${id1}`;
            if (!edgeMap.has(key)) edgeMap.set(key, { count: 0, v1, v2 });
            edgeMap.get(key).count++;
        }
    });

    const newFaces = [];
    const center = [0, 0, 0]; // Assume centered for inset logic
    
    edgeMap.forEach((edge) => {
        if (edge.count === 1) {
            const v1 = edge.v1, v2 = edge.v2;
            const p1 = [...v1.pos], p2 = [...v2.pos];
            
            // B"H - Calculate incline/inset direction (towards center)
            const d1 = Vec3.normalize(Vec3.sub(center, p1));
            const d2 = Vec3.normalize(Vec3.sub(center, p2));
            
            const p1_up = [
                p1[0] + d1[0] * inset, 
                p1[1] + height, 
                p1[2] + d1[2] * inset
            ];
            const p2_up = [
                p2[0] + d2[0] * inset, 
                p2[1] + height, 
                p2[2] + d2[2] * inset
            ];

            const col = v1.col ? [...v1.col] : [0.5, 0.5, 0.5, 1.0];
            newFaces.push({
                vertices: [
                    { pos: p1, col: col },
                    { pos: p2, col: col },
                    { pos: p2_up, col: col },
                    { pos: p1_up, col: col }
                ]
            });
        }
    });

    mesh.faces.push(...newFaces);
    return mesh;
}
