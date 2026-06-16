// B"H
/** @file AdvancedTreeOnly.js @description Procedural-core tree gateway with visual-only leaves and real cylinder trunk colliders. */
import * as THREE from "/games/scripts/build/three.module.js";
import { createProceduralCoreTree } from "../trees/ProceduralCoreTreeFactory.js?v=awtsmoos-tree-core-20260614-bh2";
import { groundY } from "./RegionGround.js";
const TREE_FLAG = Object.freeze({ advancedGeelooyLibsTree:true, onlyApprovedTreeSource:true, treeSource:"/libs/awtsmoos-procedural-core/src/core", villageDecor:true, skipOctree:true, noOctree:true, skipRaycast:true });
const COLLIDER_FLAG = Object.freeze({ isTreeTrunkCollider:true, addToOctree:true, skipOctree:false, noOctree:false, skipRaycast:true, visibleCollider:false });
function number(value, fallback = 0) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
function visit(root, callback) { if (root && typeof root.traverse === "function") root.traverse(callback); else if (root) callback(root); }
function optionPosition(options) { return options && options.position ? options.position : {}; }
function optionX(options) { const p = optionPosition(options); return number(options.x !== undefined ? options.x : p.x); }
function optionZ(options) { const p = optionPosition(options); return number(options.z !== undefined ? options.z : p.z); }
function fallbackY(options, olam, x, z) { const p = optionPosition(options); const y = options.y !== undefined ? options.y : p.y; return number(y, groundY(olam, x, z, number(options.groundY))); }
function bbox(root) { root.updateMatrixWorld(true); return new THREE.Box3().setFromObject(root); }
function sealTreeVisual(root) { visit(root, child => { child.userData ||= {}; if (!child.userData.isTreeTrunkCollider) Object.assign(child.userData, TREE_FLAG); }); return root; }
function pinBottomToGround(root, olam, x, z, lift) { const before = bbox(root), ground = groundY(olam, x, z, root.position.y), delta = ground + lift - before.min.y; root.position.y += delta; const after = bbox(root); root.userData.treeGroundingProof = { groundY:ground, minBefore:before.min.y, deltaY:delta, minAfter:after.min.y, floatingError:after.min.y - (ground + lift) }; return root; }
function trunkSpec(kind, scale, options = {}) { const ancient = options.age === "ancient"; const baseRadius = kind === "pine" ? .38 : kind === "apple" ? .42 : .48; const baseHeight = kind === "pine" ? 5.3 : kind === "apple" ? 3.6 : 4.4; return { radius:number(options.trunkColliderRadius, baseRadius * scale), height:number(options.trunkColliderHeight, baseHeight * scale * (ancient ? 1.12 : 1)) }; }
export function createTreeTrunkCollider(kind, scale, options = {}) {
  const spec = trunkSpec(kind, scale, options);
  const geometry = new THREE.CylinderGeometry(spec.radius, spec.radius * 1.08, spec.height, 14, 1, false);
  const material = new THREE.MeshBasicMaterial({ color:0x00ff00, transparent:true, opacity:0, depthWrite:false });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `${options.name || "tree"}_TRUNK_COLLIDER`;
  mesh.visible = false;
  mesh.position.y = spec.height / 2;
  mesh.userData = { ...COLLIDER_FLAG, radius:spec.radius, height:spec.height, treeName:options.name || "tree", kind };
  return mesh;
}
export function buildAdvancedTree(olam, options = {}, index = 0) {
  const kind = options.kind || options.species || "oak", x = optionX(options), z = optionZ(options), lift = number(options.groundLift, .01);
  const wrap = new THREE.Group(), tree = createProceduralCoreTree(kind, index), scale = number(options.scale, options.age === "ancient" ? 1.12 : .9);
  wrap.name = options.name || `procedural_core_tree_${kind}_${index}`;
  wrap.position.set(x, fallbackY(options, olam, x, z), z);
  wrap.rotation.y = number(options.rotationY, 0);
  wrap.scale.setScalar(scale);
  wrap.add(tree);
  wrap.add(createTreeTrunkCollider(kind, 1, { ...options, name:wrap.name }));
  wrap.userData ||= {};
  Object.assign(wrap.userData, TREE_FLAG, { kind, index, proceduralCoreTree:true, bboxGroundedTree:true, hasTrunkCollider:true });
  pinBottomToGround(wrap, olam, x, z, lift);
  return sealTreeVisual(wrap);
}
export function registerTreeTrunkColliders(root, olam) {
  const added = [];
  if (!root || !olam?.worldOctree) return added;
  root.updateMatrixWorld(true);
  visit(root, child => {
    if (!child?.userData?.isTreeTrunkCollider || child.userData.octreeRegistered) return;
    try { olam.worldOctree.addObject(child); child.userData.octreeRegistered = true; added.push(child.name); } catch (e) { child.userData.octreeError = e?.message || String(e); }
  });
  return added;
}
export function markApprovedTree(root) { return sealTreeVisual(root); }
export function approvedTreeStats(root) { let total = 0, approved = 0, floating = 0, colliders = 0, registered = 0; visit(root, node => { const data = node.userData || {}; const treeLike = data.proceduralCoreTree || String(node.name || "").includes("tree"); if (treeLike) { total++; if (data.onlyApprovedTreeSource) approved++; const proof = data.treeGroundingProof; if (proof && Math.abs(proof.floatingError || 0) > .08) floating++; } if (data.isTreeTrunkCollider) { colliders++; if (data.octreeRegistered) registered++; } }); return { treeLikeObjects:total, approvedTreeObjects:approved, unapprovedTreeObjects:total - approved, floatingTreeObjects:floating, trunkColliders:colliders, registeredTrunkColliders:registered }; }
export default { buildAdvancedTree, markApprovedTree, approvedTreeStats, createTreeTrunkCollider, registerTreeTrunkColliders };
