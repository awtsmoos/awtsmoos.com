// B"H
export class HandNaturalPose {
  static getRotation(side, time) {
    const base = side === 'left' ? -0.2 : 0.2;
    return base + Math.sin(time * 0.001) * 0.05;
  }
}
