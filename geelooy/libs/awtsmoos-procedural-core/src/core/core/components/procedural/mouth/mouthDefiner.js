
// B"H
/**
 * @file mouthDefiner.js
 * @chapter THE UNIFICATION OF THE ORAL SPELL
 */

import { createMouthChisel } from './mouthChisel.js';
import { createMouthTagModifiers } from './mouthTagger.js';
import { createMouthShapeKeyModifiers } from './expressiveShapes.js';

export function generateProceduralMouth(config = {}) {
    const safeConfig = {
        position: config.position || [0, -0.5, 3.0], 
        rotation: config.rotation || [0, 0, 0],       
        scale: config.scale || [1.6, 1.0, 1.0],      
        innerColor: config.innerColor || [0.4, 0.05, 0.05, 1.0]
    };

    console.log(`B"H - 👄 [MouthDefiner]: Initiating sequence. Diamond Mouth at [${safeConfig.position}]`);

    // 1. Forge the semantic Diamond Plug
    const chiselMesh = createMouthChisel(safeConfig);

    return [
        // A. THE TZIMTZUM STRIKE
        {
            type: 'csgPrimitiveSubtract',
            params: {
                customMesh: chiselMesh, 
                transform: {
                    rotation: safeConfig.rotation,
                    scale: safeConfig.scale,
                    position: safeConfig.position
                },
                insideTag: 'mouth_inner_wall' // Brands the cavity permanently
            }
        },

        // B. THE TOPOLOGICAL HEALING
        // Heals boolean fractures so topological neighbor queries can walk the surface safely!
        { type: 'healTopology', params: { tolerance: 0.001 } },

        // C. THE SEAM RECLAMATION
        ...createMouthTagModifiers(safeConfig),

        // D. POTENTIAL INFUSION (Shape Keys)
        ...createMouthShapeKeyModifiers(safeConfig),

        // E. RE-LIGHTING
        { type: 'smoothNormals' }
    ];
}
