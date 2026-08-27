// B"H
export class MicroExpressionSystem {
  static getBias(time, intensity) {
    return Math.sin(time * 0.0005) * intensity;
  }
}
