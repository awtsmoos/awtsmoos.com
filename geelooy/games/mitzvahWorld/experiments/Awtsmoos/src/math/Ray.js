// B"H
import { Vec3 } from './Vec3.js';

/** Ray: a question traveling through Eretz until an obstacle answers. */
export class Ray {
  constructor(origin = new Vec3(), direction = new Vec3(0, 0, 1)) { this.origin = Vec3.from(origin); this.direction = Vec3.from(direction).normalize(); }
  at(distance) { return this.origin.clone().add(this.direction.clone().scale(distance)); }
}
