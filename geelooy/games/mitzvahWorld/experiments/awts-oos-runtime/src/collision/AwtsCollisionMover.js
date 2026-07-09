// B"H
import { Aabb } from '../math/Aabb.js';
import { capsuleTriangleContact } from './CapsuleTriangle.js';

/** Capsule mover: wall slide plus step-lip forgiveness for platforms and stairs. */
export class AwtsCollisionMover {
  constructor({ octree, radius = .38, height = 1.72, footOffset = 0 }) { Object.assign(this, { octree, radius, height, footOffset, lastContacts: [], lastNormals: [] }); }
  move(position, delta, options = {}) {
    const steps = Math.max(1, Math.ceil(Math.hypot(delta.x, delta.z) / .06)); this.lastContacts = []; this.lastNormals = [];
    for (let i = 0; i < steps; i++) { position.x += delta.x / steps; position.z += delta.z / steps; this.solve(position, options); }
    return { contacts: this.lastContacts.length, normals: this.lastNormals };
  }
  solve(position, options) {
    for (let pass = 0; pass < 7; pass++) { const contact = this.deepestContact(this.capsule(position), options); if (!contact) return; const n = contact.normal; position.x += n.x * contact.depth; position.z += n.z * contact.depth; this.lastContacts.push(contact.kind); this.lastNormals.push({ x:n.x, y:n.y, z:n.z, depth:contact.depth }); }
  }
  deepestContact(capsule, options) {
    let best = null;
    for (const tri of this.octree.query(this.capsuleAabb(capsule))) {
      if (!this.isBlockingWall(tri, capsule, options)) continue;
      const hit = capsuleTriangleContact(capsule, tri); if (!hit || Math.abs(hit.normal.y) > .72) continue;
      if (!best || hit.depth > best.depth) best = hit;
    }
    return best;
  }
  isBlockingWall(tri, capsule, options) {
    if (!tri.solid || tri.floor || Math.abs(tri.normal.y) > .72) return false;
    const stepTop = (options.floorY ?? (capsule.start.y - .25)) + (options.maxStepHeight ?? 0);
    if (options.grounded && tri.aabb?.max?.y <= stepTop + .045) return false;
    return true;
  }
  capsule(position) { const base = position.y - this.footOffset; return { radius:this.radius, start:{ x:position.x, y:base+.25, z:position.z }, end:{ x:position.x, y:base+this.height, z:position.z } }; }
  capsuleAabb(c) { const r = this.radius + .04; return new Aabb({ x:c.start.x-r, y:Math.min(c.start.y,c.end.y)-r, z:c.start.z-r }, { x:c.start.x+r, y:Math.max(c.start.y,c.end.y)+r, z:c.start.z+r }); }
}
