
// B"H
import { VirtualGraph as G } from '../../engine/graph/VirtualGraph.js';
import { AwtsmoosMath } from '../../engine/core/AwtsmoosMath.js';

/**
 * @file EmotionIconRenderer.js
 * @description
 * CHAPTER: THE SIGN FLOATS ABOVE THE SOUL.
 */
export class EmotionIconRenderer {
  /**
   * Builds one floating icon.
   *
   * @param {Object} icon - Icon config.
   * @param {Object} data - Character data.
   * @param {number} index - Icon index.
   * @param {number} time - Time.
   * @returns {Object} VirtualGraph node.
   */
  static build(icon, data, index, time) {
    const soul = data.animPersonality || {};
    const phase = (soul.phase || 0) + index;
    const bob = AwtsmoosMath.wave(time, 0.006, phase, 5);
    const pulse = 1 + AwtsmoosMath.wave(time, 0.008, phase, 0.08);

    return G.group(`emotion_icon_${data.id}_${index}`, {
      x: (data.position?.x || 0) + icon.dx + index * 18,
      y: (data.position?.y || 0) + icon.dy + bob,
      scaleX: pulse,
      scaleY: pulse
    }, [
      G.text(`emotion_icon_text_${index}`, icon.text, 0, 0, {
        fill: icon.text === '!' || icon.text === '?' ? '#ffcc00' : '#ffffff',
        stroke: '#000000',
        lineWidth: 3,
        font: icon.font || '30px Arial',
        align: 'center',
        baseline: 'middle'
      })
    ]);
  }
}
