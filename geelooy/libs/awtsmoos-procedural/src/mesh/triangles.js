// B"H
import { cross, normalize, sub } from '../math/vec3.js';

/**
 * B"H
 * Chapter 3: Indexed sparks become triangle breath for WebGL.
 * Each output vertex is `[x,y,z,nx,ny,nz]`, with finite flat normals.
 */
export function meshToTriangles(mesh) {
  const data = [];
  const positions = mesh?.positions || [];
  const indices = mesh?.indices || [];
  for (let i = 0; i < indices.length; i += 3) {
    const a = readPoint(positions, indices[i]);
    const b = readPoint(positions, indices[i + 1]);
    const c = readPoint(positions, indices[i + 2]);
    if (!a || !b || !c) continue;
    const normal = faceNormal(a, b, c);
    pushVertex(data, a, normal);
    pushVertex(data, b, normal);
    pushVertex(data, c, normal);
  }
  return new Float32Array(data);
}

export function triangleStats(data) {
  return {
    floats: data.length,
    vertices: data.length / 6,
    triangles: data.length / 18,
    finite: Array.from(data).every(Number.isFinite)
  };
}

function readPoint(positions, index) {
  const i = index * 3;
  const point = [positions[i], positions[i + 1], positions[i + 2]];
  return point.every(Number.isFinite) ? point : null;
}

function faceNormal(a, b, c) {
  const n = normalize(cross(sub(b, a), sub(c, a)));
  return n.every(Number.isFinite) && Math.hypot(...n) > 0.0001 ? n : [0, 1, 0];
}

function pushVertex(out, point, normal) {
  out.push(point[0], point[1], point[2], normal[0], normal[1], normal[2]);
}
