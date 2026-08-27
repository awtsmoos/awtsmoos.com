// B"H

/**
 * @file StableGait.js
 * @description
 * ============================================================================
 * CHAPTER: THE FEET THAT FINALLY ALTERNATED
 * ============================================================================
 *
 * This file owns the exact bug: both feet moving together. Left and right are
 * offset by half a cycle. A planted phase stays low. A swing phase lifts.
 *
 * @class StableGait
 */
export class StableGait {
  /**
   * Samples gait.
   *
   * @param {Object} args - Args.
   * @param {number} args.time - Time ms.
   * @param {number} args.side - -1 left, 1 right.
   * @param {string} args.mode - walk or run.
   * @returns {Object} Gait pose.
   */
  static sample({ time, side, mode }) {
    const profiles = {
      walk: { cps: 1.55, stride: 18, lift: 10, arm: 15, bob: 2.4 },
      run: { cps: 2.65, stride: 32, lift: 19, arm: 26, bob: 6 }
    };

    const p = profiles[mode] || profiles.walk;
    const seconds = (Number.isFinite(time) ? time : 0) / 1000;
    const phase = (seconds * p.cps + (side > 0 ? 0.5 : 0)) % 1;
    const wave = Math.cos(phase * Math.PI * 2);
    const swing = phase > 0.16 && phase < 0.66;
    const swingT = swing ? (phase - 0.16) / 0.5 : 0;
    const lift = swing ? Math.sin(swingT * Math.PI) * p.lift : 0;
    const knee = swing ? Math.sin(swingT * Math.PI) * p.lift * 0.9 : 0;
    const armWave = -wave;

    return {
      hipX: side * wave * p.stride * 0.12,
      kneeX: side * wave * p.stride * 0.44,
      ankleX: side * wave * p.stride * 0.64,
      footX: side * wave * p.stride * 0.78,
      kneeLift: -knee,
      ankleLift: -lift,
      bodyBob: -Math.abs(Math.sin(phase * Math.PI * 2)) * p.bob,
      armElbowX: (mode === 'run' ? 22 : 14) + Math.abs(armWave) * 3,
      armElbowY: (mode === 'run' ? 25 : 40) + armWave * (mode === 'run' ? 9 : 4),
      armHandX: (mode === 'run' ? 16 : 10) + Math.abs(armWave) * 2,
      armHandY: (mode === 'run' ? 18 : 30) - armWave * (mode === 'run' ? 12 : 5),
      torsoLean: armWave * (mode === 'run' ? 1.1 : 0.5)
    };
  }
}