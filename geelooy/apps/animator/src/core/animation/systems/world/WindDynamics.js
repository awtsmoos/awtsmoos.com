// B"H
export class WindDynamics {
  static getIntensity(time) {
    return 0.5 + Math.sin(time * 0.0001) * 0.5;
  }
}
