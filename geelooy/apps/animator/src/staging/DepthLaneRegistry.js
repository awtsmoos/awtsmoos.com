// B"H

/** Production 2D depth lanes: flat canvas, real staging. */
export class DepthLaneRegistry {
  static lanes = {
    wall: { z: 0, scale: 0.82, y: -120 },
    tableBack: { z: 1, scale: 0.92, y: 80 },
    food: { z: 2, scale: 1.0, y: 120 },
    actor: { z: 3, scale: 1.0, y: 205 },
    foreground: { z: 4, scale: 1.08, y: 250 },
    effects: { z: 5, scale: 1.0, y: 0 }
  };

  static get(name = 'actor') { return this.lanes[name] || this.lanes.actor; }
  static sort(a = {}, b = {}) { return this.get(a.lane).z - this.get(b.lane).z; }
}
