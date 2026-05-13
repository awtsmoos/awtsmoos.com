
/**
 * B"H
 * @file NpcMeshCloner.js
 * @description
 * Makes NPCs visually reuse player-style meshes.
 */

import * as THREE from "/games/scripts/build/three.module.js";
import { getNpcClothingPreset } from "./NpcClothingData.js";
import { makeNpcMaterial, applyMaterialByName } from "./NpcMaterialTools.js";

/**
 * B"H
 * Finds a likely player mesh in the world.
 *
 * @param {any} olam
 * World.
 *
 * @returns {any|null}
 * Player mesh or null.
 */
export function findPlayerMeshForNpc(olam) {
  const candidates = [
    olam?.player?.mesh,
    olam?.nivraNeevchar?.mesh,
    olam?.derech?.player?.mesh
  ];

  for (const candidate of candidates) {
    if (candidate) return candidate;
  }

  return null;
}

/**
 * B"H
 * Clones player mesh and recolors clothes for NPC.
 *
 * @param {any} playerMesh
 * Player mesh.
 *
 * @param {number} index
 * NPC index.
 *
 * @returns {any|null}
 * NPC mesh clone.
 */
export function clonePlayerMeshForNpc(playerMesh, index = 0) {
  if (!playerMesh || typeof playerMesh.clone !== "function") return null;

  const clone = playerMesh.clone(true);
  const preset = getNpcClothingPreset(index);

  clone.name = `npc-player-style-${preset.name}-${index}`;

  applyMaterialByName(clone, ["shirt", "coat", "jacket", "body", "torso"], makeNpcMaterial(THREE, preset.shirt));
  applyMaterialByName(clone, ["pant", "leg"], makeNpcMaterial(THREE, preset.pants));
  applyMaterialByName(clone, ["beard", "hair"], makeNpcMaterial(THREE, preset.beard));
  applyMaterialByName(clone, ["face", "hand", "skin"], makeNpcMaterial(THREE, preset.skin));

  clone.traverse(child => {
    if (child.isMesh) {
      if (child.castShadow !== undefined) child.castShadow = true;
      if (child.receiveShadow !== undefined) child.receiveShadow = true;
    }
  });

  return clone;
}

/**
 * B"H
 * Applies player-style NPC mesh if possible.
 *
 * @param {any} npc
 * NPC object.
 *
 * @param {any} olam
 * World.
 *
 * @param {number} index
 * Index.
 *
 * @returns {boolean}
 * True when applied.
 */
export function applyPlayerStyleNpcMesh(npc, olam, index = 0) {
  const playerMesh = findPlayerMeshForNpc(olam);
  const clone = clonePlayerMeshForNpc(playerMesh, index);

  if (!clone || !npc) return false;

  if (npc.mesh?.parent) {
    npc.mesh.parent.remove(npc.mesh);
  }

  npc.mesh = clone;

  if (npc.add && typeof npc.add === "function") {
    npc.add(clone);
  }

  return true;
}
