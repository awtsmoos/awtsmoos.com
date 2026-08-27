
// B"H
import { Vec3 } from './vec3.js';
import { Bezier } from './bezier.js';
import { generateFrames } from '../geometry/utils/pathFrames.js';

/**
 * @file pathUtils.js
 * @brief Utilities for generating and sampling geometric paths.
 */

/**
 * B"H - Generates a sequence of points representing a defined path.
 */
export function generatePath(pathDef) {
    if (!pathDef || !pathDef.type) return [];

    switch (pathDef.type) {
        case 'bezier':
            const segments = pathDef.curveSegments || 20;
            const points = pathDef.points || [];
            return Bezier.generatePath(points, segments);

        case 'circle':
            const circlePath = [];
            const radius = pathDef.radius || 5;
            const circleSegments = pathDef.segments || 64;
            for (let i = 0; i <= circleSegments; i++) {
                const angle = (i / circleSegments) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                circlePath.push([x, 0, z]);
            }
            return circlePath;

        case 'points':
            return pathDef.points || [];
            
        default:
            return [];
    }
}

/**
 * B"H - Samples a path to find N evenly spaced frames (position and orientation).
 */
export function samplePathFrames(points, count, closed = false) {
    if (points.length < 2 || count < 1) return [];
    
    // 1. Calculate total length and segment lengths
    const segmentLengths = [];
    let totalLength = 0;
    for (let i = 0; i < points.length - 1; i++) {
        const len = Vec3.dist(points[i], points[i+1]);
        segmentLengths.push(len);
        totalLength += len;
    }
    if (closed) {
        const len = Vec3.dist(points[points.length - 1], points[0]);
        segmentLengths.push(len);
        totalLength += len;
    }

    // 2. Generate path frames for orientation
    const pathFrames = generateFrames(points, closed);
    
    // 3. Sample N points
    const sampledFrames = [];
    const divisor = (count > 1 ? (closed ? count : count - 1) : 1);
    const step = totalLength / divisor;

    for (let i = 0; i < count; i++) {
        const targetDist = i * step;
        let distTravelled = 0;

        for (let j = 0; j < segmentLengths.length; j++) {
            const segLen = segmentLengths[j];
            if (targetDist >= distTravelled && targetDist <= distTravelled + segLen) {
                const t = (targetDist - distTravelled) / segLen;
                const p1 = points[j];
                const p2 = points[(j + 1) % points.length];
                const pos = Vec3.lerp(p1, p2, t);
                
                const frame = pathFrames[j]; 
                sampledFrames.push({ pos, ...frame });
                break;
            }
            distTravelled += segLen;
        }
    }
    return sampledFrames;
}
