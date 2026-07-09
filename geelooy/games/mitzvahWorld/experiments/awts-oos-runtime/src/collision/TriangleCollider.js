// B"H
import { Aabb } from '../math/Aabb.js';
import { minMax, triangleNormal } from '../math/Geometry3D.js';

/** TriangleCollider: every face becomes a speaking wall/floor normal. */
export class TriangleCollider {
  constructor(a, b, c, options = {}) {
    this.a = a; this.b = b; this.c = c;
    this.normal = options.normal || triangleNormal(a, b, c);
    this.kind = options.kind || 'triangle';
    this.solid = options.solid !== false;
    this.floor = options.floor ?? this.normal.y > 0.45;
    const box = minMax([a, b, c]);
    this.aabb = new Aabb(box.min, box.max).expanded?.(0.03) || new Aabb(box.min, box.max);
  }
}

export function trianglesFromIndexed(vertices, indices, options = {}) {
  const out = [];
  for (let i = 0; i < indices.length; i += 3) out.push(new TriangleCollider(vertices[indices[i]], vertices[indices[i + 1]], vertices[indices[i + 2]], options));
  return out;
}
