
// B"H
/**
 * @file hairGeometry.js
 * @brief Generates the cross-sectional geometry for a volumetric strand.
 */

export function generatePrismStrand(segments = 8, radius = 0.5) {
    const strandVerts = [];
    const strandIndices = [];
    
    // Equilateral Triangle Profile
    // 0 degrees, 120 degrees, 240 degrees
    const angle0 = 0;
    const angle1 = (2 * Math.PI) / 3;
    const angle2 = (4 * Math.PI) / 3;
    
    const p0 = [Math.sin(angle0)*radius, Math.cos(angle0)*radius];
    const p1 = [Math.sin(angle1)*radius, Math.cos(angle1)*radius];
    const p2 = [Math.sin(angle2)*radius, Math.cos(angle2)*radius];
    
    const profile = [p0, p1, p2];

    for(let i=0; i<=segments; i++) {
        const y = i / segments;
        
        // Push 3 vertices for this level
        for(let k=0; k<3; k++) {
            // x (width), y (height), z (depth)
            // Profile is mapped to X and Z for expansion in shader
            strandVerts.push(profile[k][0], y, profile[k][1]);
        }

        // Connect to next level
        if(i < segments) {
            const base = i * 3;
            const next = (i + 1) * 3;
            
            // 3 Faces (Quads -> 2 Tris each)
            for(let k=0; k<3; k++) {
                const current = base + k;
                const nextCurrent = next + k;
                const neighbor = base + ((k + 1) % 3);
                const nextNeighbor = next + ((k + 1) % 3);
                
                strandIndices.push(current, neighbor, nextNeighbor);
                strandIndices.push(current, nextNeighbor, nextCurrent);
            }
        }
    }
    
    return { positions: strandVerts, indices: strandIndices };
}
