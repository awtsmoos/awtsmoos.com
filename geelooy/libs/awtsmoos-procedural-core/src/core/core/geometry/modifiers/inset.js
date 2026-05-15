// B"H
import { Vec3 } from '../../math/vec3.js';

/**
 * @brief Insets a face by creating a smaller version of it in the center
 *        and connecting the corners. Essentially subdivides a face into 5 (Center + 4 borders).
 * @param {object} mesh 
 * @param {number} faceIndex 
 * @param {number} amount - 0.0 to 1.0 (Inset factor). 0.2 = 20% smaller.
 */
export function insetFaceModifier(mesh, faceIndex, amount) {
    if (faceIndex < 0 || faceIndex >= mesh.faces.length) return mesh;
    const face = mesh.faces[faceIndex];
    const v = face.vertices;
    
    // Only support quads for reliable insetting right now
    if (v.length !== 4) {
        console.warn('B"H - insetFace: Only quads supported currently.');
        return mesh;
    }

    // 1. Calculate Centroid
    let cPos = [0,0,0];
    let cCol = [0,0,0,0];
    v.forEach(vert => {
        cPos = Vec3.add(cPos, vert.pos);
        cCol = vert.col.map((c, i) => c + cCol[i]);
    });
    cPos = Vec3.scale(cPos, 0.25);
    cCol = cCol.map(c => c * 0.25);

    // 2. Create Inner Vertices
    const insetVerts = v.map(vert => ({
        pos: Vec3.lerp(vert.pos, cPos, amount),
        col: [...vert.col],
        norm: vert.norm ? [...vert.norm] : undefined
    }));

    // 3. Create Border Faces
    // The original face index will point to the NEW Inner Face.
    // We add 4 new border faces to the end of the mesh array.
    
    const borderFaces = [];
    for(let i=0; i<4; i++) {
        const next = (i+1)%4;
        
        // Face: Old[i] -> Old[next] -> New[next] -> New[i]
        borderFaces.push({
            vertices: [
                {...v[i]},       
                {...v[next]},
                {...insetVerts[next]},
                {...insetVerts[i]}
            ]
        });
    }

    // 4. Update Original Face to become the Inner Face
    face.vertices = insetVerts;

    // 5. Add borders
    mesh.faces.push(...borderFaces);

    return mesh;
}