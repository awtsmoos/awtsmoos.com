// B"H
/** @file WeaponMaterialResolver.js @description Resolves every procedural weapon part into renderable material metadata. */
import { proceduralMaterial, materialGroups } from "./ProceduralMaterialCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function resolvePartMaterial(part={}){ const material=proceduralMaterial(part.material); return {...part,materialProfile:material,textureHint:material.textureHint,normalHint:material.normalHint,materialGroup:material.group}; }
export function resolveRecipeMaterials(recipe={}){ const parts=(recipe.parts||[]).map(resolvePartMaterial); return {...recipe,parts,materialGroups:materialGroups(parts),materialSummary:Object.fromEntries(parts.map(p=>[p.material,p.materialProfile.group]))}; }
export function weaponMaterialReport(descriptor={}){ const recipe=resolveRecipeMaterials(descriptor.recipe||{}); return {itemId:descriptor.itemId,groups:recipe.materialGroups,materials:recipe.parts.map(p=>({kind:p.kind,material:p.material,group:p.materialGroup,textureHint:p.textureHint,metalness:p.materialProfile.metalness,roughness:p.materialProfile.roughness,emissive:p.materialProfile.emissive}))}; }
export default resolveRecipeMaterials;
