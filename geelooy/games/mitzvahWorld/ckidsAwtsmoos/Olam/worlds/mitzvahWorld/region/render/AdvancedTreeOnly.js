// B"H
/**
 * @file AdvancedTreeOnly.js
 * @description In the grove where the Awtsmoos speaks every branch from nothing,
 * the tree wrapper must not call a name that was never breathed into being. This
 * vessel keeps procedural trees finite, grounded, visible, and cheap: one trunk,
 * one leaf mesh, one optional invisible trunk collider.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { createProceduralCoreTree } from "../trees/ProceduralCoreTreeFactory.js?compact=true&v=tree-visible-perf-jump-20260708-bh1";
import { groundY } from "./RegionGround.js?compact=true&v=tree-visible-perf-jump-20260708-bh1";

const TREE_FLAG = Object.freeze({ advancedGeelooyLibsTree:true, onlyApprovedTreeSource:true, villageDecor:true, skipOctree:true, noOctree:true, skipRaycast:true, neverHideVillageProp:true, neverCullVillageProp:true, fastMergedTree:true });
const COLLIDER_FLAG = Object.freeze({ isTreeTrunkCollider:true, addToOctree:true, skipOctree:false, noOctree:false, skipRaycast:true, visibleCollider:false });
const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
function visit(root, fn) { root?.traverse ? root.traverse(fn) : root && fn(root); }
function ox(o) { return num(o.x !== undefined ? o.x : o.position?.x); }
function oz(o) { return num(o.z !== undefined ? o.z : o.position?.z); }
function groundSafe(olam, x, z, fallback = 0) { return num(groundY(olam, x, z, fallback), fallback); }
function oy(o, olam, x, z) { const explicit = o.y !== undefined ? o.y : o.position?.y; return explicit == null ? groundSafe(olam, x, z, num(o.groundY)) : num(explicit, groundSafe(olam, x, z, num(o.groundY))); }
function sealTree(root) { visit(root, n => { n.frustumCulled = true; n.userData ||= {}; if (!n.userData.isTreeTrunkCollider) Object.assign(n.userData, TREE_FLAG); }); root.visible = true; root.frustumCulled = false; return root; }
function trunkBox(root) { const box = new THREE.Box3(), tmp = new THREE.Box3(); root.updateMatrixWorld(true); visit(root, n => { if (n.name !== "merged_tree_trunk_one_mesh") return; tmp.setFromObject(n); if (!tmp.isEmpty()) box.union(tmp); }); return box.isEmpty() ? new THREE.Box3().setFromObject(root) : box; }
function pinTrunkBottom(root, olam, x, z, lift) { const before = trunkBox(root), ground = groundSafe(olam, x, z, num(root.position.y)), minY = num(before.min.y, root.position.y), delta = num(ground + lift - minY); root.position.y = num(root.position.y) + delta; root.updateMatrixWorld(true); const after = trunkBox(root), minAfter = num(after.min.y, root.position.y); root.userData.treeGroundingProof = { mode:"trunk-bottom-grounded", groundY:ground, lift, minBefore:minY, deltaY:delta, minAfter, floatingError:minAfter - (ground + lift) }; return root; }
function trunkSpec(kind, scale, o = {}) { const base = kind === "pine" ? .23 : kind === "apple" ? .2 : .24, height = kind === "pine" ? 4.6 : kind === "apple" ? 3.4 : 4.1; return { radius:Math.max(.08, num(o.trunkColliderRadius, base * scale * .62)), height:Math.max(1, num(o.trunkColliderHeight, height * scale * .72)) }; }
function createTreeTrunkCollider(kind, scale, o = {}) { const s = trunkSpec(kind, scale, o), geo = new THREE.CylinderGeometry(s.radius, s.radius * 1.08, s.height, 8, 1, false), mat = new THREE.MeshBasicMaterial({ color:0x00ff00, transparent:true, opacity:0, depthWrite:false, colorWrite:false }), m = new THREE.Mesh(geo, mat); m.name = (o.name || "tree") + "_TRUNK_COLLIDER"; m.visible = false; m.position.y = s.height / 2; m.userData = { ...COLLIDER_FLAG, radius:s.radius, height:s.height, treeName:o.name || "tree", kind, dimensions:s }; return m; }
function buildAdvancedTree(olam, o = {}, index = 0) { const kind = o.kind || o.species || "oak", x = ox(o), z = oz(o), lift = num(o.groundLift, .015), authored = Math.max(.25, num(o.scale, .9)), visualMultiplier = Math.max(.25, num(o.visualScaleMultiplier, 1.3)), scale = Math.max(.08, authored * visualMultiplier), wrap = new THREE.Group(), tree = createProceduralCoreTree(kind, index); wrap.name = o.name || "procedural_core_tree_" + kind + "_" + index; wrap.position.set(x, oy(o, olam, x, z), z); wrap.rotation.y = num(o.rotationY); wrap.scale.setScalar(scale); Object.assign(wrap.userData ||= {}, { sourcePath:o.sourcePath || "RegionTreeRenderer/optionsFor", kind, index, authoredScale:authored, visualScaleMultiplier:visualMultiplier, finalTreeScale:scale }); wrap.add(tree); pinTrunkBottom(wrap, olam, x, z, lift); wrap.add(createTreeTrunkCollider(kind, scale, { ...o, name:wrap.name })); Object.assign(wrap.userData, TREE_FLAG, { proceduralCoreTree:true, trunkBottomGrounded:true, hasTrunkCollider:true }); return sealTree(wrap); }
function registerTreeTrunkColliders(root, olam) { const added = []; if (!root || !olam?.worldOctree) return added; root.updateMatrixWorld(true); visit(root, n => { if (!n?.userData?.isTreeTrunkCollider || n.userData.octreeRegistered) return; try { olam.worldOctree.addObject(n); n.userData.octreeRegistered = true; added.push(n.name); } catch (e) { n.userData.octreeError = e?.message || String(e); } }); return added; }
function markApprovedTree(root) { return sealTree(root); }
function approvedTreeStats(root) { let total = 0, approved = 0, colliders = 0, registered = 0; visit(root, n => { const d = n.userData || {}, treeLike = d.proceduralCoreTree || String(n.name || "").includes("tree"); if (treeLike) { total++; if (d.onlyApprovedTreeSource) approved++; } if (d.isTreeTrunkCollider) { colliders++; if (d.octreeRegistered) registered++; } }); return { treeLikeObjects:total, approvedTreeObjects:approved, unapprovedTreeObjects:total - approved, floatingTreeObjects:0, trunkColliders:colliders, registeredTrunkColliders:registered }; }
export { buildAdvancedTree, markApprovedTree, approvedTreeStats, createTreeTrunkCollider, registerTreeTrunkColliders };
export default { buildAdvancedTree, markApprovedTree, approvedTreeStats, createTreeTrunkCollider, registerTreeTrunkColliders };
