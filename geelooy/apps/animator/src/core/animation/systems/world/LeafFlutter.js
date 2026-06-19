// B"H
export class LeafFlutter {
  static getAngle(time, intensity) {
    return Math.sin(time * 0.05) * intensity;
  }
}
