// B"H
import { Vec3 } from '../../math/vec3.js';

export function extrudeFace(mesh, faceIndex, distance) {
    if (faceIndex < 0 || faceIndex >= mesh.faces.length) return mesh;

    const originalFace = mesh.faces[faceIndex];
    // Deep copy vertices to avoid reference issues before modification
    originalFace.vertices = originalFace.vertices.map(v => ({ pos: [...v.pos], col: [...v.col] }));
    
    const v = originalFace.vertices;
    const edge1 = Vec3.sub(v[1].pos, v[0].pos);
    const edge2 = Vec3.sub(v[3].pos, v[0].pos);
    const normal = Vec3.normalize(Vec3.cross(edge1, edge2));
    const moveVec = Vec3.scale(normal, distance);

    const baseVerts = v.map(vert => ({ pos: [...vert.pos], col: vert.col }));

    // Move Cap (the original face becomes the top/bottom of the extrusion)
    for (let i = 0; i < 4; i++) v[i].pos = Vec3.add(v[i].pos, moveVec);

    // Create sides connecting base to cap
    mesh.faces.push({ vertices: [baseVerts[0], baseVerts[1], v[1], v[0]] });
    mesh.faces.push({ vertices: [baseVerts[1], baseVerts[2], v[2], v[1]] });
    mesh.faces.push({ vertices: [baseVerts[2], baseVerts[3], v[3], v[2]] });
    mesh.faces.push({ vertices: [baseVerts[3], baseVerts[0], v[0], v[3]] });

    return mesh;
}