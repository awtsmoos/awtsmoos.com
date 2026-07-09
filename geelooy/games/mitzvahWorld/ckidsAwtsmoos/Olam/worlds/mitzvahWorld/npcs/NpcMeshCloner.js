// B"H
/**
 * @file NpcMeshCloner.js
 * @description Makes NPCs visually reuse player-style meshes without optional chaining.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { getNpcClothingPreset } from "./NpcClothingData.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { makeNpcMaterial, applyMaterialByName } from "./NpcMaterialTools.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
function dataPath(root, a, b) { const first = root && root[a] ? root[a] : null; return first && first[b] ? first[b] : null; }
export function findPlayerMeshForNpc(olam) {
  const candidates = [dataPath(olam, "player", "mesh"), dataPath(olam, "nivraNeevchar", "mesh"), olam && olam.derech && olam.derech.player ? olam.derech.player.mesh : null];
  for (const candidate of candidates) if (candidate) return candidate;
  return null;
}
function markClone(child) { if (!child.userData) child.userData = {}; child.userData.isNpcPart = true; child.userData.skipOctree = true; child.userData.noOctree = true; if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } }
export function clonePlayerMeshForNpc(playerMesh, index = 0) {
  if (!playerMesh || typeof playerMesh.clone !== "function") return null;
  const clone = playerMesh.clone(true), preset = getNpcClothingPreset(index);
  clone.name = `npc-player-style-${preset.name}-${index}`;
  applyMaterialByName(clone, ["shirt", "coat", "jacket", "body", "torso"], makeNpcMaterial(THREE, preset.shirt));
  applyMaterialByName(clone, ["pant", "leg"], makeNpcMaterial(THREE, preset.pants));
  applyMaterialByName(clone, ["beard", "hair"], makeNpcMaterial(THREE, preset.beard));
  applyMaterialByName(clone, ["face", "hand", "skin"], makeNpcMaterial(THREE, preset.skin));
  clone.traverse(markClone); return clone;
}
export function applyPlayerStyleNpcMesh(npc, olam, index = 0) {
  const clone = clonePlayerMeshForNpc(findPlayerMeshForNpc(olam), index);
  if (!clone || !npc) return false;
  if (npc.mesh && npc.mesh.parent) npc.mesh.parent.remove(npc.mesh);
  npc.mesh = clone;
  if (typeof npc.add === "function") npc.add(clone);
  return true;
}
