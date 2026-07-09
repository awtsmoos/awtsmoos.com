// B"H
import { Tzomayach } from './Tzomayach.js';
import { Vec3 } from '../math/Vec3.js';

/** Chai: the living mover, carrying velocity through the octree-tested world. */
export class Chai extends Tzomayach {
  constructor(options = {}) { super(options); this.type = 'chai'; this.velocity = new Vec3(); this.speed = options.speed || 4; }
  toRenderState() { return { ...super.toRenderState(), velocity: this.velocity.toJSON(), speed: this.speed }; }
}
