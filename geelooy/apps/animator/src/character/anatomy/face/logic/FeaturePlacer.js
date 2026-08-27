// B"H
export class FeaturePlacer {
  static getOffset(featureId, profile) {
    const offsets = {
      eyes: { x: 0, y: -50 },
      nose: { x: 0, y: -20 },
      mouth: { x: 0, y: 10 }
    };
    return offsets[featureId] || { x: 0, y: 0 };
  }
}
