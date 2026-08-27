
// B"H
import { Vec3 } from '../../math/vec3.js';
import { Bezier } from '../../math/bezier.js';
import { generateFrames } from '../utils/pathFrames.js';

export function createTubeMesh(params) {
    let path = params.path ||[]; 
    if (path.type === 'bezier') path = Bezier.generatePath(path.points, params.curveSegments || 20);
    else if (!Array.isArray(path)) path =[];

    const r = params.radius || 0.2, rs = Math.floor(params.radialSegments) || 8;
    const closed = params.closed || false, color = params.color ||[0.5, 0.5, 0.5, 1.0];

    if (path.length < 2) return { faces:[] };

    const frames = generateFrames(path, closed);
    const vertices =[];
    for (let i = 0; i < path.length; i++) {
        for (let j = 0; j <= rs; j++) {
            const theta = (j / rs) * Math.PI * 2;
            const N_offset = Vec3.scale(frames[i].normal, Math.cos(theta) * r);
            const B_offset = Vec3.scale(frames[i].binormal, Math.sin(theta) * r);
            const offset = Vec3.add(N_offset, B_offset);
            vertices.push({ pos: Vec3.add(path[i], offset), norm: Vec3.normalize(offset), col: color });
        }
    }

    const faces =[];
    const ringSize = rs + 1;
    for (let i = 0; i < (closed ? path.length : path.length - 1); i++) {
        for (let j = 0; j < rs; j++) {
            const next_i = (i + 1) % path.length;
            const v1 = vertices[i*ringSize+j];
            const v2 = vertices[next_i*ringSize+j];
            const v3 = vertices[next_i*ringSize+j+1];
            const v4 = vertices[i*ringSize+j+1];
            
            // B"H - THE TIKKUN OF WINDING: 
            // Reversing the order to[v1, v4, v3, v2] ensures normals point OUTWARD.
            faces.push({ vertices:[v1, v4, v3, v2] });
        }
    }

    if (!closed) {
        const addCap = (isStart) => {
            const idx = isStart ? 0 : path.length - 1;
            const frame = frames[idx];
            const norm = isStart ? Vec3.scale(frame.tangent, -1) : frame.tangent;
            const center = { pos: path[idx], norm, col: color };
            for (let j = 0; j < rs; j++) {
                const v1 = vertices[idx*ringSize+j], v2 = vertices[idx*ringSize+j+1];
                const cap_v1 = { pos: v1.pos, norm, col: v1.col }, cap_v2 = { pos: v2.pos, norm, col: v2.col };
                if (isStart) faces.push({ vertices:[center, cap_v2, cap_v1] });
                else faces.push({ vertices:[center, cap_v1, cap_v2] });
            }
        };
        addCap(true); addCap(false);
    }
    return { faces };
}
