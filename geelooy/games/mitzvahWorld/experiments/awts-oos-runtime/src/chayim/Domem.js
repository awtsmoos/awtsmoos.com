// B"H
import { Vec3 } from '../math/Vec3.js';
import { Aabb } from '../math/Aabb.js';

/** Domem: stillness, the first vessel in the scratch chayim chain. */
export class Domem {
  constructor({ id, name, position, size, color, solid = false } = {}) {
    this.id = id || `domem_${Math.random().toString(36).slice(2)}`;
    this.name = name || this.id;
    this.type = 'domem';
    this.position = Vec3.from(position);
    this.size = Vec3.from(size || { x: 1, y: 1, z: 1 });
    this.color = color || '#5f6d7a';
    this.solid = solid;
  }
  get aabb() { return Aabb.centerSize(this.position, this.size); }
  heesHawvoos() {}
  toRenderState() { return { id: this.id, name: this.name, type: this.type, position: this.position.toJSON(), size: this.size.toJSON(), color: this.color, solid: this.solid }; }
}
