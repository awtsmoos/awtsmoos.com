// B"H
import { Ray } from '../math/Ray.js';
import { normalize, v } from '../math/Geometry3D.js';

/** WorldGround: exact floors from triangle rays, including sloped tests and stairs. */
export class WorldGround {
  constructor({ terrainHeightAt, octree, top = 42 }) { Object.assign(this, { terrainHeightAt, octree, top }); }
  sample(x, z) {
    const terrain = { height: this.terrainHeightAt(x, z), normal: this.terrainNormal(x, z), kind: 'terrain' };
    const hit = this.octree?.raycast(new Ray({ x, y: this.top, z }, { x: 0, y: -1, z: 0 }), this.top + 20, floorOnly);
    return hit && hit.point.y >= terrain.height ? { height: hit.point.y, normal: hit.item.normal, kind: hit.item.kind } : terrain;
  }
  heightAt(x, z) { return this.sample(x, z).height; }
  isGrounded(position, footOffset = 0, epsilon = 0.055) { return position.y <= this.heightAt(position.x, position.z) + footOffset + epsilon; }
  terrainNormal(x, z) { const e = .08, h = this.terrainHeightAt; return normalize(v(h(x-e,z)-h(x+e,z), 2*e, h(x,z-e)-h(x,z+e))); }
}
function floorOnly(item) { return item.solid && item.floor && item.normal?.y > .24; }
