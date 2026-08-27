
// B"H
import { HUMAN_SKELETON_DATA } from './skeletonData.js';
import { HUMAN_MODIFIER_SEQUENCE } from './modifiers/index.js';
import { STANDARD_HUMAN_ANIMATIONS } from './animations/standardHumanAnimations.js';
import { manifestHeadAttachments } from './attachments/index.js';
import { generateProceduralGeometry } from '../../geometry/geometryGenerator.js';
import { createDentalArch } from './mouth/teethBuilder.js';
import { createTongue } from './mouth/tongueBuilder.js';

/**
 * @brief Deep clones an array of modifiers to prevent state exhaustion during probe generation.
 */
function cloneModifiers(mods) {
    return JSON.parse(JSON.stringify(mods));
}

export function createRiggedHuman(id, sceneTracksObj = {}) {
    
    const finalModifiers =[
        ...HUMAN_MODIFIER_SEQUENCE,
        { type: 'exportBounds', params: { tag: 'head_all', pointName: 'head_top', axis: 'y', direction: 1 } },
        { type: 'exportBounds', params: { tag: 'head_all', pointName: 'head_bottom', axis: 'y', direction: -1 } },
        { type: 'exportBounds', params: { tag: 'head_all', pointName: 'head_front', axis: 'z', direction: 1 } },
        { type: 'exportBounds', params: { tag: 'head_all', pointName: 'head_back', axis: 'z', direction: -1 } },
        { type: 'exportBounds', params: { tag: 'head_all', pointName: 'head_right', axis: 'x', direction: 1 } },
        { type: 'exportBounds', params: { tag: 'head_all', pointName: 'head_left', axis: 'x', direction: -1 } },
        
        // B"H - Exporting the exact centroid of the oral cavity regions
        { type: 'exportCentroid', params: { tag: 'mouth_ceiling', pointName: 'mouth_ceiling_center' } },
        { type: 'exportCentroid', params: { tag: 'mouth_floor', pointName: 'mouth_floor_center' } },
        { type: 'exportCentroid', params: { tag: 'mouth_inner', pointName: 'mouth_cavity_center' } }
        // lip_rim / mouth_opening_center is captured natively in MOUTH_CAVITY_MODS now!
    ];

    console.log(`\nB"H - 👁️ [${id}]: Commencing Probe Generation for Geometric Prophecy...`);
    const probeObject = { id: `${id}_probe`, exportedPoints: {} };
    
    // B"H - THE CRITICAL FIX: Pass a CLONE of the modifiers so the probe doesn't exhaust the tags!
    generateProceduralGeometry('cube', { size: 1.0 }, cloneModifiers(finalModifiers), probeObject);
    
    const pts = probeObject.exportedPoints;
    let headMetrics = { radius: 1.15, hairThickness: 0.25 }; 
    
    if (pts && pts.head_right && pts.head_left && pts.head_top) {
        headMetrics = {
            top: pts.head_top,
            front: pts.head_front,
            radius: (pts.head_right[0] - pts.head_left[0]) / 2.0,
            hairThickness: 0.25 
        };
        console.log(`B"H - 👁️ [${id}]: Prophecy Fulfilled. Head radius is ${headMetrics.radius.toFixed(3)}.`);
    } else {
         console.warn(`B"H - 🚨 [${id}]: Prophecy Failed. Head metrics could not be determined. Using default values.`);
    }
    
    if (pts && pts.mouth_opening_center) {
        console.log(`B"H - 👁️ [${id}]: Mouth Opening Center manifested at [${pts.mouth_opening_center.map(v=>v.toFixed(2)).join(', ')}]`);
    } else {
        console.error(`B"H - 🚨 [${id}]: FATAL ERROR! Mouth Opening Center not found! The vessel has no path for speech.`);
    }

    console.log(`\nB"H - 🔨 [${id}]: Prophecy complete. Commencing final manifestation...`);

    const attachments = manifestHeadAttachments(id, sceneTracksObj, headMetrics);

    // B"H - Manifesting the Internal Organs of Speech, now perfectly anchored inside the cavity!
    const upperTeeth = createDentalArch(`${id}_teeth_upper`, true);
    const lowerTeeth = createDentalArch(`${id}_teeth_lower`, false);
    const tongue = createTongue(`${id}_tongue`);

    attachments.push(upperTeeth, lowerTeeth, tongue);

    return {
        id,
        primitive: 'cube',
        parameters: { size: 1.0 },
        skeleton: HUMAN_SKELETON_DATA,
        modifiers: finalModifiers, // The pristine, unexhausted array is passed to the final object
        animations:[...STANDARD_HUMAN_ANIMATIONS],
        position: [0, 0, 0], 
        shaderVars: { uMaterialType: 'lambert' },
        children: attachments
    };
}
