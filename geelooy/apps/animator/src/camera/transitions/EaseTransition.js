// B"H

/**
 * @file EaseTransition.js
 * @description
 * Chapter: The camera learned to breathe between places.
 * Position and zoom use a cinematic smoothstep, but zoom gets a tiny motivated
 * push so closeups feel intentional instead of like a late spreadsheet update.
 */
export class EaseTransition {
  /**
   * Samples a smooth transition.
   *
   * @param {Object} from - From camera.
   * @param {Object} to - To camera.
   * @param {number} t - Progress.
   * @returns {Object} Camera.
   */
  static sample(from = {}, to = {}, t = 1) {
    const e = this.ease(t);
    const push = this.pushAmount(from, to) * Math.sin(e * Math.PI);
    return {
      ...to,
      x: this.lerp(Number(from.x || 0), Number(to.x || 0), e),
      y: this.lerp(Number(from.y || -122), Number(to.y || -122), e),
      zoom: this.lerp(Number(from.zoom || 0.6), Number(to.zoom || 0.6), e) + push,
      fade: 0
    };
  }

  /** @param {Object} from @param {Object} to @returns {number} */
  static pushAmount(from = {}, to = {}) {
    const target = `${to.cameraId || ''} ${to.shot || ''} ${to.type || ''}`;
    if (/close|face|reaction/i.test(target)) return 0.06;
    if (Number(to.zoom || 0) > Number(from.zoom || 0)) return 0.025;
    return 0;
  }

  /** @param {number} t @returns {number} */
  static ease(t) {
    const x = Math.max(0, Math.min(1, Number(t) || 0));
    return x * x * x * (x * (x * 6 - 15) + 10);
  }

  /** @param {number} a @param {number} b @param {number} t @returns {number} */
  static lerp(a, b, t) {
    return a + (b - a) * t;
  }
}
