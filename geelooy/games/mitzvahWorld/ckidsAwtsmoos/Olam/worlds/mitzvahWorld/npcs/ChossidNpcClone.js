// B"H
/**
 * @file ChossidNpcClone.js
 * @description The Awtsmoos breathes one NPC body into the root. If the GLB
 * arrives with a second complete humanoid shell, this module removes that branch
 * before the NPC root is returned, so no later system can hide a mistake that was
 * already attached.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=npc-source-body-prune-20260708-bh1";
import * as SkeletonUtils from "/games/scripts/jsm/utils/SkeletonUtils.js?compact=true&v=npc-source-body-prune-20260708-bh1";
import { sanitizeLivingModelTree } from "./LivingModelSanitizer.js?compact=true&v=npc-source-body-prune-20260708-bh1";
import { sanitizeRenderGeometryTree } from "../runtime/RenderGeometrySanitizer.js?compact=true&v=npc-source-body-prune-20260708-bh1";

function sceneOf(gltf) { return gltf?.scene || gltf?.scenes?.[0] || null; }
function markMesh(child) { child.userData ||= {}; Object.assign(child.userData, { isLiving:true, isNpc:true, skipOctree:true, noOctree:true }); if (child.isMesh || child.isSkinnedMesh) { child.castShadow = false; child.receiveShadow = true; child.userData.isNpcPart = true; child.frustumCulled = false; } }
function childList(root) { return root?.children ? Array.from(root.children) : []; }
function boxOf(root) { const box = new THREE.Box3().setFromObject(root), size = new THREE.Vector3(); box.getSize(size); return { box, size }; }
function scan(root) {
  const out = { name:root?.name || root?.type || "unnamed", type:root?.type || null, mesh:0, skinned:0, bones:0, vertices:0, size:[0,0,0], full:false, score:0 };
  root?.traverse?.(node => { if (node.isSkinnedMesh) out.skinned++; else if (node.isMesh) out.mesh++; if (node.isBone) out.bones++; if (node.isMesh || node.isSkinnedMesh) out.vertices += Number(node.geometry?.attributes?.position?.count || 0); });
  const measured = boxOf(root); out.size = measured.size.toArray().map(n => Number(n.toFixed(3)));
  const tall = measured.size.y > 1.15, wide = measured.size.x > .45 || measured.size.z > .35;
  out.full = Boolean(tall && wide && (out.skinned || out.bones > 8 || out.mesh > 2 || out.vertices > 1200));
  out.score = out.skinned * 1000 + Math.min(out.bones, 80) * 10 + Math.min(out.vertices, 50000) / 100 + out.mesh;
  return out;
}
function directFullBranches(root) { return childList(root).map(child => ({ child, info:scan(child) })).filter(row => row.info.full); }
function disposeBranch(branch) { branch.traverse?.(node => { node.geometry?.dispose?.(); const mats = Array.isArray(node.material) ? node.material : node.material ? [node.material] : []; mats.forEach(mat => mat?.dispose?.()); }); }
function pruneExtraBodies(root) {
  const full = directFullBranches(root);
  if (full.length <= 1) return { removed:[], kept:full[0]?.info || scan(root), visibleFullBodyBranches:full.length || 1 };
  full.sort((a,b) => b.info.score - a.info.score);
  const kept = full[0], removed = [];
  for (const row of full.slice(1)) { row.child.parent?.remove?.(row.child); disposeBranch(row.child); removed.push(row.info); }
  Object.assign(kept.child.userData ||= {}, { npcCanonicalVisualBranch:true, npcSourceKeptFullBody:true, npcRealChossidGlb:true });
  return { removed, kept:kept.info, visibleFullBodyBranches:1 };
}
function summarize(root, prune) { let meshCount=0, skinnedMeshCount=0, boneRootCount=0; root.traverse?.(child => { if (child.isSkinnedMesh) skinnedMeshCount++; else if (child.isMesh) meshCount++; if (child.isBone) boneRootCount++; }); return { rootName:root.name || root.type, directChildren:childList(root).map(c => ({ name:c.name || c.type, type:c.type, visible:c.visible, fullBody:scan(c).full })), skinnedMeshCount, meshCount, boneRootCount, visibleFullBodyBranches:prune.visibleFullBodyBranches, sourcePrunedFullBodyBranches:prune.removed }; }

export function cloneChossidNpcScene(gltf) {
  const source = sceneOf(gltf);
  if (!source || typeof source.clone !== "function") throw new Error("Loaded chossid.glb does not contain a cloneable scene");
  const clone = SkeletonUtils.clone(source);
  Object.assign(clone.userData ||= {}, { isLiving:true, isNpc:true, skipOctree:true, noOctree:true, cloneChossidNpcSceneProducedSingleBody:true });
  sanitizeLivingModelTree(clone, { isNpc:true });
  sanitizeRenderGeometryTree(clone, { warn:false });
  clone.traverse(markMesh);
  const prune = pruneExtraBodies(clone);
  Object.assign(clone.userData, { npcVisibleFullBodyBranches:prune.visibleFullBodyBranches, npcSourcePrunedFullBodyBranchCount:prune.removed.length, npcSourcePruneKept:prune.kept, duplicateNpcBodyPreventedAtSource:true });
  console.info('B"H | NPC_AFTER_CLONE_CHOSSID_SCENE_TREE', { stage:"after-cloneChossidNpcScene", ...summarize(clone, prune), seal:"source-pruned-before-attach-20260708-bh1" });
  return clone;
}
