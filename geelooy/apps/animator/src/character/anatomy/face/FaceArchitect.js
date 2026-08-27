
// B"H
import { VirtualGraph as G }             from '../../../engine/graph/VirtualGraph.js';
import { ZygomaticusMajorRenderer }      from './muscles/ZygomaticusMajorRenderer.js';
import { OrbicularisOculiRenderer }      from './muscles/OrbicularisOculiRenderer.js';
import { WrinkleMatrix }                 from './skin/WrinkleMatrix.js';

/**
 * @file FaceArchitect.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 10: THE FACE OF THE REVELATION (Panim HaGilui)
 * THE IMPORT UNIFICATION RECTIFICATION
 * ═══════════════════════════════════════════════════════════════
 *
 * "The face of the king is like a lion, and his face is like the
 *  face of the Awtsmoos." — Mishlei 19:12 (paraphrase)
 *
 * THE BUG OF THE SPLIT IMPORT:
 * FaceArchitect.js imported 'ZygomaticusRenderer' (the old, shorter name).
 * FaceSystem.js imported 'ZygomaticusMajorRenderer' (the correct, full name).
 * Only ONE of these files existed on disk. The wrong import caused a 404
 * module error that cascaded through the entire character render pipeline,
 * producing a blank canvas wherever a character's face should be.
 *
 * THE POEM OF THE SPLIT NAME:
 * One file called it 'Major', one file dropped the word,
 * One 404 at boot and the whole face was blurred!
 * The import chain shattered, the pipeline went dark,
 * And every face rendered as nothing but stark!
 * Now both files agree on the same holy name,
 * ZygomaticusMajorRenderer — forever the same!
 *
 * RECTIFICATION: Unified to 'ZygomaticusMajorRenderer' to match FaceSystem.js.
 *
 * @class FaceArchitect
 */
export class FaceArchitect {
  /**
   * @function build
   * @description
   * Assembles the layered anatomical face group: muscles first, then skin details.
   *
   * @param {Object} data    - The character's live data vessel.
   * @param {Object} profile - Camera/view profile { type, dir }.
   * @returns {Object} A VirtualGraph group node for the full anatomical face layer.
   */
  static build(data, profile) {
    const muscles = [
      ZygomaticusMajorRenderer.build(data, profile),
      OrbicularisOculiRenderer.build(data, profile)
    ];

    const skinDetails = WrinkleMatrix.build(data, profile);

    return G.group('face_anatomical_layer', null, [
      ...muscles,
      ...skinDetails
    ]);
  }
}
