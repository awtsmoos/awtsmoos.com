
// B"H
/**
 * @file subdivide.js
 * @chapter THE MULTIPLICATION OF RADIANCE
 */
import { Vec3 } from '../../math/vec3.js';
import { VertexWelder } from '../utils/vertexWelder.js';

export function subdivideMesh(mesh, levels, faceIndices = null, smooth = false) {
    if (levels <= 0) return mesh;
    
    console.log(`B"H - 🔪 Subdividing mesh by ${levels} level(s). Target faces: ${faceIndices ? faceIndices.length : 'ALL'}`);
    
    let currentFaces = mesh.faces;
    
    for (let l = 0; l < levels; l++) {
        const nextFaces = [];
        
        for (let i = 0; i < currentFaces.length; i++) {
            const face = currentFaces[i];
            const tags = face.tags ? [...face.tags] : []; 
            const shouldSubdivide = (faceIndices === null) || (l === 0 && faceIndices.includes(i));
            
            if (shouldSubdivide) {
                const v = face.vertices;
                const createFace = (verts) => {
                    const f = { vertices: verts };
                    if (tags.length > 0) f.tags = [...tags];
                    return f;
                };

                if (v.length === 4) {
                    const v0=v[0], v1=v[1], v2=v[2], v3=v[3];
                    const m01 = { pos: Vec3.lerp(v0.pos, v1.pos, 0.5), col: [...v0.col] };
                    const m12 = { pos: Vec3.lerp(v1.pos, v2.pos, 0.5), col: [...v1.col] };
                    const m23 = { pos: Vec3.lerp(v2.pos, v3.pos, 0.5), col: [...v2.col] };
                    const m30 = { pos: Vec3.lerp(v3.pos, v0.pos, 0.5), col: [...v3.col] };
                    
                    const centerPos = Vec3.scale(
                        Vec3.add(Vec3.add(v0.pos, v1.pos), Vec3.add(v2.pos, v3.pos)), 
                        0.25
                    );
                    const center = { pos: centerPos, col: [...v0.col] };

                    nextFaces.push(createFace([v0, m01, center, m30]));
                    nextFaces.push(createFace([m01, v1, m12, center]));
                    nextFaces.push(createFace([center, m12, v2, m23]));
                    nextFaces.push(createFace([m30, center, m23, v3]));
                } else if (v.length === 3) {
                    const v0=v[0], v1=v[1], v2=v[2];
                    const m01 = { pos: Vec3.lerp(v0.pos, v1.pos, 0.5), col: [...v0.col] };
                    const m12 = { pos: Vec3.lerp(v1.pos, v2.pos, 0.5), col: [...v1.col] };
                    const m20 = { pos: Vec3.lerp(v2.pos, v0.pos, 0.5), col: [...v2.col] };
                    
                    nextFaces.push(createFace([v0, m01, m20]));
                    nextFaces.push(createFace([m01, v1, m12]));
                    nextFaces.push(createFace([m20, m12, v2]));
                    nextFaces.push(createFace([m01, m12, m20]));
                } else {
                    nextFaces.push(face);
                }
            } else {
                nextFaces.push(face);
            }
        }
        currentFaces = nextFaces;

        if (smooth) {
            relaxGeometry(currentFaces);
        }
    }
    
    mesh.faces = currentFaces;
    return mesh;
}

function relaxGeometry(faces) {
    const welded = VertexWelder.getWeldedMap({ faces });
    const posToNeighbors = new Map();

    faces.forEach(f => {
        const v = f.vertices;
        for (let i = 0; i < v.length; i++) {
            const cur = VertexWelder.getPositionHash(v[i].pos);
            const next = VertexWelder.getPositionHash(v[(i+1)%v.length].pos);
            const prev = VertexWelder.getPositionHash(v[(i-1+v.length)%v.length].pos);
            
            if (!posToNeighbors.has(cur)) posToNeighbors.set(cur, new Set());
            posToNeighbors.get(cur).add(next);
            posToNeighbors.get(cur).add(prev);
        }
    });

    const smoothed = new Map();
    welded.forEach((vertSet, hash) => {
        const neighbors = posToNeighbors.get(hash);
        if (!neighbors || neighbors.size === 0) return;
        
        const originalPos = Array.from(vertSet)[0].pos;
        let avg = [0,0,0];
        let count = 0;

        neighbors.forEach(nHash => {
            const nVerts = welded.get(nHash);
            if (nVerts) {
                const nPos = Array.from(nVerts)[0].pos;
                avg = Vec3.add(avg, nPos);
                count++;
            }
        });

        if (count > 0) {
            avg = Vec3.scale(avg, 1.0 / count);
            smoothed.set(hash, Vec3.lerp(originalPos, avg, 0.5));
        }
    });

    smoothed.forEach((pos, hash) => {
        const verts = welded.get(hash);
        if (verts) verts.forEach(v => v.pos = [...pos]);
    });
}
