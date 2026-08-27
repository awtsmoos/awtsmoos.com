
// B"H
/**
 * @file hairAttacher.js
 * @brief Grows a dense, short boy's cut concentrically from the skull center.
 */
import { createHairPatch } from '../hairBuilder.js';

export function attachHair(id, headMetrics) {
    const r = headMetrics.radius;
    const l = headMetrics.hairThickness;

    console.log(`B"H - Hair [${id}]: Weaving 20,000 strands from center at -${r.toFixed(3)} depth.`);
    
    return createHairPatch(`${id}_hair`, {
        count: 20000,     // B"H - Maximum density
        sphereRadius: r - 0.01, 
        direction: [0, 1, -0.2], 
        angleLimit: 0.1,  // Covers the entire upper skull
        length: l,       
        width: 0.02,      
        taper: 0.1,      // Uniform thickness
        combStrength: 0.2,
        combDir: [0, -1, 0.3], 
        colorBase: [0.08, 0.04, 0.01], 
        colorTip: [0.3, 0.15, 0.08],
        
        attachment: { 
            bone: 'head', 
            useExportedPoint: 'head_top', 
            // Origin at geometric center of the head sphere
            offset: [0, -r, 0] 
        } 
    });
}
