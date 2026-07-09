// B"H
/** @file RegionLandmarkRenderer.js @description Grounded stone circle and gold marker with fresh geometry/material vessels. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { regionGeometry } from "./RegionGeometry.js?compact=true&v=awtsmoos-geometry-20260614-bh2";
import { regionMaterial } from "./RegionMaterials.js?compact=true&v=awtsmoos-materials-20260614-bh2";
import { groundY } from "./RegionGround.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { sealRegionVisual } from "./RegionSeal.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
function landmarks(report) { return report && report.landmarks ? report.landmarks : {}; }
function add(root, olam, kind, mat, x, z, scale, yoff = 0, yaw = 0) {
  const mesh = new THREE.Mesh(regionGeometry(kind), regionMaterial(mat, { simple:false }));
  mesh.name = `landmark_${mat}_${root.children.length}`;
  mesh.position.set(x, groundY(olam, x, z) + yoff + scale[1] * .5, z);
  mesh.scale.set(scale[0], scale[1], scale[2]); mesh.rotation.y = yaw; mesh.castShadow = false; mesh.receiveShadow = false;
  root.add(mesh); return mesh;
}
export function buildLandmarkRenderer(olam, report = {}) {
  const root = new THREE.Group(); root.name = "living_region_grounded_stone_and_gold_landmarks";
  const data = landmarks(report), center = data.stoneCircle || { x:168, z:-88 };
  for (let i=0; i<12; i++) { const a = i / 12 * Math.PI * 2; add(root, olam, "rock", i % 3 ? "slateStone" : "marbleWhite", center.x + Math.cos(a)*11, center.z + Math.sin(a)*11, [1.2,1.4,.8], 0, a); }
  const gold = data.goldMarker || { x:0, z:10 };
  add(root, olam, "rock", "goldHammered", gold.x, gold.z, [.42,.25,.42], .05, .4);
  root.userData.stats = { landmarks:13, groundedLandmarks:true, legacyTreeVisuals:0 };
  return sealRegionVisual(root, { groundedLandmarks:true });
}
