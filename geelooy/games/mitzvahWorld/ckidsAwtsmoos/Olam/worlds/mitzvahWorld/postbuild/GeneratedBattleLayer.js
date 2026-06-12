// B"H
/**
 * @file GeneratedBattleLayer.js
 * @description
 * Chapter 704: The sealed layer reopens as a bounded village encounter.
 *
 * The old injector was silenced because it threw broken enemies into every
 * world. The Awtsmoos now returns it as a narrow, data-driven installer: only
 * the village receives a few authored wildlife mobs, a quest ledger, health
 * bars, rewards, and training-ground decor.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import VillageAnimalMob from "../combat/VillageAnimalMob.js?v=village-polish-20260612-bh810";
import VillageCombatState from "../combat/VillageCombatState.js?v=village-polish-20260612-bh810";
import { VILLAGE_BATTLE_DECOR, VILLAGE_COMBAT_MISSION, VILLAGE_WILDLIFE } from "../combat/VillageCombatManifest.js";

const INSTALLED_KEY = "__awtsmoosVillageCombatInstalled";

function isVillageContext(context = {}) {
  const info = context.worldData || context.olam?.baseInfo || {};
  const id = String(info.id || info.shaym || context.source || "");
  return !id || /village\.json|village/i.test(id);
}

function material(color) {
  return new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.05 });
}

function addDecor(scene, def) {
  const root = new THREE.Group();
  root.name = def.name;
  root.position.set(def.position.x, def.position.y, def.position.z);
  root.userData.skipOctree = true;
  const pole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.12), material(0x5a3a21));
  pole.position.y = 0.55;
  const banner = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.82, 0.06), material(def.color));
  banner.position.set(0.48, 1.25, 0);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 8), material(0xffe08a));
  glow.position.set(0, 1.85, 0);
  root.add(pole, banner, glow);
  root.traverse(child => {
    child.castShadow = false;
    child.receiveShadow = true;
    Object.assign(child.userData ||= {}, { skipOctree: true, noOctree: true, villageCombatDecor: true });
  });
  scene.add(root);
  return root;
}

function registerMob(context, mob) {
  context.scene.add(mob.mesh);
  if (context.olam) {
    mob.olam = context.olam;
    if (!context.olam.nivrayim?.includes?.(mob)) context.olam.nivrayim?.push?.(mob);
    context.olam.combatManager?.registerEnemy?.(mob);
  }
  return mob;
}

/**
 * Installs the village battle layer.
 *
 * @param {object} context Build context.
 * @returns {Promise<object[]>} Created runtime mobs and decor.
 */
export async function ensureGeneratedBattleLayer(context = {}) {
  if (!context.scene || !context.olam || !isVillageContext(context)) return [];
  if (context.olam[INSTALLED_KEY]) return context.olam[INSTALLED_KEY];
  const state = new VillageCombatState(context.olam, VILLAGE_COMBAT_MISSION);
  context.olam.__villageCombatState = state;
  const decor = VILLAGE_BATTLE_DECOR.map(def => addDecor(context.scene, def));
  const mobs = VILLAGE_WILDLIFE.map(def => registerMob(context, new VillageAnimalMob(context.olam, def, state)));
  context.olam[INSTALLED_KEY] = [...decor, ...mobs];
  return context.olam[INSTALLED_KEY];
}
