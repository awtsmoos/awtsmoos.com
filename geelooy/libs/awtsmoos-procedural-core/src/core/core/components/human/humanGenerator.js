
// B"H
/**
 * @file humanGenerator.js
 * @brief Procedural manifestation of the human flesh through coordinated extrusions.
 * 
 * THE POEM OF THE EXTENSION:
 * We start with the Torso, a vessel of might,
 * Scaling and shifting it into the light.
 * From tags of direction, the limbs begin growth,
 * In perfect accordance with the skeletal oath.
 * The head rises upward, spherized with grace,
 * The mouth carved inward, to hold speech's space.
 * Then colors are applied, like garments of skin,
 * And the Golem stands ready, for life to begin.
 * 
 * @module humanGenerator
 * @exports {Function} createRiggedHuman - The master function for human manifestation
 */

import { HUMAN_SKELETON_DATA } from './skeletonData.js';
import { HUMAN_MODIFIER_SEQUENCE } from './modifiers/index.js';
import { STANDARD_HUMAN_ANIMATIONS } from './animations/standardHumanAnimations.js';
import { generateProceduralGeometry } from '../../geometry/geometryGenerator.js';

/**
 * Creates a fully rigged human object with procedural geometry, skeleton, and animations.
 * 
 * THE HYMN OF THE COMPLETE MANIFESTATION:
 * This function is the culmination, the final divine word,
 * That takes the raw components, and in unity they're heard.
 * It probes the geometry first, to measure head and mouth,
 * Then attaches the details, from eyes to hair, without doubt.
 * The skeleton is linked, the animations assigned,
 * And the human emerges, by the Awtsmoos designed.
 * 
 * @function createRiggedHuman
 * @param {string} id - The sacred name of this human instance
 * @param {Object} [sceneTracksObj={}] - Optional external animation tracks to merge
 * @returns {Object} A complete scene object with geometry, skeleton, animations, and attachments
 * 
 * @example
 * const golem = createRiggedHuman('golem_manifest');
 * // Returns a fully rigged human ready for animation and rendering
 */
export function createRiggedHuman(id, sceneTracksObj = {}) {
  // 1. Prepare the final modifier sequence with export operations
  const finalModifiers = [
    ...HUMAN_MODIFIER_SEQUENCE,
    // Export key points for attachment logic
    { type: 'exportBounds', params: { tag: 'head_all', pointName: 'head_top', axis: 'y', direction: 1 } },
    { type: 'exportBounds', params: { tag: 'head_all', pointName: 'head_bottom', axis: 'y', direction: -1 } },
    { type: 'exportBounds', params: { tag: 'head_all', pointName: 'head_front', axis: 'z', direction: 1 } },
    { type: 'exportBounds', params: { tag: 'head_all', pointName: 'head_back', axis: 'z', direction: -1 } },
    { type: 'exportBounds', params: { tag: 'head_all', pointName: 'head_right', axis: 'x', direction: 1 } },
    { type: 'exportBounds', params: { tag: 'head_all', pointName: 'head_left', axis: 'x', direction: -1 } },
    // Export mouth cavity center for speech attachments
    { type: 'exportCentroid', params: { tag: 'mouth_inner', pointName: 'mouth_cavity_center' } }
  ];

  // 2. Probe generation to measure head metrics
  console.log(`B"H - 👁️ [${id}]: Commencing Probe Generation for Geometric Prophecy...`);
  const probeObject = { id: `${id}_probe`, exportedPoints: {} };
  generateProceduralGeometry('cube', { size: 1.0 }, finalModifiers, probeObject);
  const pts = probeObject.exportedPoints;
  
  // Calculate head metrics from exported points
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
  
  // 3. Generate the final human object
  console.log(`B"H - 🔨 [${id}]: Prophecy complete. Commencing final manifestation...`);
  
  return {
    id,
    primitive: 'cube',
    parameters: { size: 1.0 },
    skeleton: HUMAN_SKELETON_DATA,
    modifiers: finalModifiers,
    animations: [...STANDARD_HUMAN_ANIMATIONS],
    position: [0, 0, 0],
    shaderVars: { uMaterialType: 'lambert' },
    children: [] // Attachments added by parent scene
  };
}
