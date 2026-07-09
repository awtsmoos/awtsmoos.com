// B"H
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
const V1 = new THREE.Vector3(), V2 = new THREE.Vector3(), V3 = new THREE.Vector3();
const P1 = new THREE.Vector3(), P2 = new THREE.Vector3(), T1 = new THREE.Vector3(), T2 = new THREE.Vector3(), T3 = new THREE.Vector3();
const PLANE = new THREE.Plane(), LINE1 = new THREE.Line3(), LINE2 = new THREE.Line3(), BOX = new THREE.Box3(), RAY = new THREE.Ray();
const EPS = 1e-10;
function closestLines(line1, line2, target1, target2) {
  const r = T1.copy(line1.end).sub(line1.start), s = T2.copy(line2.end).sub(line2.start), w = T3.copy(line2.start).sub(line1.start);
  const a = r.dot(s), b = r.dot(r), c = s.dot(s), d = s.dot(w), e = r.dot(w), div = b * c - a * a;
  let t1, t2;
  if (Math.abs(div) < EPS) { const d1 = -d / c, d2 = (a - d) / c; if (Math.abs(d1 - .5) < Math.abs(d2 - .5)) { t1 = 0; t2 = d1; } else { t1 = 1; t2 = d2; } }
  else { t1 = (d * a + e * c) / div; t2 = (t1 * a - d) / c; }
  target1.copy(r).multiplyScalar(Math.max(0, Math.min(1, t1))).add(line1.start);
  target2.copy(s).multiplyScalar(Math.max(0, Math.min(1, t2))).add(line2.start);
}
function capsuleBox(capsule, target = BOX) {
  const r = capsule.radius || 0;
  target.min.set(Math.min(capsule.start.x, capsule.end.x) - r, Math.min(capsule.start.y, capsule.end.y) - r, Math.min(capsule.start.z, capsule.end.z) - r);
  target.max.set(Math.max(capsule.start.x, capsule.end.x) + r, Math.max(capsule.start.y, capsule.end.y) + r, Math.max(capsule.start.z, capsule.end.z) + r);
  return target;
}
function capsuleCenter(capsule, target = V1) { return target.copy(capsule.start).add(capsule.end).multiplyScalar(.5); }
class Node {
  constructor(box = null, level = 0) { this.box = box || new THREE.Box3(); this.level = level; this.triangles = []; this.subTrees = []; }
  split(maxLevel, perLeaf) {
    if (this.triangles.length <= perLeaf || this.level >= maxLevel) return;
    const half = this.box.getSize(V1).multiplyScalar(.5), subs = [];
    for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) for (let z = 0; z < 2; z++) {
      const min = new THREE.Vector3(this.box.min.x + x * half.x, this.box.min.y + y * half.y, this.box.min.z + z * half.z);
      subs.push(new Node(new THREE.Box3(min, min.clone().add(half)), this.level + 1));
    }
    for (const tri of this.triangles) for (const sub of subs) if (sub.box.intersectsTriangle(tri)) sub.triangles.push(tri);
    this.triangles.length = 0;
    for (const sub of subs) { if (!sub.triangles.length) continue; sub.split(maxLevel, perLeaf); this.subTrees.push(sub); }
  }
  rayTriangles(ray, out, seen) { for (const sub of this.subTrees) { if (!ray.intersectsBox(sub.box)) continue; if (sub.subTrees.length) sub.rayTriangles(ray, out, seen); else for (const t of sub.triangles) if (!seen.has(t)) { seen.add(t); out.push(t); } } }
  boxTriangles(box, out, seen) { for (const sub of this.subTrees) { if (!box.intersectsBox(sub.box)) continue; if (sub.subTrees.length) sub.boxTriangles(box, out, seen); else for (const t of sub.triangles) if (!seen.has(t)) { seen.add(t); out.push(t); } } }
}
function triangleCapsuleIntersect(capsule, triangle) {
  triangle.getPlane(PLANE); const d1 = PLANE.distanceToPoint(capsule.start) - capsule.radius, d2 = PLANE.distanceToPoint(capsule.end) - capsule.radius;
  if ((d1 > 0 && d2 > 0) || (d1 < -capsule.radius && d2 < -capsule.radius)) return false;
  const ip = V1.copy(capsule.start).lerp(capsule.end, Math.abs(d1 / (Math.abs(d1) + Math.abs(d2))));
  if (triangle.containsPoint(ip)) return { normal:PLANE.normal.clone(), point:ip.clone(), depth:Math.abs(Math.min(d1, d2)) };
  const l1 = LINE1.set(capsule.start, capsule.end);
  for (const edge of [[triangle.a, triangle.b], [triangle.b, triangle.c], [triangle.c, triangle.a]]) {
    closestLines(l1, LINE2.set(edge[0], edge[1]), P1, P2); const d = P1.distanceTo(P2);
    if (d < capsule.radius) return { normal:P1.clone().sub(P2).normalize(), point:P2.clone(), depth:capsule.radius - d };
  }
  return false;
}
export default class TerrainOctreeWorld {
  constructor(options = {}) { this.triangles = []; this.root = null; this.bounds = new THREE.Box3(); this.maxLevel = options.maxLevel || 10; this.trianglesPerLeaf = options.trianglesPerLeaf || 12; this.version = 0; this.stats = { builds:0, triangles:0, rayQueries:0, capsuleQueries:0, candidates:0, hits:0 }; }
  clear() { this.triangles.length = 0; this.root = null; this.bounds.makeEmpty(); this.version++; return this; }
  addMesh(mesh) {
    if (!mesh?.geometry?.attributes?.position) return 0; mesh.updateWorldMatrix?.(true, false); const g = mesh.geometry, pos = g.attributes.position, idx = g.index?.array; let count = 0;
    const add = (ia, ib, ic) => { const a = new THREE.Vector3().fromBufferAttribute(pos, ia).applyMatrix4(mesh.matrixWorld), b = new THREE.Vector3().fromBufferAttribute(pos, ib).applyMatrix4(mesh.matrixWorld), c = new THREE.Vector3().fromBufferAttribute(pos, ic).applyMatrix4(mesh.matrixWorld); const tri = new THREE.Triangle(a, b, c); tri.__mesh = mesh; this.triangles.push(tri); this.bounds.expandByPoint(a).expandByPoint(b).expandByPoint(c); count++; };
    if (idx) for (let i = 0; i < idx.length; i += 3) add(idx[i], idx[i + 1], idx[i + 2]); else for (let i = 0; i < pos.count; i += 3) add(i, i + 1, i + 2);
    return count;
  }
  build(meshes = []) { this.clear(); for (const mesh of meshes) this.addMesh(mesh); if (!this.triangles.length) return this; this.bounds.min.addScalar(-.01); this.bounds.max.addScalar(.01); this.root = new Node(this.bounds.clone(), 0); this.root.triangles = this.triangles.slice(); this.root.split(this.maxLevel, this.trianglesPerLeaf); this.stats.builds++; this.stats.triangles = this.triangles.length; return this; }
  rayTriangles(ray) { const out = []; if (!this.root) return out; this.root.rayTriangles(ray, out, new Set()); this.stats.rayQueries++; this.stats.candidates += out.length; return out; }
  boxTriangles(box) { const out = []; if (!this.root) return out; this.root.boxTriangles(box, out, new Set()); this.stats.candidates += out.length; return out; }
  rayGroundAt(x, z, high = 220, low = -80) { RAY.origin.set(Number(x) || 0, high, Number(z) || 0); RAY.direction.set(0, -1, 0); let best = null, bestD = Infinity; for (const tri of this.rayTriangles(RAY)) { const p = RAY.intersectTriangle(tri.a, tri.b, tri.c, false, V2); if (!p || p.y > high || p.y < low) continue; const d = high - p.y; if (d < bestD) { bestD = d; best = { y:p.y, point:p.clone(), triangle:tri, normal:tri.getNormal(new THREE.Vector3()), distance:d, object:tri.__mesh || null }; } } if (best) this.stats.hits++; return best; }
  capsuleIntersect(capsule) { const tris = this.boxTriangles(capsuleBox(capsule)); this.stats.capsuleQueries++; let hit = false, work = { start:capsule.start.clone(), end:capsule.end.clone(), radius:capsule.radius }, last = null; for (const tri of tris) { const r = triangleCapsuleIntersect(work, tri); if (!r) continue; hit = true; last = r; const push = r.normal.clone().multiplyScalar(r.depth); work.start.add(push); work.end.add(push); } if (!hit) return false; const before = capsuleCenter(capsule, V2), after = capsuleCenter(work, V3), delta = after.sub(before); return { normal:delta.clone().normalize(), depth:delta.length(), point:last?.point || after.clone(), adjusted:work }; }
  diag() { return { ...this.stats, hasRoot:Boolean(this.root), bounds:this.root ? { min:this.bounds.min.toArray(), max:this.bounds.max.toArray() } : null, maxLevel:this.maxLevel, trianglesPerLeaf:this.trianglesPerLeaf }; }
}
export { TerrainOctreeWorld };
