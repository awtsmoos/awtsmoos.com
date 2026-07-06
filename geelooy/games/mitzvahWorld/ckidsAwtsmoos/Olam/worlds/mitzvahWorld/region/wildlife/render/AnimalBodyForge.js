// B"H
/**
 * @file AnimalBodyForge.js
 * @description
 * Chapter 628: the forge is no longer crowded. Scale tables and audit mercy
 * live in their own files while this module performs the single act of birth:
 * create one animal mesh, name it, scale it, and seal its proof.
 */
import { createAnimalRenderable } from "../skinned/AnimalRenderableFactory.js?v=realistic-generated-animals-20260706-bh1";
import { countMeshes, softAuditAnimal } from "./AnimalSoftAudit.js?v=animal-forge-split-20260628-bh1";
import { displayNameFor, scaleFor } from "./AnimalBuildTables.js?v=animal-forge-split-20260628-bh1";

function animalName(species, data = {}) {
  return `single_mesh_animal_${species}_${data.id || "wild"}`;
}

function debugName(species, data = {}) {
  return `single_mesh_opaque_realistic_${species}_${data.id || "wild"}`;
}

function sealAnimalMetadata(mesh, species, data, renderMeshCount) {
  const displayName = displayNameFor(species);
  Object.assign(mesh.userData, {
    displayName,
    targetName: displayName,
    debugName: debugName(species, data),
    singleMeshAnimal: true,
    renderMeshCount,
    normalizedSpeciesScale: mesh.scale.x,
    opacitySealed: true,
    wildlifeAuditSoftened: true
  });
}

export function buildAnimal(species = "rabbit", data = {}) {
  const mesh = createAnimalRenderable(species, data);
  mesh.name = animalName(species, data);
  mesh.scale.multiplyScalar(scaleFor(species, data));

  const renderMeshCount = countMeshes(mesh);
  sealAnimalMetadata(mesh, species, data, renderMeshCount);
  mesh.userData.audit = {
    ...softAuditAnimal(mesh),
    singleMeshVerified: renderMeshCount === 1,
    renderMeshCount
  };

  return mesh;
}

export default buildAnimal;
