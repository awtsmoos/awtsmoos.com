
// B"H
/**
 * @file bone.js
 * @brief Manifests the physical vessel for a bone (An elongated octahedron).
 */

export function createBoneMesh(params = {}) {
    const color = params.color || [0.0, 1.0, 0.8, 1.0]; 
    const width = params.width || 0.15; 
    const waistY = params.waistY || 0.2; 

    const p0 = [0, 0, 0];   
    const p1 = [0, 1, 0];   
    
    const p2 =[-width, waistY, -width];
    const p3 = [width, waistY, -width];
    const p4 = [width, waistY, width];
    const p5 =[-width, waistY, width];

    const v = (pos) => ({ pos: [...pos], col: [...color] });

    return {
        faces:[
            { vertices:[v(p0), v(p3), v(p2)] },
            { vertices:[v(p0), v(p4), v(p3)] },
            { vertices:[v(p0), v(p5), v(p4)] },
            { vertices:[v(p0), v(p2), v(p5)] },
            
            { vertices:[v(p1), v(p2), v(p3)] },
            { vertices:[v(p1), v(p3), v(p4)] },
            { vertices:[v(p1), v(p4), v(p5)] },
            { vertices:[v(p1), v(p5), v(p2)] }
        ]
    };
}
