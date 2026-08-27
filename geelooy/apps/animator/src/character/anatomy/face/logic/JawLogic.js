// B"H
export class JawLogic {
  static calculate(intensity) {
    return Math.max(0, intensity * 0.8 + (Math.random() - 0.5) * 0.1);
  }
}
