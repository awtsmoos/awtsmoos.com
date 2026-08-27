
// B"H
/**
 * @file yarmulkeAttacher.js
 * @brief Manifests the Yarmulke as a fitted dome centered on the crown, clearing the hair.
 */

import { createYarmulke } from '../../clothing/yarmulke.js';
import { HatLogic } from './hatLogic.js';

export function attachYarmulke(id, headMetrics) {
    if (!headMetrics) {
        headMetrics = { radius: 1.15, hairThickness: 0.25 };
    }

    const padding = 0.05; 
    // B"H - Reduced scale multiplier from 1.3 to 0.88 for a perfectly sized Kippah
    const { scale, offsetY } = HatLogic.calculateTopKissingTransform(headMetrics, 0.88, padding);

    console.log(`B"H - [YarmulkeAttacher]: Padded Placement for [${id}]`);
    console.log(`      Scale: ${scale.toFixed(3)}, Offset Y: ${offsetY.toFixed(3)}`);

    const yarmulke = createYarmulke(`${id}_yarmulke`);
    
    yarmulke.scale = [scale, scale, scale];
    yarmulke.rotation =[-0.1, 0, 0]; 
    yarmulke.position =[0, 0, 0]; 

    const pushBack = 0.0;

    yarmulke.attachment = { 
        bone: 'head', 
        useExportedPoint: 'head_top', 
        offset: [0, offsetY, pushBack] 
    };
    
    return yarmulke;
}
