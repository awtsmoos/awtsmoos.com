// B"H

/** Keeps the camera from devouring faces or chopping bodies. */
export class CompositionRules {
  static clampCamera(camera = {}) {
    return {
      ...camera,
      x: this.num(camera.x, 0),
      y: this.num(camera.y, 130),
      zoom: Math.max(0.48, Math.min(1.05, this.num(camera.zoom, 0.72)))
    };
  }

  static num(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
}
