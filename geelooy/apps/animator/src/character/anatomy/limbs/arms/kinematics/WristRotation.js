// B"H
export class WristRotation {
  static apply(angle) {
    const min = -Math.PI / 4;
    const max = Math.PI / 4;
    return Math.max(min, Math.min(max, angle));
  }
}
