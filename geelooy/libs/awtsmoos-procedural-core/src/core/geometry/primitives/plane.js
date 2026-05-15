// B"H
export function createPlaneMesh(params) {
    const size = params.size || 10.0;
    const color = params.color || [0.5, 0.5, 0.5, 1.0];
    const half = size / 2;
    const v = (x, z) => ({ pos: [x, 0, z], col: color });
    
    // Standard CCW Winding for Front Faces (facing UP)
    return {
        faces: [
            { 
                vertices: [
                    v(-half, half),  // Bottom Left (+Z)
                    v(half, half),   // Bottom Right (+Z)
                    v(half, -half),  // Top Right (-Z)
                    v(-half, -half)  // Top Left (-Z)
                ]
            }
        ]
    };
}