// B"H
export class TorsoContour {
  static getPoints(width, height) {
    return [
      { x: -width / 2, y: 0 },
      { x: width / 2, y: 0 },
      { x: width / 2 * 0.8, y: height },
      { x: -width / 2 * 0.8, y: height }
    ];
  }
}
