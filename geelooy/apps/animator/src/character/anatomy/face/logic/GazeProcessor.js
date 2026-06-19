// B"H
export class GazeProcessor {
  static calculate(time) {
    return {
      x: Math.sin(time * 0.0005) * 5,
      y: Math.cos(time * 0.0007) * 3
    };
  }
}
