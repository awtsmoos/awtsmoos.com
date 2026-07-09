// B"H
/**
 * @file FinalGroundingPass.js
 * @description Final feet-to-earth covenant using parser-clear bounds and the shared GroundTruth village law.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { yAt } from "./VillagePolishGround.js?compact=true&v=awtsmoos-polish-ground-20260614-bh2";
const BOX = new THREE.Box3();
const CHILD_BOX = new THREE.Box3();
function entityRoot(entity) { if (!entity) return null; return entity.mesh || entity.modelMesh || entity.guf || null; }
function dataOf(object) { return object && object.userData ? object.userData : {}; }
function contributes(mesh) {
  if (!mesh || !mesh.isMesh || mesh.visible === false) return false;
  if (/soft_shadow|warning_ring|hit_arc/i.test(String(mesh.name || ""))) return false;
  const data = dataOf(mesh); if (data.skipGrounding || data.awtsmoosRayProxy) return false;
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  return materials.some(material => material && material.visible !== false && Number(material.opacity === undefined ? 1 : material.opacity) > .02);
}
function updateWorld(root) { if (root && typeof root.updateWorldMatrix === "function") root.updateWorldMatrix(true, true); }
function computeBox(geometry) { if (geometry && typeof geometry.computeBoundingBox === "function") geometry.computeBoundingBox(); }
function visibleBounds(root) {
  BOX.makeEmpty(); updateWorld(root);
  if (!root || typeof root.traverse !== "function") return null;
  root.traverse(child => { if (!contributes(child) || !child.geometry) return; computeBox(child.geometry); if (!child.geometry.boundingBox) return; CHILD_BOX.copy(child.geometry.boundingBox).applyMatrix4(child.matrixWorld); BOX.union(CHILD_BOX); });
  return BOX.isEmpty() ? null : BOX;
}
function addRoot(roots, value) { const root = entityRoot(value) || value; if (root && root.isObject3D) roots.add(root); }
function skipEntity(entity, olam) { return entity && (entity.type === "chossid" || entity === olam.player || entity === olam.chossid); }
function entityShouldGround(entity) { if (!entity) return false; const root = entityRoot(entity), data = dataOf(root); return Boolean(entity.interactiveNpc || entity.type === "mazik" || entity.wildlifeActor || data.wildlifeActor); }
function actorRoots(olam) {
  const roots = new Set(), nivrayim = olam && Array.isArray(olam.nivrayim) ? olam.nivrayim : [];
  for (const entity of nivrayim) { if (skipEntity(entity, olam)) continue; if (entityShouldGround(entity)) addRoot(roots, entity); }
  const enemies = olam && olam.combatManager && Array.isArray(olam.combatManager.enemies) ? olam.combatManager.enemies : [];
  for (const enemy of enemies) addRoot(roots, enemy);
  const wildlifeRoot = olam ? olam.__livingRegionWildlifeRoot : null;
  const animals = wildlifeRoot && Array.isArray(wildlifeRoot.children) ? wildlifeRoot.children : [];
  for (const animal of animals) addRoot(roots, animal);
  return Array.from(roots);
}
function useAuthoredY(root) { const data = dataOf(root); return data.useAuthoredY && !data.wildlifeActor && !data.interactiveNpc; }
function markGrounded(root, ground, correction) { if (!root.userData) root.userData = {}; root.userData.finalGrounding = { ground, correction, at:Date.now() }; }
function groundRoot(olam, root) {
  if (!root || useAuthoredY(root)) return null;
  const bounds = visibleBounds(root); if (!bounds) return null;
  const centerX = (bounds.min.x + bounds.max.x) * .5, centerZ = (bounds.min.z + bounds.max.z) * .5;
  const ground = yAt(olam, centerX, centerZ, root.position.y), correction = ground + .018 - bounds.min.y;
  if (!Number.isFinite(correction) || Math.abs(correction) > 14) return null;
  root.position.y += correction; markGrounded(root, ground, correction); return correction;
}
export async function ensureFinalGroundingPass(context = {}) {
  const olam = context.olam || context; if (!olam) return null;
  const roots = actorRoots(olam), corrections = [];
  for (let pass = 0; pass < 2; pass++) { for (const root of roots) { const correction = groundRoot(olam, root); if (correction !== null) corrections.push(correction); } if (pass === 0) await new Promise(resolve => setTimeout(resolve, 0)); }
  const absolute = corrections.map(value => Math.abs(value));
  const report = { actors:roots.length, grounded:corrections.length, raised:corrections.filter(value => value > .08).length, lowered:corrections.filter(value => value < -.08).length, maxCorrection:Number(Math.max(0, ...absolute).toFixed(3)) };
  olam.__finalGroundingReport = report; return report;
}
export default { ensureFinalGroundingPass };
