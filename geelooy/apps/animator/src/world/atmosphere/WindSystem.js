// B"H
export class WindSystem {
  static calculate(x, y, time, baseSpeed) {
    return Math.sin(time * 0.001 + x * 0.01) * baseSpeed;
  }
}
