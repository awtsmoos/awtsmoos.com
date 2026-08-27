// B"H
import { Vec3 } from '../../math/vec3.js';

export function createIcosphereMesh(params) {
    const radius = params.radius || 1.0;
    const subdivisions = Math.floor(params.subdivisions) || 0;
    const color = params.color || [1, 1, 1, 1];
    const smooth = params.smooth || false;

    const t = (1 + Math.sqrt(5)) / 2;
    const rawVerts = [
        [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
        [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
        [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
    ];
    let vertices = rawVerts.map(v => Vec3.normalize(v));
    let triangles = [
        [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
        [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
        [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];

    const getMidPoint = (v1, v2) => Vec3.normalize(Vec3.scale(Vec3.add(v1, v2), 0.5));

    for (let s = 0; s < subdivisions; s++) {
        const nextTriangles = [];
        for (const tri of triangles) {
            const v0 = Array.isArray(tri[0]) ? tri[0] : vertices[tri[0]];
            const v1 = Array.isArray(tri[1]) ? tri[1] : vertices[tri[1]];
            const v2 = Array.isArray(tri[2]) ? tri[2] : vertices[tri[2]];
            const a = getMidPoint(v0, v1);
            const b = getMidPoint(v1, v2);
            const c = getMidPoint(v2, v0);
            nextTriangles.push([v0, a, c]);
            nextTriangles.push([v1, b, a]);
            nextTriangles.push([v2, c, b]);
            nextTriangles.push([a, b, c]);
        }
        triangles = nextTriangles;
    }

    const faces = [];
    for (const tri of triangles) {
        const vPos = tri.map(item => Array.isArray(item) ? item : vertices[item]);
        const faceVerts = vPos.map(pos => {
            const finalPos = Vec3.scale(pos, radius);
            const vert = { pos: finalPos, col: color };
            if (smooth) vert.norm = pos; 
            return vert;
        });
        faces.push({ vertices: faceVerts });
    }
    return { faces };
}