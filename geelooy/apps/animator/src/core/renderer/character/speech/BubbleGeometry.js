
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file BubbleGeometry.js
 * @brief THE VESSEL OF THE VOICE (Kli HaKol).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 9: THE CONFINEMENT OF SOUND
 * ═══════════════════════════════════════════════════════════════
 * Speech without boundaries is just noise. This module draws the 
 * stark white rectangle and the precise triangular tail that links 
 * the text to the character's physical mouth. 
 * 
 * It dynamically flips the Y-axis of the tail if the character 
 * is positioned too high on the screen, preventing the text from 
 * vanishing into the upper firmament.
 * 
 * @class BubbleGeometry
 */
export class BubbleGeometry {
  /**
   * @function build
   * @description Generates the background and tail nodes.
   * @param {number} bx - Left edge of bubble.
   * @param {number} by - Top edge of bubble.
   * @param {number} w - Width.
   * @param {number} h - Height.
   * @param {number} mouthX - Character mouth X.
   * @param {number} mouthY - Character mouth Y.
   * @param {boolean} isFlippedDown - Should the bubble render under the mouth?
   * @returns {Array<Object>} Graph nodes for the balloon.
   */
  static build(bx, by, w, h, mouthX, mouthY, isFlippedDown) {
    let tailPath = [];
    
    if (isFlippedDown) {
      tailPath = [
        { type: 'move', x: bx + w/2 - 20, y: by },
        { type: 'line', x: mouthX, y: mouthY }, // Points up to the face
        { type: 'line', x: bx + w/2 + 20, y: by }
      ];
    } else {
      tailPath = [
        { type: 'move', x: bx + w/2 - 20, y: by + h },
        { type: 'line', x: mouthX, y: mouthY }, // Points down to the face
        { type: 'line', x: bx + w/2 + 20, y: by + h }
      ];
    }

    return [
      G.path('sb_tail', tailPath, { fill: '#ffffff', stroke: '#000000', lineWidth: 5, lineJoin: 'round' }),
      G.rect('sb_body', bx, by, w, h, { fill: '#ffffff', stroke: '#000000', lineWidth: 5, radius: 20 })
    ];
  }
}
