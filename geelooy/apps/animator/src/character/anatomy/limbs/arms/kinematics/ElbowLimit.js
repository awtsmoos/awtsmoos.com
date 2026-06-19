// B"H
export class ElbowLimit {
  static apply(angle) {
    const min = 0;
    const max = Math.PI * 0.8;
    return Math.max(min, Math.min(max, angle));
  }
}
