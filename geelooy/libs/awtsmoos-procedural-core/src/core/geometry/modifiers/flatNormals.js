
// B"H
/**
 * @file flatNormals.js
 * @brief Enforces sharp, faceted shading by calculating discrete face normals.
 * 
 * THE PSALM OF THE CLEAR FACE:
 * Let the light not bleed where the Spirit has set a border.
 * We calculate the normal of the Face, the decree of the Divine Order.
 * Every vertex on the Quad shall share the same sight,
 * Reflecting as one the Creator's pure light.
 */
import { Vec3 } from '../../math/vec3.js';

export function computeFlatNormalsModifier(mesh) {
    if (!mesh.faces) return mesh;

    mesh.faces.forEach(face => {
        const v = face.vertices;
        if (v.length >= 3) {
            // Normal = Normalize( (v1-v0) cross (v_last-v0) )
            const e1 = Vec3.sub(v[1].pos, v[0].pos);
            const e2 = Vec3.sub(v[v.length - 1].pos, v[0].pos);
            const n = Vec3.normalize(Vec3.cross(e1, e2));
            
            // Assign this exact normal to every vertex on the face.
            v.forEach(vert => {
                vert.norm = [...n];
            });
        }
    });

    mesh.hasSmoothNormals = false;
    return mesh;
}
