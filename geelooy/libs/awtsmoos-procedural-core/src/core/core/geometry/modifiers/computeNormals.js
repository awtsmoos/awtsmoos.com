
// B"H
/**
 * @file computeNormals.js
 * @brief The divine flow of Loving-kindness (Chesed), carefully bounded by Judgment (Gevurah).
 */
import { Vec3 } from '../../math/vec3.js';
import { VertexWelder } from '../utils/vertexWelder.js';

export function computeSmoothNormalsModifier(mesh) {
    if (!mesh.faces) return mesh;

    const hashNormals = new Map();

    // B"H - Enhanced Hashing: Separates inner cavities from outer skin to create sharp creases.
    const getHash = (v, f) => {
        const baseHash = VertexWelder.getPositionHash(v.pos);
        // If the face is part of the inner mouth, isolate its normals!
        const isMouth = f.tags && f.tags.includes('mouth_inner');
        return baseHash + (isMouth ? "_cavity" : "_skin");
    };

    // 1. Accumulate the raw geometric face normal into the isolated spatial hash
    mesh.faces.forEach(face => {
        const v = face.vertices;
        if (v.length >= 3) {
            const e1 = Vec3.sub(v[1].pos, v[0].pos);
            const e2 = Vec3.sub(v[v.length - 1].pos, v[0].pos);
            let n = Vec3.cross(e1, e2);
            
            if (Vec3.dot(n, n) > 1e-8) {
                n = Vec3.normalize(n);
            } else {
                n = [0, 1, 0]; 
            }
            
            v.forEach(vert => {
                const hash = getHash(vert, face);
                if (!hashNormals.has(hash)) {
                    hashNormals.set(hash, [0, 0, 0]);
                }
                hashNormals.set(hash, Vec3.add(hashNormals.get(hash), n));
            });
        }
    });

    // 2. Normalize and apply
    mesh.faces.forEach(face => {
        face.vertices.forEach(vert => {
            const hash = getHash(vert, face);
            let n = hashNormals.get(hash) || [0, 1, 0];
            
            if (Vec3.dot(n, n) > 1e-8) {
                n = Vec3.normalize(n);
            } else {
                n = [0, 1, 0];
            }
            vert.norm = [...n];
        });
    });

    mesh.hasSmoothNormals = true;
    return mesh;
}
