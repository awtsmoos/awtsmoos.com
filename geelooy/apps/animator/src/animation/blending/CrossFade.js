// B"H
export class CrossFade {
  static blend(a, b, weight) { return a * (1 - weight) + b * weight; }
}
