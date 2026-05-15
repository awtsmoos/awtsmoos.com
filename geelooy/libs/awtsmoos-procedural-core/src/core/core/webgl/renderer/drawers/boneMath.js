
// B"H
import { Vec3 } from '../../../math/vec3.js';

/**
 * Creates an orthonormal basis matrix aligning the Y-axis with the given direction.
 */
export function createBoneBasisMatrix(pos, dir, scaleLength) {
    const yAxis = Vec3.normalize(dir);
    
    let xAxis = Vec3.cross([0, 0, 1], yAxis);
    if (Vec3.dot(xAxis, xAxis) < 0.0001) {
        xAxis = Vec3.cross([1, 0, 0], yAxis);
    }
    xAxis = Vec3.normalize(xAxis);
    const zAxis = Vec3.normalize(Vec3.cross(xAxis, yAxis));

    const sy = scaleLength;
    const sx = 1.0; 
    const sz = 1.0;

    return [
        xAxis[0]*sx, xAxis[1]*sx, xAxis[2]*sx, 0,
        yAxis[0]*sy, yAxis[1]*sy, yAxis[2]*sy, 0,
        zAxis[0]*sz, zAxis[1]*sz, zAxis[2]*sz, 0,
        pos[0], pos[1], pos[2], 1
    ];
}
