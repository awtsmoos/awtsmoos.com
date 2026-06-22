// B"H
/**
 * @file AnimalBodyForge.js
 * @description
 * Single-mesh animal facade. The previous readability core added many child
 * meshes; the new covenant returns exactly the one compiled animal mesh. The
 * Awtsmoos lets realism live in vertices, bones, material intent, and userData,
 * not in a pile of extra boxes glued to a fox.
 */
import { createAnimalRenderable } from "../skinned/AnimalRenderableFactory.js?v=single-mesh-animals-20260621-bh1";
import { assertAnimalRenderable } from "../skinned/AnimalRenderableAudit.js?v=single-mesh-animals-20260621-bh1";

const SCALE = Object.freeze({ rabbit:.55, frog:.42, bird:.45, fox:.72, goat:.85, deer:.95, cow:1.18 });
const DISPLAY = Object.freeze({ rabbit:"Rabbit", frog:"Frog", bird:"Bird", fox:"Fox", goat:"Goat", deer:"Deer", cow:"Cow" });

function countMeshes(root) {
  let count = 0;
  root?.traverse?.(child => { if (child?.isMesh || child?.isSkinnedMesh) count += 1; });
  return count;
}

export function buildAnimal(species = "rabbit", data = {}) {
  const mesh = createAnimalRenderable(species, data);
  const displayName = DISPLAY[species] || "Animal";
  mesh.name = `single_mesh_animal_${species}_${data.id || "wild"}`;
  mesh.scale.multiplyScalar(Number.isFinite(Number(data.visualScale)) ? Number(data.visualScale) : SCALE[species] || .65);
  Object.assign(mesh.userData, {
    displayName,
    targetName:displayName,
    debugName:`single_mesh_opaque_realistic_${species}_${data.id || "wild"}`,
    singleMeshAnimal:true,
    renderMeshCount:countMeshes(mesh),
    normalizedSpeciesScale:mesh.scale.x,
    opacitySealed:true
  });
  mesh.userData.audit = { ...assertAnimalRenderable(mesh), singleMeshVerified:countMeshes(mesh) === 1, renderMeshCount:countMeshes(mesh) };
  return mesh;
}

export default buildAnimal;
