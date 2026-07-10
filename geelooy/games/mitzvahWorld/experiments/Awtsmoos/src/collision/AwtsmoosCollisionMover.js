// B"H
import { Aabb } from '../math/Aabb.js';
import { capsuleTriangleContact } from './CapsuleTriangle.js';

/** Capsule mover: static octree plus optional live doors, without guessing. */
export class AwtsmoosCollisionMover {
  constructor({ octree, radius = .38, height = 1.72, footOffset = 0 }) { Object.assign(this, { octree, radius, height, footOffset, lastContacts: [], lastNormals: [], lastCeiling: null }); }
  move(position, delta, options = {}) { const steps = Math.max(1, Math.ceil(Math.hypot(delta.x, delta.z) / .055)); this.lastContacts = []; this.lastNormals = []; for (let i = 0; i < steps; i++) { position.x += delta.x / steps; position.z += delta.z / steps; this.solve(position, options); } return { contacts: this.lastContacts.length, normals: this.lastNormals }; }
  solve(position, options) { for (let pass = 0; pass < 7; pass++) { const hit = this.deepestWall(this.capsule(position), options); if (!hit) return; position.x += hit.normal.x * hit.depth; position.z += hit.normal.z * hit.depth; this.remember(hit); } }
  resolveCeiling(position, options = {}) { let pushed = 0; this.lastCeiling = null; for (let i = 0; i < 4; i++) { const hit = this.deepestCeiling(this.capsule(position), options); if (!hit) break; position.y += Math.min(-.002, hit.normal.y * hit.depth); pushed += hit.depth; this.lastCeiling = hit; } return { hit: !!this.lastCeiling, kind: this.lastCeiling?.kind || null, depth: pushed }; }
  ceilingHit(position, options = {}) { return this.deepestCeiling(this.capsule(position), options); }
  deepestWall(capsule, options) { return this.deepest(capsule, (tri, hit) => this.isBlockingWall(tri, hit, capsule, options), options); }
  deepest(capsule, accept, options = {}) { let best = null; for (const tri of this.candidates(this.capsuleAabb(capsule), options)) { const hit = capsuleTriangleContact(capsule, tri); if (!hit || !accept(tri, hit)) continue; if (!best || hit.depth > best.depth) best = hit; } return best; }
  candidates(aabb, options) { const dynamic = (options.dynamicColliders || []).filter(tri => tri.aabb?.intersects?.(aabb)); return [...this.octree.query(aabb), ...dynamic]; }
  deepestCeiling(capsule, options) { let best = null; const aabb = this.capsuleAabb(capsule), minCeilingY = capsule.end.y - .46; for (const tri of this.candidates(aabb, options)) { if (!tri.solid || tri.floor || tri.normal.y > -.18 || tri.aabb.max.y < minCeilingY) continue; const hit = capsuleTriangleContact(capsule, tri); if (!hit) continue; hit.normal = tri.normal; if (!best || hit.depth > best.depth) best = hit; } return best; }
  isBlockingWall(tri, hit, capsule, options) { const maxSlope = options.maxSlopeNormal ?? .72; if (!tri.solid) return false; if (tri.floor && tri.normal.y >= maxSlope) return false; if (tri.floor && tri.normal.y < maxSlope && options.blockSteepFloors === false) return false; if (Math.abs(hit.normal.y) > .76) return false; const stepTop = (options.floorY ?? (capsule.start.y - .25)) + (options.maxStepHeight ?? 0); if (!tri.floor && options.grounded && tri.aabb?.max?.y <= stepTop + .045) return false; return true; }
  remember(hit) { this.lastContacts.push(hit.kind); this.lastNormals.push({ x: hit.normal.x, y: hit.normal.y, z: hit.normal.z, depth: hit.depth }); }
  capsule(position) { const base = position.y - this.footOffset; return { radius: this.radius, start: { x: position.x, y: base + .25, z: position.z }, end: { x: position.x, y: base + this.height, z: position.z } }; }
  capsuleAabb(c) { const r = this.radius + .04; return new Aabb({ x: c.start.x - r, y: Math.min(c.start.y, c.end.y) - r, z: c.start.z - r }, { x: c.start.x + r, y: Math.max(c.start.y, c.end.y) + r, z: c.start.z + r }); }
}
