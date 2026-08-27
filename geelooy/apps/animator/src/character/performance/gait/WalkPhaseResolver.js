// B"H

/**
 * @file WalkPhaseResolver.js
 * @description
 * Smooth planted walk phases. The old phase table snapped legs between poses;
 * this one eases contact, passing, lift, and roll so motion reads calmer.
 */
export class WalkPhaseResolver {
  /** @param {number} phase @returns {Object} Phase information. */
  static resolve(phase) {
    const p = ((phase % 1) + 1) % 1;
    const s = this.smooth;

    if (p < 0.34) {
      const q = s(p / 0.34);
      return { name: 'plant', planted: true, lift: 0, forward: this.lerp(0.88, 0.18, q), bend: this.lerp(0.12, 0.32, q), roll: this.lerp(-0.12, -0.02, q) };
    }

    if (p < 0.58) {
      const q = s((p - 0.34) / 0.24);
      return { name: 'passing', planted: false, lift: this.lerp(-2, -9, q), forward: this.lerp(0.18, -0.18, q), bend: this.lerp(0.32, 0.54, q), roll: this.lerp(-0.02, 0.04, q) };
    }

    if (p < 0.78) {
      const q = s((p - 0.58) / 0.2);
      return { name: 'swing', planted: false, lift: this.lerp(-9, -5, q), forward: this.lerp(-0.18, -0.72, q), bend: this.lerp(0.54, 0.34, q), roll: this.lerp(0.04, 0.16, q) };
    }

    const q = s((p - 0.78) / 0.22);
    return { name: 'settle', planted: true, lift: 0, forward: this.lerp(-0.72, -0.88, q), bend: this.lerp(0.34, 0.14, q), roll: this.lerp(0.16, 0.08, q) };
  }

  static smooth(x) { return x * x * (3 - 2 * x); }
  static lerp(a, b, t) { return a + (b - a) * t; }
}
