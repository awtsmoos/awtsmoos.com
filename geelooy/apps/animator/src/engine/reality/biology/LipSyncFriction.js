
// B"H
/**
 * @file LipSyncFriction.js
 * @brief THE WEIGHT OF WORDS (Koved HaDibbur).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE VISCOUS ETHER
 * ═══════════════════════════════════════════════════════════════
 * "And G-d said..."
 * Speech requires physical effort. When a human mouth transitions from an 
 * 'O' shape to an 'E' shape, the muscles must drag the flesh across the skull.
 * 
 * If we simply swap the 5-point Bezier arrays instantly, the character appears 
 * to have a strobing, glitching face. 
 * 
 * This module applies a 'Friction Coefficient' (Tzimtzum) to the array of 
 * geometric points. It remembers the last frame's exact pixel locations 
 * and lerps (Linear Interpolates) them toward the target viseme by only 30% 
 * per frame. The resulting speech is buttery, thick, and hyper-realistic.
 * 
 * @class LipSyncFriction
 */

import { AwtsmoosMath } from '../../core/AwtsmoosMath.js';

export class LipSyncFriction {
  /** @type {Map<string, Array<Object>>} Memory vault of the last known mouth shapes */
  static stateVault = new Map();

  /**
   * @function interpolate
   * @description Drags the current mouth geometry toward the target geometry.
   * @param {string} charId - Unique identifier of the soul.
   * @param {Array<Object>} targetPoints - The destination viseme path array.
   * @param {number} friction - The resistance (0.0 to 1.0). Higher = slower morph.
   * @returns {Array<Object>} The smoothed, intermediate path array.
   */
  static interpolate(charId, targetPoints, friction = 0.3) {
    if (!this.stateVault.has(charId)) {
      // First frame of existence: Snap instantly
      const deepClone = JSON.parse(JSON.stringify(targetPoints));
      this.stateVault.set(charId, deepClone);
      return deepClone;
    }

    const currentPoints = this.stateVault.get(charId);

    // If the arrays have mismatched lengths (Shevirah!), reset the baseline
    if (currentPoints.length !== targetPoints.length) {
      const deepClone = JSON.parse(JSON.stringify(targetPoints));
      this.stateVault.set(charId, deepClone);
      return deepClone;
    }

    // The Lerp Rate: 1.0 minus friction. (Friction 0.3 means move 70% of the way)
    const t = 1.0 - friction;

    const smoothedPoints = currentPoints.map((curr, i) => {
      const target = targetPoints[i];
      
      // Preserve the structural type (move, bezier, line, quad)
      const newPt = { type: target.type, x: AwtsmoosMath.lerp(curr.x, target.x, t), y: AwtsmoosMath.lerp(curr.y, target.y, t) };

      // Lerp Bezier control points if they exist
      if (target.cx !== undefined) newPt.cx = AwtsmoosMath.lerp(curr.cx || curr.x, target.cx, t);
      if (target.cy !== undefined) newPt.cy = AwtsmoosMath.lerp(curr.cy || curr.y, target.cy, t);
      
      if (target.c1x !== undefined) newPt.c1x = AwtsmoosMath.lerp(curr.c1x || curr.x, target.c1x, t);
      if (target.c1y !== undefined) newPt.c1y = AwtsmoosMath.lerp(curr.c1y || curr.y, target.c1y, t);
      
      if (target.c2x !== undefined) newPt.c2x = AwtsmoosMath.lerp(curr.c2x || curr.x, target.c2x, t);
      if (target.c2y !== undefined) newPt.c2y = AwtsmoosMath.lerp(curr.c2y || curr.y, target.c2y, t);

      return newPt;
    });

    // Save the new state back into the vault
    this.stateVault.set(charId, smoothedPoints);

    return smoothedPoints;
  }
}
