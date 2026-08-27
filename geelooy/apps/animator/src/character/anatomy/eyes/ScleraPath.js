
/**
 * @file ScleraPath.js
 * @description
 * THE CANVAS OF SIGHT.
 * Generates the pure geometric boundary of the eye.
 * B"H
 */
export class ScleraPath {
  static get(w, h) {
    // A perfect oval utilizing 4 bezier curves for an organic almond shape
    return [
      { type: 'move', x: -w, y: 0 },
      { type: 'bezier', c1x: -w, c1y: -h*1.2, c2x: w, c2y: -h*1.2, x: w, y: 0 },
      { type: 'bezier', c1x: w, c1y: h*1.2, c2x: -w, c2y: h*1.2, x: -w, y: 0 }
    ];
  }
}
