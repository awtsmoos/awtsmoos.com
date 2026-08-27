
// B"H
/**
 * @file ringModifiers.js
 * @brief Atomic modifiers for manipulating UV sphere rings and regions.
 *        Reflecting the divine order of creation where every part is measured.
 */
import { Vec3 } from '../../math/vec3.js';

function getRangeCheck(val, range) {
    if (range === undefined || range === null) return true;
    if (typeof range === 'number') return Math.abs(val - range) < 0.001;
    if (Array.isArray(range)) {
        if (range.length === 2 && typeof range[0] === 'number' && typeof range[1] === 'number') {
             return val >= range[0] - 0.001 && val <= range[1] + 0.001;
        }
        return range.some(r => Math.abs(val - r) < 0.001);
    }
    return false;
}

function getSegCheck(segIdx, segments, params) {
    const { segRange, indices } = params;
    if (indices && Array.isArray(indices)) return indices.includes(segIdx);
    if (segRange === undefined || segRange === null) return true;
    
    if (typeof segRange === 'number') return segIdx === segRange;
    if (Array.isArray(segRange) && segRange.length === 2) {
        const sPct = segIdx / segments;
        const [start, end] = segRange;
        if (start > end) {
            return sPct >= start || sPct <= end;
        }
        return sPct >= start && sPct <= end;
    }
    return false;
}

export function scaleRingsModifier(mesh, params) {
    const { rings, scale = [1, 1, 1] } = params;
    const visited = new Set();
    const segments = mesh.segments || 32;
    mesh.faces.forEach(face => {
        face.vertices.forEach(v => {
            if (visited.has(v)) return;
            visited.add(v);
            if (getRangeCheck(v.ringIdx, rings) && getSegCheck(v.segIdx, segments, params)) {
                v.pos[0] *= scale[0];
                v.pos[1] *= scale[1];
                v.pos[2] *= scale[2];
            }
        });
    });
    return mesh;
}

export function translateRingsModifier(mesh, params) {
    const { rings, translation = [0, 0, 0] } = params;
    const visited = new Set();
    const segments = mesh.segments || 32;
    mesh.faces.forEach(face => {
        face.vertices.forEach(v => {
            if (visited.has(v)) return;
            visited.add(v);
            if (getRangeCheck(v.ringIdx, rings) && getSegCheck(v.segIdx, segments, params)) {
                v.pos = Vec3.add(v.pos, translation);
            }
        });
    });
    return mesh;
}

export function frontalDisplaceRingsModifier(mesh, params) {
    const { rings, displacement = [0, 0, 0], power = 1.0 } = params;
    const segments = mesh.segments || 32;
    const visited = new Set();
    mesh.faces.forEach(face => {
        face.vertices.forEach(v => {
            if (visited.has(v)) return;
            visited.add(v);
            if (getRangeCheck(v.ringIdx, rings) && getSegCheck(v.segIdx, segments, params)) {
                const sPct = v.segIdx / segments;
                const longitudeFactor = Math.cos(sPct * Math.PI * 2);
                const frontWeight = Math.max(0, longitudeFactor);
                const weight = Math.pow(frontWeight, power);
                
                v.pos[0] += displacement[0] * weight;
                v.pos[1] += displacement[1] * weight;
                v.pos[2] += displacement[2] * weight;
            }
        });
    });
    return mesh;
}

export function rotateRingsModifier(mesh, params) {
    const { rings, axis = [0, 1, 0], angle = 0 } = params;
    const segments = mesh.segments || 32;
    const visited = new Set();
    const axisVec = Array.isArray(axis) ? axis : (axis === 'x' ? [1,0,0] : axis === 'y' ? [0,1,0] : [0,0,1]);
    
    mesh.faces.forEach(face => {
        face.vertices.forEach(v => {
            if (visited.has(v)) return;
            visited.add(v);
            if (getRangeCheck(v.ringIdx, rings) && getSegCheck(v.segIdx, segments, params)) {
                v.pos = Vec3.rotate(v.pos, axisVec, angle);
                if (v.norm) v.norm = Vec3.rotate(v.norm, axisVec, angle);
            }
        });
    });
    return mesh;
}

export function weightRingsModifier(mesh, params) {
    const { rings, boneIndices = [0, 0, 0, 0], boneWeights = [1, 0, 0, 0] } = params;
    const visited = new Set();
    const segments = mesh.segments || 32;
    
    mesh.faces.forEach(face => {
        face.vertices.forEach(v => {
            if (visited.has(v)) return;
            visited.add(v);
            if (getRangeCheck(v.ringIdx, rings) && getSegCheck(v.segIdx, segments, params)) {
                v.boneIndices = [...boneIndices];
                v.boneWeights = [...boneWeights];
            }
        });
    });
    return mesh;
}

export function colorRingsModifier(mesh, params) {
    const { rings, color = [1, 1, 1, 1] } = params;
    const visited = new Set();
    const segments = mesh.segments || 32;
    mesh.faces.forEach(face => {
        face.vertices.forEach(v => {
            if (visited.has(v)) return;
            visited.add(v);
            if (getRangeCheck(v.ringIdx, rings) && getSegCheck(v.segIdx, segments, params)) {
                v.col = [...color];
            }
        });
    });
    return mesh;
}

/**
 * B"H - Subdivides a vertical range of rings by inserting N edge loops.
 * @param {object} mesh 
 * @param {object} params { rings: [start, end], count: 1 }
 */
export function subdivideRingsModifier(mesh, params) {
    const { rings, count = 1 } = params;
    if (!mesh.faces) return mesh;

    const [rStart, rEnd] = rings;
    const newFaces = [];
    
    for (let fIdx = 0; fIdx < mesh.faces.length; fIdx++) {
        const face = mesh.faces[fIdx];
        const v = face.vertices;
        if (v.length !== 4) { newFaces.push(face); continue; }

        const r0 = v[0].ringIdx, r1 = v[1].ringIdx, r2 = v[2].ringIdx, r3 = v[3].ringIdx;
        const minR = Math.min(r0, r1, r2, r3);
        const maxR = Math.max(r0, r1, r2, r3);
        
        if (minR >= rStart && maxR <= rEnd && Math.abs(minR - maxR) > 0.001) {
            // Identify Top (minR) and Bottom (maxR) pairs
            const top = v.filter(vert => Math.abs(vert.ringIdx - minR) < 0.001);
            const bottom = v.filter(vert => Math.abs(vert.ringIdx - maxR) < 0.001);

            // Reorder for CCW: [t0, b0, b1, t1]
            // Standard UV sphere quad is usually (r,s), (r+1,s), (r+1,s+1), (r,s+1)
            const t0 = v[0].ringIdx === minR ? v[0] : v[3];
            const t1 = v[0].ringIdx === minR ? v[3] : v[0];
            const b1 = v[1].ringIdx === maxR ? v[2] : v[1];
            const b0 = v[1].ringIdx === maxR ? v[1] : v[2];

            let prevLid = [t0, t1];
            for (let i = 1; i <= count; i++) {
                const t = i / (count + 1);
                const nextLid = [
                    {
                        pos: Vec3.lerp(t0.pos, b0.pos, t),
                        col: [...t0.col],
                        ringIdx: t0.ringIdx + t,
                        segIdx: t0.segIdx,
                        boneIndices: t0.boneIndices ? [...t0.boneIndices] : undefined,
                        boneWeights: t0.boneWeights ? [...t0.boneWeights] : undefined
                    },
                    {
                        pos: Vec3.lerp(t1.pos, b1.pos, t),
                        col: [...t1.col],
                        ringIdx: t1.ringIdx + t,
                        segIdx: t1.segIdx,
                        boneIndices: t1.boneIndices ? [...t1.boneIndices] : undefined,
                        boneWeights: t1.boneWeights ? [...t1.boneWeights] : undefined
                    }
                ];
                newFaces.push({ vertices: [prevLid[0], nextLid[0], nextLid[1], prevLid[1]] });
                prevLid = nextLid;
            }
            newFaces.push({ vertices: [prevLid[0], b0, b1, prevLid[1]] });
        } else {
            newFaces.push(face);
        }
    }
    
    mesh.faces = newFaces;
    return mesh;
}
