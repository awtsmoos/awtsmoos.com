
// B"H
/**
 * @file DigestiveKinematics.js
 * @description
 * 
 * ============================================================================
 * CHAPTER 5: THE INTERNALIZATION OF MATTER (Hakhnasat HaMazon)
 * ============================================================================
 * A vessel is not truly alive unless it interacts with the physical matter 
 * outside of itself. Drinking water is not merely making a cup disappear. 
 * The water transfers its mass into the throat, travels down the esophagus, 
 * and enters the body.
 * 
 * THE POEM OF THE SWALLOW:
 * The water leaves the plastic cup,
 * And flows into the one who sups.
 * But where does it go in the digital void?
 * Is the matter completely destroyed?
 * No! A bulge appears upon the throat,
 * As the biological engine gloats.
 * It travels down the fleshy tube,
 * A perfectly calculated, moving cube!
 * 
 * @class DigestiveKinematics
 * @classdesc Calculates the peristaltic movement of consumed mass down the throat.
 * ============================================================================
 */

import { VirtualGraph as G } from '../../graph/VirtualGraph.js';

export class DigestiveKinematics {
  /**
   * @function process
   * @description Tracks the temporal progress of a swallow and generates throat bulges.
   * @param {Object} data - The character's state.
   * @param {number} time - Global clock to track the descent of the bolus.
   * @returns {Object} A VirtualGraph group representing the throat distortion.
   */
  static process(data, time) {
    if (!data.isDrinking && !data.isEating) return null;

    // We simulate the swallow cycle taking roughly 2000 milliseconds
    const cycle = (time % 2000) / 2000; // 0.0 to 1.0

    // The bolus starts at the top of the throat (Y = -20) and descends to the clavicle (Y = 30)
    const throatStartY = -20;
    const throatEndY = 30;
    const currentY = throatStartY + (throatEndY - throatStartY) * cycle;

    // The bulge expands and contracts as it travels
    const bulgeWidth = 8 + Math.sin(cycle * Math.PI) * 6; // Max width in the middle of the swallow

    // This creates an Adam's Apple / Bolus projection on the front of the neck
    const dir = data.partzufProfile?.dir || 1; // Left or Right facing profile
    const offsetX = (data.partzufProfile?.type === 'side' ? 12 * dir : 0);

    return G.path(`bolus_${data.id}`, [
      { type: 'move', x: offsetX, y: currentY - 10 },
      { type: 'quad', cx: offsetX + (bulgeWidth * dir), cy: currentY, x: offsetX, y: currentY + 10 }
    ], { 
      stroke: 'rgba(0,0,0,0.15)', // Shadow defining the bulge
      lineWidth: 2, 
      lineCap: 'round' 
    });
  }
}
