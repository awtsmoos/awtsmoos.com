// B"H

/**
 * @file GaitClock.js
 * @description
 * Chapter: The footsteps stopped being tied to wall-clock chaos.
 * Walk cycles are now driven by actual travel progress when available. A walker
 * crossing the frame advances through readable planted poses instead of skating,
 * freezing, or vibrating because real milliseconds and cinematic milliseconds
 * disagreed.
 */
export class GaitClock {
  /**
   * Samples a stable gait phase.
   *
   * @param {number} time - Render time.
   * @param {Object} state - Performance state.
   * @param {Object} data - Character data.
   * @returns {{phase:number,left:number,right:number}} Clock data.
   */
  static sample(time, state = {}, data = {}) {
    const type = state.locomotion?.type || data.locomotion || 'idle';
    const seeded = this.seed(data);
    const progressDriven = this.progressDriven(type, data);
    const phase = this.normalize(progressDriven + seeded + this.idleDrift(time, type));
    return {
      phase,
      left: phase,
      right: this.normalize(phase + 0.5)
    };
  }

  /** @param {Object} data - Character data. @returns {number} */
  static seed(data = {}) {
    return Number(data._index || 0) * 0.137;
  }

  /** @param {string} type @param {Object} data @returns {number} */
  static progressDriven(type, data = {}) {
    if (data.motionMode === 'worldTravel') {
      const progress = Number(data._travelProgress || 0);
      const loops = type === 'run' ? 2.8 : 1.6;
      return progress * loops;
    }

    const speed = this.speedFor(type, data);
    return Number(data.directorTime || 0) * speed;
  }

  /** @param {number} time @param {string} type @returns {number} */
  static idleDrift(time, type) {
    if (type === 'idle') return Math.sin(Number(time || 0) * 0.00012) * 0.02;
    return 0;
  }

  /** @param {number} value @returns {number} */
  static normalize(value) {
    const mod = value % 1;
    return mod < 0 ? mod + 1 : mod;
  }

  /** @param {string} type @param {Object} data @returns {number} */
  static speedFor(type, data = {}) {
    if (type === 'run') return 0.00105;
    if (data.motionMode === 'worldTravel') return 0.00036;
    if (type === 'walk') return 0.00048;
    return 0.00018;
  }
}
