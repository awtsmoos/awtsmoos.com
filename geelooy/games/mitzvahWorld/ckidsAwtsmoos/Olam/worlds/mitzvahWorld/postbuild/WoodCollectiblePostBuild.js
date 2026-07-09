// B"H
/** @file WoodCollectiblePostBuild.js @description Touch-responsive wood collectibles, parser-clear and interaction-layer ready. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { EMERALD_WOOD_NODES, WOOD_COLLECTIBLE_CONTRACT } from "../data/collectibles/WoodCollectibles.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

function material(color, roughness) {
  return new THREE.MeshStandardMaterial({ color, roughness });
}

function pos(def) {
  return Array.isArray(def.position) ? def.position : [0, 0, 0];
}

function markChild(child, owner) {
  if (!child.userData) child.userData = {};
  child.userData.interactable = true;
  child.userData.isCollectibleWood = true;
  child.userData.skipOctree = true;
  child.userData.noOctree = true;
  child.nivraAwtsmoos = owner;
}

function collectWoodRuntimePostbuild({ actor, group, amount = 1, collectibleId = "wood", olam } = {}) {
  if (group?.userData?.collected) return { collected:false, collectibleId, amount:0 };
  actor?.inventory?.addItem?.({ id:"wood", className:"Wood", name:"Wood", icon:"wood" }, amount);
  actor?.updateQuestProgress?.("collect", "Wood");
  if (group) group.visible = false;
  if (group?.userData) group.userData.collected = true;
  olam?.ayshPeula?.("ui event", "effectsOverlay", { text:`+${amount} wood`, color:"#d79a48" });
  return { collected:true, collectibleId, amount };
}

function createWoodLog(def, olam) {
  const group = new THREE.Group();
  const p = pos(def);
  group.name = def.id;
  group.position.set(p[0], p[1], p[2]);
  const bark = material(0x6b3f24, .86);
  const core = material(0xb98245, .72);
  const log = new THREE.Mesh(new THREE.CylinderGeometry(.22, .25, 1.15, 10), bark);
  log.rotation.z = Math.PI / 2;
  group.add(log);
  for (const x of [-.58, .58]) {
    const cap = new THREE.Mesh(new THREE.CircleGeometry(.24, 10), core);
    cap.position.x = x;
    cap.rotation.y = Math.PI / 2;
    group.add(cap);
  }
  group.userData = Object.assign({}, WOOD_COLLECTIBLE_CONTRACT, { collectibleId:def.id, quantity:def.amount, isCollectibleWood:true, interactionLayer:"explicit-interaction" });
  group.nivraAwtsmoos = {
    type:"collectibleWood",
    name:"Wood",
    mesh:group,
    ayshPeula(action, actor) {
      if (action !== "accepted interaction") return null;
      return collectWoodRuntimePostbuild({ actor, group, amount:def.amount, collectibleId:def.id, olam });
    }
  };
  group.traverse(child => markChild(child, group.nivraAwtsmoos));
  return group;
}

function sceneOf(context) {
  const olam = context && context.olam ? context.olam : null;
  return context && context.scene ? context.scene : olam && olam.scene ? olam.scene : null;
}

function countExisting(scene) {
  let existing = 0;
  if (!scene || typeof scene.traverse !== "function") return 0;
  scene.traverse(child => {
    const data = child && child.userData ? child.userData : {};
    if (data.isCollectibleWood) existing++;
  });
  return existing;
}

export async function ensureWoodCollectibles(context = {}) {
  const scene = sceneOf(context);
  if (!scene || typeof scene.add !== "function") return [];
  if (countExisting(scene) > 0) return [];
  const olam = context && context.olam ? context.olam : context;
  const added = EMERALD_WOOD_NODES.map(def => createWoodLog(def, olam));
  added.forEach(log => scene.add(log));
  return added;
}
