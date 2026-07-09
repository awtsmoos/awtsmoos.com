// B"H
/** @file RegionParcelRenderer.js @description Renders parcel fences, gates, and garden markers without visual rails crossing gate gaps. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { groundY } from "./RegionGround.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { sealRegionVisual } from "./RegionSeal.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { splitSegmentForGap } from "../../../../../dvarim/nature/FenceGapMath.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
function houses(report) { return Array.isArray(report?.houses) ? report.houses : []; }
function parcels(report) { const h = houses(report); return Array.isArray(h.parcels) ? h.parcels : h.map(x => x.parcel).filter(Boolean); }
function mat(color) { return new THREE.MeshStandardMaterial({ color, roughness:0.85 }); }
function railMesh(olam, s, a, b, material, index) {
  const length = Math.hypot((b.x || 0) - (a.x || 0), (b.z || 0) - (a.z || 0)); if (length <= 0.05) return null;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, length), material);
  const x = ((a.x || 0) + (b.x || 0)) / 2, z = ((a.z || 0) + (b.z || 0)) / 2;
  mesh.name = `${s.id}_visible_yard_rail_${index}`; mesh.position.set(x, groundY(olam, x, z) + 0.7, z);
  mesh.rotation.y = Math.atan2((b.x || 0) - (a.x || 0), (b.z || 0) - (a.z || 0));
  Object.assign(mesh.userData ||= {}, { visualOnlyFence:true, skipOctree:true, noOctree:true, isSolid:false, parcelId:s.parcelId || null, gateGapRespected:Boolean(s.gap) });
  return mesh;
}
function segmentMeshes(olam, s, material) { return splitSegmentForGap(s).map((pair, i) => railMesh(olam, s, pair[0], pair[1], material, i + 1)).filter(Boolean); }
function gateMesh(olam, g, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(g.width || 2.4, g.height || 1.25, 0.16), material);
  mesh.name = `${g.id}_visible_lockable_gate`; mesh.position.set(g.x || 0, groundY(olam, g.x || 0, g.z || 0) + (g.height || 1.25) / 2, g.z || 0); mesh.rotation.y = g.yaw || 0;
  Object.assign(mesh.userData ||= {}, { visualOnlyGate:true, skipOctree:true, noOctree:true, isSolid:false, lockable:true, lockId:g.lockId, keyId:g.keyId }); return mesh;
}
function bedMesh(olam, bed, material) { const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 2.0), material); mesh.name = `${bed.id}_garden_bed_marker`; mesh.position.set(bed.x || 0, groundY(olam, bed.x || 0, bed.z || 0) + 0.04, bed.z || 0); Object.assign(mesh.userData ||= {}, { visualOnlyGardenBed:true, skipOctree:true, noOctree:true, isSolid:false, crop:bed.crop }); return mesh; }
export function buildParcelRenderer(olam, report = {}) {
  const root = new THREE.Group(); root.name = "living_region_parcel_fences_gates_and_gardens";
  const fenceMat = mat(0x6b431f), gateMat = mat(0x7a4a23), bedMat = mat(0x5f3b1b); let fenceSegments = 0, visualRails = 0, gates = 0, beds = 0;
  for (const p of parcels(report)) {
    for (const f of p.fences || []) { const rails = segmentMeshes(olam, { ...f, parcelId:p.id }, fenceMat); rails.forEach(r => root.add(r)); fenceSegments++; visualRails += rails.length; }
    if (p.gate) { root.add(gateMesh(olam, p.gate, gateMat)); gates++; }
    for (const bed of p.garden?.beds || []) { root.add(bedMesh(olam, bed, bedMat)); beds++; }
  }
  root.userData.stats = { parcelFences:fenceSegments, parcelFenceVisualRails:visualRails, parcelGates:gates, parcelGardenBeds:beds, gateGapsRespected:true };
  return sealRegionVisual(root, { parcelRenderer:true, visualOnly:true, gateGapsRespected:true });
}
export default { buildParcelRenderer };
