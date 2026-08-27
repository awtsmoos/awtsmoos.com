
// B"H

/**
 * @file ElbowJitter.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 9: THE TREMOR OF THE JOINT (Retet HaPereq)
 * THE MATH.RANDOM RECTIFICATION
 * ═══════════════════════════════════════════════════════════════
 *
 * "The joints of the mighty are loosened..." — Iyov 4:10 (paraphrase)
 *
 * THE BUG OF THE VIBRATING ELBOWS:
 * The former ElbowJitter used Math.random() per frame.
 * This produced violent, high-frequency noise — the elbows
 * jackhammered 60 times per second, looking like a mechanical failure
 * rather than an organic micro-tremor.
 *
 * THE POEM OF THE SHAKING JOINT:
 * The old elbow shook like a phone on vibrate,
 * Math.random() fired at a furious rate!
 * Not organic, not human, just digital noise,
 * Sixty random values destroying the poise!
 * Now a sine wave breathes at a biological pace,
 * And the tremor becomes a thing of quiet grace!
 *
 * RECTIFICATION:
 * A sin wave at low frequency (0.003 rad/ms) produces a smooth,
 * cyclical micro-tremor that looks organic and never vibrates.
 * An optional per-character phase offset prevents all elbows
 * from being perfectly synchronized (uncanny valley fix).
 *
 * @class ElbowJitter
 */
export class ElbowJitter {
  /**
   * @function update
   * @description
   * Applies a smooth, time-based organic micro-tremor to an elbow angle.
   *
   * @param {number} angle     - The base elbow angle in degrees.
   * @param {number} time      - The current realTime timestamp in ms.
   * @param {number} [phase=0] - Per-character phase offset (radians) to
   *                             prevent synchronization between characters.
   * @returns {number} The angle with a gentle organic tremor applied (degrees).
   */
  static update(angle, time, phase = 0) {
    // A slow sine wave at ~0.003 rad/ms ≈ 0.3 Hz — one subtle oscillation
    // every ~3 seconds. Amplitude of ±1.2 degrees matches real human resting tremor.
    const tremor = Math.sin(time * 0.003 + phase) * 1.2;
    return angle + tremor;
  }
}
