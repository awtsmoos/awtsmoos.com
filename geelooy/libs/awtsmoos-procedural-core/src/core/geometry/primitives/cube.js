
// B"H
/**
 * @file cube.js
 * @brief Manifests the most fundamental building block, the Cube.
 * 
 * THE PSALM OF ISOLATION:
 * Before, the corners shared a single point of light,
 * And when the modifiers moved them, they multiplied the flight.
 * Now, every face claims its own distinct array,
 * So the flesh remains exactly where the Awtsmoos says to stay.
 */
export function createCubeMesh(params) {
    const size = params.size || 1.0;
    const baseColor = params.color || [0.2, 0.4, 0.8, 1.0]; 
    const half = size / 2;
    
    // The 8 sacred anchors of the cube
    const p =[
        [-half, half, -half], [half, half, -half],[half, -half, -half], [-half, -half, -half],
        [-half, half, half],[half, half, half], [half, -half, half], [-half, -half, half]
    ];
    
    // B"H - CRITICAL FIX: Spread operator forces a deep clone. 
    // This stops modifiers from mutating shared references exponentially.
    const v = (idx, color) => ({ pos: [...p[idx]], col: [...color] });
    
    const fc = params.faceColors || {};
    const faces = [];

    // Constructing the 6 walls of the vessel
    faces.push({ vertices:[v(7, fc.front||baseColor), v(6, fc.front||baseColor), v(5, fc.front||baseColor), v(4, fc.front||baseColor)] }); 
    faces.push({ vertices:[v(0, fc.back||baseColor), v(1, fc.back||baseColor), v(2, fc.back||baseColor), v(3, fc.back||baseColor)] });   
    faces.push({ vertices:[v(4, fc.top||baseColor), v(5, fc.top||baseColor), v(1, fc.top||baseColor), v(0, fc.top||baseColor)] });     
    faces.push({ vertices:[v(3, fc.bottom||baseColor), v(2, fc.bottom||baseColor), v(6, fc.bottom||baseColor), v(7, fc.bottom||baseColor)] }); 
    faces.push({ vertices:[v(2, fc.right||baseColor), v(1, fc.right||baseColor), v(5, fc.right||baseColor), v(6, fc.right||baseColor)] }); 
    faces.push({ vertices:[v(7, fc.left||baseColor), v(4, fc.left||baseColor), v(0, fc.left||baseColor), v(3, fc.left||baseColor)] });   

    return { faces };
}
