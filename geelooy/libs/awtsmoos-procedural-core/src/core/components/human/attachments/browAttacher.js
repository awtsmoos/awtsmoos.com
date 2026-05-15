
// B"H
/**
 * @file browAttacher.js
 * @brief Manifests thickened Bezier brows that map perfectly to the forehead.
 */
import { BezierUtils } from '../../../math/bezierUtils.js';

export function attachBrows(id, headMetrics) {
    const r = headMetrics.radius;
    const eyeSpread = r * 0.28;
    const browLift = r * 0.15; 
    
    const browWidth = 0.35;
    const archHeight = 0.01; 
    
    const p0 =[-browWidth/2, 0, 0];
    const p1 =[0, archHeight, 0.02]; 
    const p2 =[browWidth/2, -0.05, 0];
    
    const pathPoints = BezierUtils.getPoints(p0, p1, p2, 12);

    const browDefinition = {
        primitive: 'tube',
        parameters: {
            radius: 0.025,
            radialSegments: 6,
            path: pathPoints,
            color:[0.08, 0.04, 0.02, 1.0], 
            smooth: true
        },
        modifiers:[
            { type: 'smoothNormals' } 
        ],
        doubleSided: true // B"H - GUARANTEES outward facing visibility regardless of path winding
    };

    const leftBrow = {
        id: `${id}_brow_l`, 
        ...browDefinition,
        attachment: { 
            bone: 'head', 
            useExportedPoint: 'head_front', 
            offset:[-eyeSpread, browLift, 0.02] 
        },
        keyframes: [{ time: 0, rotation:[0.1, 0, 0] }] 
    };

    const rightBrow = {
        id: `${id}_brow_r`, 
        ...browDefinition,
        attachment: { 
            bone: 'head', 
            useExportedPoint: 'head_front', 
            offset:[eyeSpread, browLift, 0.02] 
        },
        keyframes:[{ time: 0, rotation:[0.1, 0, 0] }]
    };

    return [leftBrow, rightBrow];
}
