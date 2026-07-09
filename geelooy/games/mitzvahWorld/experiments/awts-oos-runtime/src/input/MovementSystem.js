// B"H
import { Aabb } from '../math/Aabb.js';

/** MovementSystem: joystick and keys move while the octree refuses lies. */
export class MovementSystem {
  constructor({ actor, input, joystick, octree }) { Object.assign(this, { actor, input, joystick, octree }); }
  update(dt) { const a = this.input.axis(), j = this.joystick?.vector || { x: 0, y: 0, magnitude: 0 }; const x = a.x + j.x * j.magnitude, z = a.y + j.y * j.magnitude; const len = Math.hypot(x, z) || 1; const speed = this.actor.speed * dt; this.tryMove(x / len * speed, 0); this.tryMove(0, z / len * speed); if (Math.abs(x) + Math.abs(z) > 0.01) this.actor.facing = Math.atan2(x, z); }
  tryMove(dx, dz) { const p = this.actor.position.clone(); p.x += dx; p.z += dz; const box = Aabb.centerSize(p, this.actor.size); if (!this.octree.query(box).some((o) => o.solid)) this.actor.position.copy(p); }
}
