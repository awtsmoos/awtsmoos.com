// B"H
export class Interp {
  static lerp(a, b, t) { return a + (b - a) * t; }
  static smoothStep(t) { return t * t * (3 - 2 * t); }
}
