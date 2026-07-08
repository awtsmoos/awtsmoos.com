// B"H
/** @file HeldMeshDescriptorFactory.js @description Creates material-resolved held/projectile mesh descriptors for renderers and tests. */
import { heldMeshRecipe } from "./ProceduralHeldMeshCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { gripOffset } from "./GripOffsetCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { resolveRecipeMaterials } from "./WeaponMaterialResolver.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function descriptorFor({id="item", genre=null, grip="default"}={}, context={}) {
  const recipe = resolveRecipeMaterials(heldMeshRecipe(id || genre || "shortSword"));
  return { id:`held_${id}`, itemId:id, genre, grip, offset:gripOffset(grip), recipe, context, renderable:true, materialGroups:recipe.materialGroups };
}
export function createHeldMeshDescriptor(item={}, context={}) { return descriptorFor({ id:item.id, genre:item.genre, grip:item.grip || "default" }, context); }
export function createProjectileMeshDescriptor(projectile={}) {
  const id = projectile.itemId === "hebrewProjectile" || projectile.projectileType === "hebrew-letter" || projectile.letter ? "hebrewProjectile" : (projectile.itemId || "throwingStone");
  const recipe = resolveRecipeMaterials(heldMeshRecipe(id));
  return { id:`projectile_${projectile.id || id}`, itemId:id, genre:"projectile", grip:"projectile", offset:gripOffset("default"), recipe, context:{ projectile }, renderable:true, materialGroups:recipe.materialGroups };
}
export default createHeldMeshDescriptor;
