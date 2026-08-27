
// B"H
export class GridSnap {
  static findNearest(ms, gridIntervalMs = 1000) {
    const remainder = ms % gridIntervalMs;
    if (remainder < gridIntervalMs / 2) {
      return ms - remainder;
    } else {
      return ms + (gridIntervalMs - remainder);
    }
  }
}
