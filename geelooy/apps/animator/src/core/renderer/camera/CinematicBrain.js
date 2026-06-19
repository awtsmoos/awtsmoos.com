
// B"H
import { AABBSystem } from '../../../engine/camera/systems/AABBSystem.js';
import { FrustumSystem } from '../../../engine/camera/systems/FrustumSystem.js';
import { ShotSystem } from '../../../engine/camera/systems/ShotSystem.js';

/**
 * @file CinematicBrain.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE UNIFIED VISION
 * ═══════════════════════════════════════════════════════════════
 */
export class CinematicBrain {
  /**
   * @function evaluate
   * @description Computes camera X, Y, and Zoom for the current frame.
   */
  static evaluate(shotType, targets, state, canvasWidth = 1920) {
    const characters = state.get('characters') || {};
    
    // 1. Gather all manifest targets
    let targetArray = [];
    if (Array.isArray(targets)) {
      targetArray = targets.map(id => characters[id]).filter(Boolean);
    } else if (targets && characters[targets]) {
      targetArray = [characters[targets]];
    }

    if (targetArray.length === 0) return { x: 0, y: -100, zoom: 1.0 };

    // 2. Resolve the Camp (AABB)
    const bounds = AABBSystem.getBounds(targetArray);

    // 3. Resolve the Composition (Focal Y)
    const targetY = ShotSystem.getFocalY(bounds, shotType);
    
    // 4. Resolve the Perception (Zoom Fit)
    // B"H - We must use the REAL canvas height, not a hardcoded one!
    const canvas = document.getElementById('character-canvas');
    const realHeight = canvas ? canvas.clientHeight : 1080;
    const realWidth = canvas ? canvas.clientWidth : 1920;

    const baseShotZoom = ShotSystem.getBaseZoom(shotType);
    const finalZoom = FrustumSystem.calculateZoom(bounds, realWidth, realHeight, baseShotZoom);

    return {
      x: bounds.centerX,
      y: targetY,
      zoom: finalZoom
    };
  }
}
