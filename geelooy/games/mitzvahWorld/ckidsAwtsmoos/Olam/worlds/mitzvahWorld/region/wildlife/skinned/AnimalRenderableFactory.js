// B"H
/**
 * @file AnimalRenderableFactory.js
 * @description
 * Single-mesh animal compiler. The Awtsmoos gathers fur, ears, tail, horns,
 * and life into one skinned vessel instead of scattering the creature into many
 * draw-call fragments. Health, targeting, kosher flags, and animation remain in
 * userData; visual bars/attachments are deliberately not separate meshes.
 */
import { ensureRenderBackend } from "../../../../../../rendering/RendererProvider.js";
import { speciesProfile } from "../render/AnimalSpeciesProfiles.js?v=single-mesh-animals-20260621-bh1";
import { createAnimalRigBlueprint } from "./AnimalRigBlueprints.js?v=single-mesh-animals-20260621-bh1";
import { createAnimalSurfaceBlueprint } from "./AnimalSurfaceBlueprint.js?v=single-mesh-animals-20260621-bh1";
import { solveAnimalSkinWeights } from "./AnimalSkinWeightSolver.js?v=single-mesh-animals-20260621-bh1";
import { animalMaterialIntent, animalCombatStats } from "./AnimalMaterialIntent.js?v=single-mesh-animals-20260621-bh1";
import { animalAnimationBlueprints } from "./AnimalAnimationBlueprints.js?v=single-mesh-animals-20260621-bh1";
import { attachAnimalAnimationController } from "./AnimalAnimationController.js?v=single-mesh-animals-20260621-bh1";

const DISPLAY = Object.freeze({ fox:"Fox", rabbit:"Rabbit", deer:"Deer", goat:"Goat", cow:"Cow", frog:"Frog", bird:"Bird" });
const KOSHER = new Set(["cow", "goat", "deer"]);
function displayName(species) { return DISPLAY[species] || "Animal"; }

function sealMesh(mesh) {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  for (const mat of mats.filter(Boolean)) {
    mat.transparent = false; mat.opacity = 1; mat.depthWrite = true; mat.depthTest = true; mat.alphaTest = 0;
    mat.needsUpdate = true; mat.userData ||= {}; mat.userData.singleMeshAnimalMaterial = true;
  }
  mesh.userData ||= {};
  Object.assign(mesh.userData, { singleMeshAnimal:true, animalPart:false, selectableCombatTarget:true, skipRaycast:false });
}

function updateHealthState(root) {
  const h = root.userData?.health;
  if (!h?.max) return;
  root.userData.healthPct = Math.max(0, Math.min(1, h.current / h.max));
}

function deterministicEvade(root, source) {
  const h = root.userData?.health || {}, species = root.userData?.species || "";
  const seed = (h.hitsTaken || 0) * 97 + species.length * 31;
  const wave = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
  return wave < (h.evasion + (root.userData.airborne && !source?.antiAir ? h.flightEvasion : 0));
}

function attachCombatMethods(root) {
  root.takeDamage = (amount = 0, source = {}) => {
    const h = root.userData.health;
    if (!h || h.dead) return 0;
    h.hitsTaken += 1;
    if (deterministicEvade(root, source)) { h.lastResult = "evaded"; return 0; }
    const raw = Math.max(1, Number(amount) || 1);
    const minGate = Math.max(1, h.max / h.minHitsToKill);
    const applied = Math.min(Math.max(1, raw * (1 - h.armor)), minGate);
    h.current = Math.max(0, h.current - applied);
    Object.assign(h, { lastResult:"damaged", lastDamage:applied, dead:h.current <= 0 });
    updateHealthState(root);
    if (h.dead) root.userData.animalAnimationController?.play?.("death", .08);
    return applied;
  };
  root.healAnimal = amount => {
    const h = root.userData.health;
    h.current = Math.min(h.max, h.current + Math.max(0, Number(amount) || 0));
    h.dead = false; updateHealthState(root);
  };
}

export function createAnimalRenderable(species = "rabbit", data = {}) {
  const backend = ensureRenderBackend();
  const profile = speciesProfile(species);
  const rig = createAnimalRigBlueprint(species, profile);
  const surface = createAnimalSurfaceBlueprint(species, profile);
  const skin = solveAnimalSkinWeights(surface, rig);
  surface.skinIndices = skin.skinIndices;
  surface.skinWeights = skin.skinWeights;
  const skeletonPack = backend.skeleton(rig);
  const mesh = backend.skinnedMesh({ geometry:backend.geometry(surface), material:backend.material(animalMaterialIntent(species, profile)), skeletonPack, name:`single_mesh_${species}_${data.id || "wild"}` });
  const stats = animalCombatStats(species, data);
  backend.mark(mesh, {
    wildlifeActor:true, species, displayName:displayName(species), targetName:displayName(species),
    debugName:`single_mesh_realistic_${species}_${data.id || "wild"}`, profile,
    proceduralSkinnedAnimal:true, singleMeshAnimal:true, renderMeshCount:1, renderBackend:backend.name,
    skinnedMesh:mesh, skeletonPack, boneCount:skeletonPack.bones.length, surfaceMetadata:surface.metadata || null,
    health:{ current:stats.maxHealth, max:stats.maxHealth, armor:stats.armor, evasion:stats.evasion, flightEvasion:stats.flightEvasion, minHitsToKill:stats.minHitsToKill, hitsTaken:0, dead:false },
    faction:species === "fox" ? "hostile" : "neutral", selectableCombatTarget:true, realisticAnimal:true,
    realisticBodyUpgrade:true, opacitySealed:true, attackDifficult:true, airborne:species === "bird",
    kosherEligible:KOSHER.has(species), carcassEnabled:true
  });
  sealMesh(mesh);
  const controller = attachAnimalAnimationController(backend, mesh, animalAnimationBlueprints(species));
  backend.mark(mesh, { animalAnimationController:controller, clipCount:Object.keys(controller.actions || {}).length, meshChildrenAllowed:0 });
  attachCombatMethods(mesh);
  updateHealthState(mesh);
  return mesh;
}

export default createAnimalRenderable;
