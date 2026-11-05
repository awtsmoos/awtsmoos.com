// B"H
import { add, closestPointsSegmentSegment, dot, length, negate, normalize, planeDistance, projectToPlane, scale, sub, triangleContainsPoint } from '../math/Geometry3D.js';

/** Capsule-triangle contact: copied as an idea from Octree.js, reborn raw. */
export function capsuleTriangleContact(capsule, tri) {
  const center = scale(add(capsule.start, capsule.end), 0.5);
  const facingNormal = dot(sub(center, tri.a), tri.normal) < 0 ? negate(tri.normal) : tri.normal;
  const planeHit = planeContact(capsule, tri, facingNormal);
  let best = planeHit;
  for (const [a, b] of [[tri.a, tri.b], [tri.b, tri.c], [tri.c, tri.a]]) best = deeper(best, edgeContact(capsule, tri, a, b, facingNormal));
  return best;
}

function planeContact(capsule, tri, normal) {
  const d1 = dot(sub(capsule.start, tri.a), normal);
  const d2 = dot(sub(capsule.end, tri.a), normal);
  const nearest = Math.abs(d1) < Math.abs(d2) ? capsule.start : capsule.end;
  const dist = Math.abs(Math.abs(d1) < Math.abs(d2) ? d1 : d2);
  if (dist >= capsule.radius) return null;
  const projected = projectToPlane(nearest, { ...tri, normal });
  if (!triangleContainsPoint(projected, tri)) return null;
  return { normal, depth: capsule.radius - dist + 0.002, kind: tri.kind, point: projected };
}

function edgeContact(capsule, tri, a, b, fallbackNormal) {
  const [p1, p2] = closestPointsSegmentSegment(capsule.start, capsule.end, a, b);
  const delta = sub(p1, p2), dist = length(delta);
  if (dist >= capsule.radius) return null;
  const normal = dist > 0.00001 ? normalize(delta) : fallbackNormal;
  return { normal, depth: capsule.radius - dist + 0.002, kind: tri.kind, point: p2 };
}

function deeper(a, b) { if (!b) return a; if (!a || b.depth > a.depth) return b; return a; }
