// B"H
import { Vec3 } from '../../math/vec3.js';

/**
 * @file pathFrames.js
 * @brief Generates orthonormal frames (tangent, normal, binormal) along a 3D path.
 *        This uses the Parallel Transport Frame (Bishop's Frame) method to avoid twisting.
 *        A manifestation of divine order and consistency along a continuous creation.
 */
export function generateFrames(points, closed) {
    const frames = [];
    
    // 1. Initial Frame
    let tangent = Vec3.normalize(Vec3.sub(points[1], points[0]));
    let normal = [0, 1, 0];
    
    if (Math.abs(Vec3.dot(tangent, normal)) > 0.9) normal = [1, 0, 0];
    
    let binormal = Vec3.normalize(Vec3.cross(tangent, normal));
    normal = Vec3.normalize(Vec3.cross(binormal, tangent));
    
    frames.push({ tangent, normal, binormal });

    // 2. Propagate with proper Rotation (Bishop's Frame)
    for (let i = 0; i < points.length - 1; i++) {
        const prevFrame = frames[i];
        
        let t1; // next tangent
        if (i < points.length - 2) {
             t1 = Vec3.normalize(Vec3.sub(points[i+2], points[i+1]));
        } else if (closed) {
             t1 = Vec3.normalize(Vec3.sub(points[0], points[points.length-1]));
        } else {
             t1 = Vec3.normalize(Vec3.sub(points[i+1], points[i]));
        }

        const t0 = prevFrame.tangent;
        const axis = Vec3.cross(t0, t1);
        const dot = Vec3.dot(t0, t1);
        
        if (Vec3.dot(axis, axis) < 1e-6 || dot > 0.9999) {
             frames.push({ ...prevFrame, tangent: t1 });
        } else {
             const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
             const n = Vec3.rotate(prevFrame.normal, axis, angle);
             const b = Vec3.rotate(prevFrame.binormal, axis, angle);
             frames.push({ tangent: t1, normal: n, binormal: b });
        }
    }
    
    frames.push(frames[frames.length - 1]);
    
    return frames;
}
