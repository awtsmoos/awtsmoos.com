
/* B”H */
export class KeyframeEngine {
  static interpolate(startVal, endVal, t) {
    // Divine Quadratic Easing
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    return startVal + (endVal - startVal) * ease;
  }
}
