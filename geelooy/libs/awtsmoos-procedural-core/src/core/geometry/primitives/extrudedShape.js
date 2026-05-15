
// B"H
import { Vec3 } from '../../math/vec3.js';
import { triangulatePolygon } from '../utils/triangulation.js';

/**
 * @param {object} params
 * @param {Array} params.shape - Array of [x, z] points for outer loop.
 * @param {Array} params.holes - Array of Arrays of [x, z] points for inner loops.
 * @param {number} params.depth
 * @param {Array} params.color
 */
export function createExtrudedShapeMesh(params) {
    const outerShape = params.shape || [];
    const holes = params.holes || [];
    const depth = params.depth || 1.0;
    const color = params.color || [0.5, 0.5, 0.5, 1.0];
    
    if (outerShape.length < 3) return { faces: [] };

    const halfDepth = depth / 2;
    const faces = [];
    
    // 1. Prepare Data for Triangulator
    // Triangulator expects flat array [x0, y0, x1, y1...]
    // And holeIndices array [startIdxHole1, startIdxHole2...]
    
    const flatCoords = [];
    outerShape.forEach(p => flatCoords.push(p[0], p[1]));
    
    const holeIndices = [];
    let currentIndex = outerShape.length;
    
    holes.forEach(hole => {
        if (hole.length < 3) return;
        holeIndices.push(currentIndex);
        hole.forEach(p => flatCoords.push(p[0], p[1]));
        currentIndex += hole.length;
    });

    // 2. Triangulate Cap
    // Returns indices into the flat vertex list (0 to N-1)
    const capIndices = triangulatePolygon(flatCoords, holeIndices);
    
    // Helper: Retrieve Point from flat array by index
    const getP = (i) => [flatCoords[i*2], flatCoords[i*2+1]];

    const mkVert = (x, y, z, ny) => ({ pos: [x, y, z], col: color, norm: [0, ny, 0] });

    // 3. Generate Caps
    for (let i = 0; i < capIndices.length; i += 3) {
        const i0 = capIndices[i];
        const i1 = capIndices[i+1];
        const i2 = capIndices[i+2];

        const p0 = getP(i0);
        const p1 = getP(i1);
        const p2 = getP(i2);

        // Top Cap (CCW)
        faces.push({
            vertices: [
                mkVert(p0[0], halfDepth, p0[1], 1),
                mkVert(p1[0], halfDepth, p1[1], 1),
                mkVert(p2[0], halfDepth, p2[1], 1)
            ]
        });
        
        // Bottom Cap (CW) - flip order
        faces.push({
            vertices: [
                mkVert(p0[0], -halfDepth, p0[1], -1),
                mkVert(p2[0], -halfDepth, p2[1], -1),
                mkVert(p1[0], -halfDepth, p1[1], -1)
            ]
        });
    }

    // 4. Generate Walls
    // Outer Loop
    generateWalls(outerShape, faces, halfDepth, color, false);
    
    // Holes (Inner Loops)
    // Note: Holes should usually be wound opposite to Outer. 
    // If Triangulator expects specific winding, we must respect it.
    // Assuming Outer is CCW, Holes are CW.
    // Walls need to face "inward" relative to the hole center, i.e., Outward relative to the solid.
    // Standard wall gen assumes CCW -> Outward Normals.
    // If Hole is CW, we might need to reverse wall generation or normals?
    // Let's assume standard wall gen works if points are ordered correctly.
    
    holes.forEach(hole => {
        generateWalls(hole, faces, halfDepth, color, true); // True = invert normals/winding for inner walls?
    });

    return { faces };
}

function generateWalls(loop, faces, halfDepth, color, isHole) {
    const len = loop.length;
    for (let i = 0; i < len; i++) {
        const next = (i + 1) % len;
        
        const pCurrent = loop[i];
        const pNext = loop[next];

        const dx = pNext[0] - pCurrent[0];
        const dz = pNext[1] - pCurrent[1];
        
        // Normal is perpendicular to (dx, 0, dz)
        let nx = -dz;
        let nz = dx;
        
        // If it's a hole (CW), this normal points IN to the hole (which is OUT of the solid).
        // If it's outer (CCW), this normal points OUT of the solid.
        // Wait, (dx, dz) = (1, 0) -> Normal (0, 1). Right hand rule.
        // CCW: Right is Inside. Left is Outside.
        // Let's normalize.
        const l = Math.sqrt(nx*nx + nz*nz);
        if(l>0){ nx/=l; nz/=l; }
        
        // Ensure winding is correct for visibility
        // BL -> TL -> TR -> BR is standard Quad.
        // If Hole (CW), we want walls facing 'in' to the loop center? 
        // Actually, walls need to face the 'empty' space.
        // For a hole, the empty space is inside the loop.
        
        const vBL = { pos: [pCurrent[0], -halfDepth, pCurrent[1]], col: color, norm: [nx, 0, nz] };
        const vTL = { pos: [pCurrent[0],  halfDepth, pCurrent[1]], col: color, norm: [nx, 0, nz] };
        const vTR = { pos: [pNext[0],     halfDepth, pNext[1]],    col: color, norm: [nx, 0, nz] };
        const vBR = { pos: [pNext[0],    -halfDepth, pNext[1]],    col: color, norm: [nx, 0, nz] };

        // Standard: vBL, vBR, vTR, vTL (CCW)
        // If isHole, we might need to flip if the loop winding is different?
        // Let's rely on the Tracer giving us consistent CW/CCW.
        // If Walls appear inside out, we flip here.
        
        faces.push({ vertices: [vBL, vBR, vTR, vTL] }); 
    }
}
