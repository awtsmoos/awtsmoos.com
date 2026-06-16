// B"H
/** @file VillageAnimalFactory.js @description Combat wildlife uses binding-safe closed SkinnedMesh animals. */
import { buildAnimal } from "../region/wildlife/render/AnimalBodyForge.js?v=binding-safe-closed-animal-20260615-bh1";
function normalizeSpecies(species = "fox") { const s = String(species || "fox").toLowerCase(); if (s === "wolf") return "fox"; if (s === "ram") return "goat"; if (s === "stag") return "deer"; return s; }
function ensureData(node) { if (!node.userData) node.userData = {}; return node.userData; }
function markEnemy(root, owner, species) {
  root.name = `${species}_combat_animal`; root.nivraAwtsmoos = owner;
  Object.assign(ensureData(root), { displayName:root.userData.displayName || species, targetName:root.userData.targetName || species, isEnemy:true, isVillageWildlife:true, combatFurTextured:true, skipRaycast:false, interactionLayer:"explicit-interaction", combatTargetOwner:owner, proofSkinnedMesh:Boolean(root.userData.skinnedMesh), proofBoneCount:root.userData.boneCount || 0, proofClipCount:root.userData.clipCount || 0 });
  root.traverse(child => { child.nivraAwtsmoos = owner; child.castShadow = false; child.receiveShadow = true; Object.assign(ensureData(child), { isEnemy:true, isVillageWildlife:true, wildlifeActor:true, selectableCombatTarget:true, combatTargetOwner:owner, combatTargetRoot:root, skipOctree:true, noOctree:true, skipRaycast:child.name === "animal_soft_shadow" }); });
  return root;
}
export function createVillageAnimal(definition = {}, owner) { const species = normalizeSpecies(definition.species || "fox"), root = buildAnimal(species, Object.assign({}, definition, { species })); root.userData.baseVisualScale = root.scale.clone(); return markEnemy(root, owner, species); }
function disposeMaterial(material) { if (material && typeof material.dispose === "function") material.dispose(); }
function disposeChild(child) { if (child.geometry && typeof child.geometry.dispose === "function") child.geometry.dispose(); const materials = Array.isArray(child.material) ? child.material : [child.material]; materials.filter(Boolean).forEach(disposeMaterial); }
export function disposeVillageAnimal(root) { if (!root) return; if (typeof root.traverse === "function") root.traverse(disposeChild); if (typeof root.removeFromParent === "function") root.removeFromParent(); }
