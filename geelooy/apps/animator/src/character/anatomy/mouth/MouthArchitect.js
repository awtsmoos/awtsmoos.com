
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { MouthEngine } from '../face/MouthEngine.js';

/**
 * @class MouthArchitect
 * @description
 * THE ORACLE OF UTTERANCE.
 * B"H
 * 
 * THE POEM OF THE REWIRED JAW:
 * The old morpher was lingering, a ghost from the past,
 * Calling functions and files that were not meant to last!
 * So the Architect stripped out the ancient decay,
 * And wired it straight to the new 16-way!
 * Now the Keter is linked to the base of the throat,
 * As the Awtsmoos sustains every single red boat!
 * 
 * RECTIFICATION: Completely bypassed the old 8-point bezier systems.
 * This class now cleanly delegates ALL rendering logic to `MouthEngine.process`,
 * eliminating the "Schizophrenic Mouth Engines" conflict.
 */
export class MouthArchitect {
  /**
   * @function build
   * @description Manifests the oral vessel with hyper-realistic layering.
   * @param {Object} data - The character's soul data.
   * @param {Object} profile - The perspective transformation plane.
   * @param {number} jawDrop - Current physical displacement of the mandible.
   * @returns {Object} The VirtualGraph Group node.
   */
  static build(data, profile, jawDrop = 0) {
    const targetViseme = data.targetViseme || 'neutral';
    const intensity = Math.min(1.0, (data.vocalIntensity || 0));
    const skinColor = data.colors?.skin || '#f2c1a2';
    
    // Direct pass-through to the unified 16-point geometric engine.
    const mouthAssembly = MouthEngine.process(data.id, targetViseme, intensity, skinColor);

    return G.group('mouth_root', null, [
      mouthAssembly
    ]);
  }
}
