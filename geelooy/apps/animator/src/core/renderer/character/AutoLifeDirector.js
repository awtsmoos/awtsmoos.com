
// B"H
import { AwtsmoosMath } from '../../../engine/core/AwtsmoosMath.js';

/**
 * @file AutoLifeDirector.js
 * @description
 * ============================================================================
 * CHAPTER: EVEN IF THE TIMELINE FAILS, LIFE STILL MOVES
 * ============================================================================
 *
 * The scene looked frozen because too much depended on event state being
 * perfect. This pass gives every character a living procedural baseline:
 * breathing, blinking, looking, shifting weight, arm motion, walk cycles,
 * talking emphasis, and small expression changes.
 *
 * It never destroys explicit scene events. It only fills dead air.
 */
export class AutoLifeDirector {
  /**
   * Applies visible life to one character every render frame.
   *
   * @param {Object} data - Character data.
   * @param {number} realTime - Real render clock.
   * @param {number} directorTime - Director timeline clock.
   * @param {number} index - Character index.
   * @returns {Object} Mutated character data.
   */
  static apply(data, realTime, directorTime, index) {
    if (!data) return data;

    const id = String(data.id || `soul_${index}`);
    const hash = AwtsmoosMath.hashString(id);
    const phase = (hash % 997) / 997 * AwtsmoosMath.TAU;
    const t = realTime || directorTime || 0;

    data._renderTime = t;
    data._lifePhase = phase;
    data._lifeIndex = index;

    const cycle = Math.floor((t * 0.00018 + index * 0.21) % 4);

    if (!data.easyMotion || data.easyMotion === 'idle') {
      const modes = ['idle', 'look', 'breathe', 'gesture'];
      data.easyMotion = modes[cycle] || 'idle';
    }

    if (data.isWalking || data.easyMotion === 'walk') {
      data.walkClock = (data.walkClock || 0) + 16;
    }

    data.idle = data.idle || {};
    data.idle.headBob = Math.sin(t * 0.0021 + phase) * 1.7;
    data.idle.sway = Math.sin(t * 0.0014 + phase) * 2.1;
    data.idle.blink = this.blinkValue(t, phase, index);

    data.lookX = Math.sin(t * 0.0011 + phase) * 2.2;
    data.lookY = Math.sin(t * 0.0017 + phase) * 1.3;

    if (!data.expression || data.expression === 'neutral') {
      const expressions = ['warm', 'curious', 'thinking', 'concerned', 'heroic'];
      data.expression = expressions[hash % expressions.length];
    }

    return data;
  }

  /**
   * Creates blinking that is not identical between characters.
   *
   * @param {number} time - Current time.
   * @param {number} phase - Character phase.
   * @param {number} index - Character index.
   * @returns {number} Blink closure amount.
   */
  static blinkValue(time, phase, index) {
    const blinkClock = (time * 0.0017 + phase + index * 0.47) % 5.5;
    if (blinkClock < 0.10) return 1;
    if (blinkClock < 0.18) return 0.5;
    return 0;
  }
}
