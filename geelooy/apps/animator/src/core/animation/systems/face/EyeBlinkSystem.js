
// B"H
import { AwtsmoosMath } from '../../../../engine/core/AwtsmoosMath.js';

/**
 * @class EyeBlinkSystem
 * @description 
 * THE DIVINE PAUSE (Nimeshimah).
 * B"H
 * 
 * RECTIFIED (Asymmetrical Blink Phasing): Humans do not blink in perfect robotic
 * synchronicity. The left eye and right eye possess independent micro-offsets.
 * We hash the character's unique ID to generate an absolute deterministic seed 
 * so that each soul blinks at its own unique, slightly offset rhythm.
 */
export class EyeBlinkSystem {
  static timers = new Map();

  /**
   * @function update
   * @description Computes the blink state independently for each eye.
   * @param {number} val - Current blink state (0 to 1).
   * @param {number} delayBase - Average milliseconds between blinks.
   * @param {string} id - The character's unique ID.
   * @param {string} side - 'left' or 'right'.
   */
  static update(val, delayBase = 200, id = 'soul', side = 'left') {
    // Unique memory space for each eye of each character
    const memKey = `${id}_${side}`;
    
    if (!this.timers.has(memKey)) {
      // Create a deterministic seed based on ID and side
      const idSeed = id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const seedVal = idSeed + (side === 'left' ? 10 : 20);
      const randomStart = AwtsmoosMath.seededRandom(seedVal) * delayBase;
      this.timers.set(memKey, { time: randomStart, doubleBlink: false });
    }

    const state = this.timers.get(memKey);

    if (val > 0) {
        // Slower, more elegant closure
        return Math.max(0, val - 0.15); 
    }
    
    state.time--;

    if (state.time <= 0) {
        // Trigger blink
        if (Math.random() < 0.2 && !state.doubleBlink) { 
            state.doubleBlink = true;
            state.time = 15;
        } else {
            state.doubleBlink = false;
            const sideOffset = side === 'left' ? 0 : 5;
            state.time = Math.random() * delayBase + (delayBase * 0.2) + sideOffset; 
        }
        return 1.0;
    }
    
    return 0;
  }
}
