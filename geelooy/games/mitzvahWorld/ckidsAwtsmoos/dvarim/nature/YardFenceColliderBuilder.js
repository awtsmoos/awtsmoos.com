// B"H
/** @file YardFenceColliderBuilder.js @description Exact box bodies from parcel fence segments, with gate gaps removed. */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { markCollider, COLLISION_POLICY } from "../../systems/collision/CollisionTruthContract.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { segmentLength, segmentYaw, segmentCenter, splitSegmentForGap } from "./FenceGapMath.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const hidden = () => new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0 });
function makeBody(segment, suffix, start, end) {
  const length = segmentLength(start, end); if (length <= 0.05) return null;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(segment.thickness || 0.28, segment.height || 1.25, length), hidden());
  const c = segmentCenter(start, end); mesh.name = `${segment.id}_${suffix}`;
  mesh.position.set(c.x, (segment.height || 1.25) / 2, c.z); mesh.rotation.y = segmentYaw(start, end);
  return markCollider(mesh, COLLISION_POLICY.authoredCollider, { fenceSegmentId: segment.id, visualTwin: `${segment.id}_visual`, parcelId: segment.parcelId || null, gateGap: Boolean(segment.gap) });
}
export function fenceColliderBodies(segment = {}) { return splitSegmentForGap(segment).map((pair, i) => makeBody(segment, `collider_${i + 1}`, pair[0], pair[1])).filter(Boolean); }
export function fenceColliderManifest(segments = []) { return segments.flatMap(fenceColliderBodies); }
export default { fenceColliderBodies, fenceColliderManifest };
