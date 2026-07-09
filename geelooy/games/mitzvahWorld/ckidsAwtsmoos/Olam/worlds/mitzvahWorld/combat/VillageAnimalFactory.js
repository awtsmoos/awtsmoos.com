// B"H
/**
 * @file VillageAnimalFactory.js
 * @description Wildlife roots carry owner metadata, finite target proxies, and
 * non-raycast soft shadows so visible animals are selectable without tree spam.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { buildAnimal } from "../region/wildlife/render/AnimalBodyForge.js?compact=true&v=realistic-target-proof-20260706-bh2";
import { sanitizeRenderGeometryTree } from "../runtime/RenderGeometrySanitizer.js?compact=true&v=total-overhaul-render-sanitize-20260705-bh1";
const RADIUS = { fox:1.65, wolf:1.65, deer:2.1, goat:1.85, cow:2.15, bird:1.35, frog:1.25, rabbit:1.25 };
function normalizeSpecies(species = "fox") { const s = String(species || "fox").toLowerCase(); if (s === "wolf") return "fox"; if (s === "ram") return "goat"; if (s === "stag") return "deer"; return s; }
function data(node) { node.userData ||= {}; return node.userData; }
function safeGeometry(node) { try { node.geometry?.computeBoundingBox?.(); node.geometry?.computeBoundingSphere?.(); return true; } catch { data(node).skipRaycast = true; data(node).raycastSkipReason = "animal-bad-geometry"; return false; } }
function makeProxy(root, owner, species) { const proxy = new THREE.Mesh(new THREE.SphereGeometry(RADIUS[species] || 1.55, 12, 8), new THREE.MeshBasicMaterial({ transparent:true, opacity:0, depthWrite:false })); proxy.name = `${species}_combat_target_proxy`; proxy.visible = false; proxy.nivraAwtsmoos = owner; Object.assign(data(proxy), { combatTargetProxy:true, selectableCombatTarget:true, combatTargetOwner:owner, combatTargetRoot:root, interactionLayer:"combat-target", skipOctree:true, noOctree:true, skipRaycast:false }); root.add(proxy); data(root).selectionBubble = proxy; return proxy; }
function markEnemy(root, owner, species) { root.name = `${species}_combat_animal`; root.nivraAwtsmoos = owner; sanitizeRenderGeometryTree(root, { warn:false }); Object.assign(data(root), { displayName:root.userData.displayName || species, targetName:root.userData.targetName || species, isEnemy:true, isVillageWildlife:true, selectableCombatTarget:true, combatTargetOwner:owner, combatTargetRoot:root, interactionLayer:"combat-target", combatFurTextured:true, proofSkinnedMesh:Boolean(root.userData.skinnedMesh), proofBoneCount:root.userData.boneCount || 0, proofClipCount:root.userData.clipCount || 0 }); root.traverse(child => { child.nivraAwtsmoos = owner; child.castShadow = false; child.receiveShadow = true; Object.assign(data(child), { isEnemy:true, isVillageWildlife:true, wildlifeActor:true, selectableCombatTarget:true, combatTargetOwner:owner, combatTargetRoot:root, skipOctree:true, noOctree:true, interactionLayer:"combat-target", skipRaycast:/soft_shadow/i.test(child.name || "") }); if (child.geometry) safeGeometry(child); }); makeProxy(root, owner, species); return root; }
export function createVillageAnimal(definition = {}, owner) { const species = normalizeSpecies(definition.species || "fox"), root = buildAnimal(species, { ...definition, species }); root.userData.baseVisualScale = root.scale.clone(); return markEnemy(root, owner, species); }
function disposeMaterial(material) { material?.dispose?.(); }
function disposeChild(child) { child.geometry?.dispose?.(); (Array.isArray(child.material) ? child.material : [child.material]).filter(Boolean).forEach(disposeMaterial); }
export function disposeVillageAnimal(root) { if (!root) return; root.traverse?.(disposeChild); root.removeFromParent?.(); }
