// B"H
export class AbdominalCurve {
  static getIntensity(breathScale) {
    return (breathScale - 1.0) * 10;
  }
}
