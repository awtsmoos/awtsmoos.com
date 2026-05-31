// B"H
/**
 * collisions.js
 *
 * Chapter 97: no NaN may become a wall. The Awtsmoos checks every collision
 * normal and depth before translating the player capsule, so broken decorative
 * geometry cannot create a per-frame storm of invalid movement.
 */

function finiteCollision(result) {
  return result &&
    Number.isFinite(result.depth) &&
    Number.isFinite(result.normal?.x) &&
    Number.isFinite(result.normal?.y) &&
    Number.isFinite(result.normal?.z);
}

function finiteCapsule(collider) {
  return collider?.start && collider?.end &&
    Number.isFinite(collider.start.x) && Number.isFinite(collider.start.y) && Number.isFinite(collider.start.z) &&
    Number.isFinite(collider.end.x) && Number.isFinite(collider.end.y) && Number.isFinite(collider.end.z);
}

export default {
  collisions() {
    if (!this.olam || !this.olam.worldOctree || !this.collider || !this.velocity) return;
    if (!finiteCapsule(this.collider)) return;

    const WALL_STEP_HEIGHT = 0.2;
    this.collider.start.y += WALL_STEP_HEIGHT;
    this.collider.end.y += WALL_STEP_HEIGHT;

    for (let i = 0; i < 3; i += 1) {
      const result = this.olam.worldOctree.capsuleIntersect(this.collider);
      if (!result) break;
      if (!finiteCollision(result)) break;

      const isFloor = result.normal.y >= 0.15;
      if (isFloor || result.depth < 1e-10) continue;

      const nx = result.normal.x;
      const nz = result.normal.z;
      const horizontalLenSq = nx * nx + nz * nz;
      if (!Number.isFinite(horizontalLenSq) || horizontalLenSq <= 1e-5) continue;

      const horizontalLen = Math.sqrt(horizontalLenSq);
      const dirX = nx / horizontalLen;
      const dirZ = nz / horizontalLen;
      if (!Number.isFinite(dirX) || !Number.isFinite(dirZ)) continue;

      if (!this._frameWallNormals) this._frameWallNormals = [];
      this._frameWallNormals.push({ x: dirX, z: dirZ });

      const dot = this.velocity.x * dirX + this.velocity.z * dirZ;
      if (Number.isFinite(dot) && dot < 0) {
        this.velocity.x -= dirX * dot;
        this.velocity.z -= dirZ * dot;
      }

      const push = { x: nx * result.depth, y: 0, z: nz * result.depth };
      if (Number.isFinite(push.x) && Number.isFinite(push.z)) this.collider.translate(push);
    }

    this.collider.start.y -= WALL_STEP_HEIGHT;
    this.collider.end.y -= WALL_STEP_HEIGHT;
  }
};
