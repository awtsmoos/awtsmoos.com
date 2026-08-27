// B"H
export class ClothingSway {
  static getOffset(time, windIntensity) {
    return Math.sin(time * 0.003) * windIntensity * 2;
  }
}
