// B"H
/** Deterministic sampled path between authored points. */
export class LinearPath {
  constructor(points = []) { this.points = points; }
  sample(t = 0) {
    if (this.points.length < 2) return this.points[0] || { x: 0, y: 0 };
    const a = this.points[0], b = this.points[this.points.length - 1], u = Math.max(0, Math.min(1, t));
    return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
  }
}
