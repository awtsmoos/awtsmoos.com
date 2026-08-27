// B"H
/** Authored path: explicit points for repeated placement and motion. */
export class Path {
  constructor({ id, points = [] } = {}) { this.kind = 'path'; this.id = id; this.points = points; }
  toJSON() { return { ...this }; }
}
