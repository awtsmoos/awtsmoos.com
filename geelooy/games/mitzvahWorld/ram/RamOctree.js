// B"H
export class RamOctree {
  constructor(THREE) {
    this.THREE = THREE;
    this.items = [];
    this.raycaster = new THREE.Raycaster();
  }
  addVisibleMesh(mesh) {
    mesh.updateMatrixWorld(true);
    const box = new this.THREE.Box3().setFromObject(mesh);
    this.items.push({ mesh, box });
    mesh.userData.realOctreeObstacle = true;
    return mesh;
  }
  resolveSphere(pos, radius) {
    const p = pos.clone();
    for (const item of this.items) {
      const b = item.box;
      const closest = p.clone().clamp(b.min, b.max);
      const delta = p.clone().sub(closest);
      const d = delta.length();
      if (d > 0 && d < radius) p.add(delta.multiplyScalar((radius - d) / d));
      if (d === 0 && p.y < b.max.y + radius && p.y > b.min.y - radius) p.y = b.max.y + radius;
    }
    return p;
  }
  groundY(x, z, fallback = 0) {
    let y = fallback;
    for (const item of this.items) {
      const b = item.box;
      if (x >= b.min.x && x <= b.max.x && z >= b.min.z && z <= b.max.z) y = Math.max(y, b.max.y);
    }
    return y;
  }
  rayGround(x, z, fallback = 0) { return this.groundY(x, z, fallback); }
  raycastSegment(from, to, radius = 0.28) {
    const dir = to.clone().sub(from);
    const length = dir.length();
    if (!Number.isFinite(length) || length <= 0.001) return null;
    dir.multiplyScalar(1 / length);
    this.raycaster.set(from, dir);
    this.raycaster.near = 0;
    this.raycaster.far = length;
    let best = null;
    for (const item of this.items) {
      const box = item.box.clone().expandByScalar(radius);
      const point = this.raycaster.ray.intersectBox(box, new this.THREE.Vector3());
      if (!point) continue;
      const distance = from.distanceTo(point);
      if (!best || distance < best.distance) best = { point, distance, mesh:item.mesh, box:item.box };
    }
    return best;
  }
  resolveCamera(target, desired, clearance = 0.42) {
    const hit = this.raycastSegment(target, desired, clearance);
    const dir = desired.clone().sub(target).normalize();
    const out = hit ? hit.point.clone().addScaledVector(dir, -clearance * 1.5) : desired.clone();
    const ground = this.groundY(out.x, out.z, 0) + clearance;
    if (out.y < ground) out.y = ground;
    return out;
  }
}
