
// B"H
/**
 * @file eyeAttacher.js
 * @brief Positions the dual windows of the soul, now recessed for realism.
 */

import { createEyeGroup } from '../../eye/eyeGroup.js';

export function attachEyes(id, sceneTracksObj, headMetrics) {
    const targetTrackId = `${id}_gaze_target`;
    const r = headMetrics.radius;

    const eyeSpread = r * 0.28;

    const eyes = createEyeGroup({
        id: `${id}_eyes`,
        scale:[0.19, 0.19, 0.19], 
        eyes:[
            { pos:[0, 0, 0], color:[0.1, 0.35, 0.7] }, 
            { pos:[0, 0, 0], color:[0.1, 0.35, 0.7] }  
        ],
        targetPath: sceneTracksObj[targetTrackId] ? sceneTracksObj[targetTrackId].keyframes :[]
    }, sceneTracksObj);

    // B"H - THE RECESSED EYE
    const dropY = -r * 0.14; 
    // Pushed deeper (-0.21) into the head sphere to simulate sockets
    const embedZ = -0.21; 

    eyes[0].attachment = { 
        bone: 'head', 
        useExportedPoint: 'head_front', 
        offset: [-eyeSpread, dropY, embedZ] 
    };
    
    eyes[1].attachment = { 
        bone: 'head', 
        useExportedPoint: 'head_front', 
        offset:[eyeSpread, dropY, embedZ] 
    };

    return eyes;
}
