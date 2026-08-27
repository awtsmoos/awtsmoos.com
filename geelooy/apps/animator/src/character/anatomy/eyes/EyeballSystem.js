// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { EyeMath } from './EyeMath.js';
import { ScleraGeometry } from './ScleraGeometry.js';
import { CapillaryNetwork } from './CapillaryNetwork.js';
import { IrisRenderer } from './IrisRenderer.js';
import { EyelidMechanics } from './EyelidMechanics.js';
import { EyelidShading } from './EyelidShading.js';
import { EyelashGenerator } from './EyelashGenerator.js';
import { AwtsmoosMath } from '../../../engine/core/AwtsmoosMath.js';
import { EyeConvergence } from './logic/EyeConvergence.js';

/**
 * @file EyeballSystem.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * ⚠️  LEGACY — USE EyeVessel.js INSTEAD  ⚠️
 * ═══════════════════════════════════════════════════════════════
 * B"H
 *
 * This is the LEGACY eye rendering system. It is preserved for reference
 * and for any backward-compatible rendering paths that may still call it.
 *
 * FOR ALL NEW CODE: Use EyeVessel.build() in ./EyeVessel.js
 *
 * LEGACY ADVANTAGES (historical):
 * + Spherical pupil projection (foreshortening via AwtsmoosMath.sphericalProjection)
 * + CapillaryNetwork micro-veins inside the sclera
 * + EyeConvergence for near-object focal depth
 *
 * LEGACY DISADVANTAGES:
 * - Synchronized blink (both eyes blink identically — uncanny)
 * - No emotion expression overlays (no CrowsFeet, Furrow, Fatigue)
 * - More complex and less maintainable
 *
 * THE POEM OF THE OLD EYE:
 * The elder eye saw much — capillaries and spheres,
 * Foreshortened pupils and convergence frontiers!
 * But both eyes blinked as one — no soul, no split,
 * The new EyeVessel desynchronized every bit.
 * The elder rests now, honored but replaced,
 * Its wisdom absorbed, its bugs all erased.
 *
 * @class EyeballSystem
 * @deprecated Use EyeVessel.build() from ./EyeVessel.js
 */
export class EyeballSystem {
  /**
   * @function build
   * @deprecated Use EyeVessel.build() instead.
   * @description
   * Builds a legacy eye assembly with spherical projection and capillary network.
   * Kept for backward compatibility. Will not receive new features.
   *
   * @param {number} x     - X position.
   * @param {number} y     - Y position.
   * @param {number} w     - Eye width.
   * @param {number} h     - Eye height.
   * @param {number} scale - Overall scale.
   * @param {Object} data  - Character data state.
   * @param {number} blink - Blink value 0–1.
   * @returns {Object} A VirtualGraph group node.
   */
  static build(x, y, w, h, scale, data, blink) {
    // Saccade eye darts
    let saccadeX = data.eyeDart ? data.eyeDart.x : 0;
    const saccadeY = data.eyeDart ? data.eyeDart.y : 0;

    // B"H - EYE CONVERGENCE INJECTION
    const side = x < 0 ? 'left' : 'right';
    const convergenceShift = EyeConvergence.getOffset(data, side);
    saccadeX += convergenceShift;

    // B"H - SPHERICAL PROJECTION
    const sphereSquashX = AwtsmoosMath.sphericalProjection(saccadeX, w);

    const { size: pupilSize, rad: pupilRad } = EyeMath.computePupil(h, {
      surprise: data.surprise,
      concentration: data.concentration
    });

    let { scleraH, eyelidDropLevel } = EyeMath.computeScleraBound(
      h, data.surprise || 0, data.joy || 0
    );

    let eyelidDrop = eyelidDropLevel;
    if (blink > 0.5) eyelidDrop = 1.1;

    const eyeColor  = (data.colors && data.colors.eyes) ? data.colors.eyes : '#3a2010';
    const skinColor = data.colors?.skin || '#b36d3c';

    const clipPoints = ScleraGeometry.generateClipPoints(w, scleraH);

    return G.group('eye_vessel', { x, y, scaleX: scale, scaleY: scale * (1 - blink) }, [
      ScleraGeometry.generateBase(w, scleraH),

      G.clip('sclera_clip', null, clipPoints, [
        CapillaryNetwork.spawnMicroVeins(w, h),
        G.group('iris_squasher', { scaleX: sphereSquashX }, [
          IrisRenderer.render(saccadeX / sphereSquashX, saccadeY, pupilSize, pupilRad, eyeColor)
        ]),
        EyelidMechanics.createLids(w, scleraH, eyelidDrop, skinColor, clipPoints),
        ...EyelidShading.generateHatching(w, scleraH)
      ]),

      ScleraGeometry.generateOutline(clipPoints),
      ...EyelashGenerator.generate(w, scleraH, eyelidDrop)
    ]);
  }
}