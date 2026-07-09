// B"H
import { Vec3 } from '../math/Vec3.js';
import { Ray } from '../math/Ray.js';

/** CameraSystem: follows the player and clips through the octree ray. */
export class CameraSystem {
  constructor({ target, octree }) { this.target = target; this.octree = octree; this.yaw = 0; this.distance = 8; this.zoom = 42; this.position = new Vec3(); }
  update(dt) { this.yaw += dt * 0.05; const t = this.target.position; const desired = new Vec3(t.x - Math.sin(this.yaw) * this.distance, 6, t.z - Math.cos(this.yaw) * this.distance); const dir = desired.clone().sub(t).normalize(); const hit = this.octree.raycast(new Ray(t, dir), this.distance, 0.4); const d = hit ? Math.max(2.5, hit.distance - 0.8) : this.distance; this.position.set(t.x + dir.x * d, 6, t.z + dir.z * d); }
  toRenderState() { return { position: this.position.toJSON(), target: this.target.position.toJSON(), zoom: this.zoom, yaw: this.yaw }; }
}
