// B"H
import { Aabb } from '../math/Aabb.js';
import { Ray } from '../math/Ray.js';
import { normalize, rayTriangle } from '../math/Geometry3D.js';

/** Octree: triangle breath in boxes, plus filtered ray truth. */
export class AwtsOctree {
  constructor(bounds, depth = 0, maxDepth = 5) {
    Object.assign(this, { bounds, depth, maxDepth, items: [], children: null });
  }
  insert(item) {
    if (!this.bounds.intersects(item.aabb)) return false;
    if (this.depth >= this.maxDepth || this.items.length < 10) { this.items.push(item); return true; }
    this.children ||= this.split();
    for (const child of this.children) if (child.bounds.containsAabb(item.aabb)) return child.insert(item);
    this.items.push(item); return true;
  }
  query(aabb, out = []) {
    if (!this.bounds.intersects(aabb)) return out;
    for (const item of this.items) if (item.aabb.intersects(aabb)) out.push(item);
    for (const child of this.children || []) child.query(aabb, out);
    return out;
  }
  all(out = []) { out.push(...this.items); for (const child of this.children || []) child.all(out); return out; }
  raycast(ray, max = 50, predicate = () => true) {
    const r = ray instanceof Ray ? ray : new Ray(ray.origin, ray.direction);
    const direction = normalize(r.direction); let best = null;
    for (const item of this.all([])) {
      if (!item.a || !predicate(item)) continue;
      const hit = rayTriangle(r.origin, direction, item, max);
      if (hit && (!best || hit.distance < best.distance)) best = hit;
    }
    return best;
  }
  split() {
    const c = this.bounds.center(), { min, max } = this.bounds, out = [];
    for (const x of [[min.x, c.x], [c.x, max.x]]) for (const y of [[min.y, c.y], [c.y, max.y]]) for (const z of [[min.z, c.z], [c.z, max.z]]) out.push(new AwtsOctree(new Aabb({ x: x[0], y: y[0], z: z[0] }, { x: x[1], y: y[1], z: z[1] }), this.depth + 1, this.maxDepth));
    return out;
  }
}
