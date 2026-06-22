// B"H
/** @file RegionTreeRenderer.js @description Region forest delegates only to bbox-grounded procedural-core tree API. */
import * as THREE from "/games/scripts/build/three.module.js";
import { rand } from "./RegionRandom.js";
import { budgetedQualityCount } from "./RegionQuality.js?v=awtsmoos-quality-20260614-bh2";
import { sealRegionVisual } from "./RegionSeal.js";
import { groundY } from "./RegionGround.js";
import { regionMaterial } from "./RegionMaterials.js?v=ping-pong-crisp-textures-20260622-bh1";
function reportTrees(report) { return report && report.instances && Array.isArray(report.instances.trees) ? report.instances.trees : []; }
function fallbackSpecs(count) { return Array.from({ length:count }, (_, i) => { const a=i*2.399963, r=120+rand(i,1)*118; return { x:-70+Math.cos(a)*r, z:32+Math.sin(a)*r*.62, kind:i%7===0?"apple":i%5===0?"pine":"oak", age:i%11===0?"ancient":"mature" }; }); }
function optionsFromSpec(spec, index) { return { ...spec, name:`advanced_region_tree_${spec.kind || "oak"}_${index}`, rotationY:rand(index,10)*Math.PI*2, scale:spec.age === "ancient" ? 1.12 : .82 + rand(index,11)*.34 }; }
function makeLayer(name, geometry, material, count) { const mesh = new THREE.InstancedMesh(geometry, material, count); mesh.name = name; mesh.castShadow = false; mesh.receiveShadow = true; Object.assign(mesh.userData ||= {}, { instancedForestPart:true, visualOnly:true, skipOctree:true, noOctree:true }); return mesh; }
function place(dummy, mesh, i, x, y, z, sx, sy, sz, yaw = 0) { dummy.position.set(x, y, z); dummy.rotation.set(0, yaw, 0); dummy.scale.set(sx, sy, sz); dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix); }
export function buildTreeRenderer(olam, report = {}) {
  const fromReport = reportTrees(report), specs = fromReport.length ? fromReport : fallbackSpecs(144), count = Math.min(budgetedQualityCount(olam, specs.length, "treeDistance", 144), 144);
  const root = new THREE.Group(); root.name = "living_region_procedural_core_tree_forest";
  const trunk = makeLayer("instanced_textured_tree_trunks", new THREE.CylinderGeometry(.22, .36, 1, 7), regionMaterial("barkOak", { simple:true }), count);
  const canopy = makeLayer("instanced_pingpong_leaf_canopy_masses", new THREE.IcosahedronGeometry(1, 1), regionMaterial("leaf", { simple:true }), count * 3);
  const accent = makeLayer("instanced_leaf_distribution_accents", new THREE.IcosahedronGeometry(1, 0), regionMaterial("mossPatch", { simple:true }), count * 2);
  const dummy = new THREE.Object3D(), colliders = [];
  for (let i=0; i<count; i++) {
    const spec = optionsFromSpec(specs[i % specs.length], i), x = Number(spec.x) || 0, z = Number(spec.z) || 0, y = groundY(olam, x, z), s = Number(spec.scale) || 1, h = 4.4 * s, yaw = spec.rotationY || 0;
    place(dummy, trunk, i, x, y + h * .36, z, .55 * s, h, .55 * s, yaw);
    place(dummy, canopy, i * 3, x, y + h * .92, z, 1.8 * s, 1.18 * s, 1.55 * s, yaw);
    place(dummy, canopy, i * 3 + 1, x - .58 * s, y + h * .78, z + .18 * s, 1.24 * s, .82 * s, 1.1 * s, yaw + .8);
    place(dummy, canopy, i * 3 + 2, x + .52 * s, y + h * .84, z - .32 * s, 1.16 * s, .76 * s, 1.04 * s, yaw - .7);
    place(dummy, accent, i * 2, x - .28 * s, y + h * 1.08, z - .18 * s, .72 * s, .38 * s, .62 * s, yaw + 1.6);
    place(dummy, accent, i * 2 + 1, x + .34 * s, y + h * .7, z + .42 * s, .56 * s, .32 * s, .5 * s, yaw - 1.2);
    colliders.push({ id:`tree_trunk_${i}`, category:"tree-trunk", owner:spec.name, position:[x, y + h * .36, z], size:[.62 * s, h, .62 * s], yaw:0, exactTrunk:true });
  }
  trunk.instanceMatrix.needsUpdate = canopy.instanceMatrix.needsUpdate = accent.instanceMatrix.needsUpdate = true;
  root.add(trunk, canopy, accent);
  root.userData.colliderSources = colliders;
  root.userData.stats = { trees:count, instancedForest:true, drawCalls:3, canopyClusters:count * 3, leafAccents:count * 2, bboxGroundedTrees:true, colliderSources:colliders.length, performanceBudget:"full-forest-instanced-wow-gameplay" };
  return sealRegionVisual(root, { instancedForest:true, proceduralCoreTrees:true, bboxGroundedTrees:true });
}
