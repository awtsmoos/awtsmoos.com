// B"H
export class ShoulderConstraint {
  static apply(angle) {
    const min = -Math.PI / 2;
    const max = Math.PI / 2;
    return Math.max(min, Math.min(max, angle));
  }
}
