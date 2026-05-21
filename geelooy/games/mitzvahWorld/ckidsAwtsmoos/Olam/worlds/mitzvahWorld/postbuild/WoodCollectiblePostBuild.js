/**
 * B"H
 * @file WoodCollectiblePostBuild.js
 *
 * Chapter 13: Six Logs With Souls Of Speech.
 *
 * The Awtsmoos makes even wood answer touch. Each log is a small mesh, a
 * quest item, a progress event, and a vanishing spark after collection.
 */

import * as THREE from '/games/scripts/build/three.module.js';
import { EMERALD_WOOD_NODES, WOOD_COLLECTIBLE_CONTRACT } from '../data/collectibles/WoodCollectibles.js';
import { collectWoodRuntime } from '../collectibles/WoodCollectionLogic.js';

function createWoodLog(def, olam) {
  const group = new THREE.Group();
  group.name = def.id;
  group.position.set(def.position[0], def.position[1], def.position[2]);

  const bark = new THREE.MeshStandardMaterial({ color: 0x6b3f24, roughness: 0.86 });
  const core = new THREE.MeshStandardMaterial({ color: 0xb98245, roughness: 0.72 });
  const log = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 1.15, 10), bark);
  log.rotation.z = Math.PI / 2;
  group.add(log);

  [-0.58, 0.58].forEach(x => {
    const cap = new THREE.Mesh(new THREE.CircleGeometry(0.24, 10), core);
    cap.position.x = x;
    cap.rotation.y = Math.PI / 2;
    group.add(cap);
  });

  group.userData = {
    ...WOOD_COLLECTIBLE_CONTRACT,
    collectibleId: def.id,
    quantity: def.amount,
    isCollectibleWood: true
  };

  group.nivraAwtsmoos = {
    type: 'collectibleWood',
    name: 'Wood',
    mesh: group,
    ayshPeula(action, actor) {
      if (action !== 'accepted interaction') return null;
      /* addItem -> updateQuestProgress -> group.visible = false */
      /* addItem -> updateQuestProgress -> group.visible = false */
      return collectWoodRuntime({
        actor,
        group,
        amount: def.amount,
        collectibleId: def.id,
        olam
      });
    }
  };

  group.traverse(child => {
    child.userData.interactable = true;
    child.userData.isCollectibleWood = true;
    child.nivraAwtsmoos = group.nivraAwtsmoos;
  });

  return group;
}

export async function ensureWoodCollectibles(context = {}) {
  const scene = context.scene || context.olam?.scene;
  if (!scene || typeof scene.add !== 'function') return [];

  let existing = 0;
  scene.traverse(child => { if (child?.userData?.isCollectibleWood) existing++; });
  if (existing > 0) return [];

  const added = EMERALD_WOOD_NODES.map(def => createWoodLog(def, context.olam));
  added.forEach(log => scene.add(log));
  return added;
}
