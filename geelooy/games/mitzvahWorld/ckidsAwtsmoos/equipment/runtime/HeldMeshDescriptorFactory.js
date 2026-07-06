// B"H
/** @file HeldMeshDescriptorFactory.js @description Converts equipment recipes into renderer-friendly descriptors. */
import { heldMeshRecipe } from "./ProceduralHeldMeshCatalog.js";
export function createHeldMeshDescriptor(item = {}, extra = {}) { return { id:`mesh_${item.id || "held"}_${Date.now()}`, itemId:item.id, meshKind:item.meshKind || "procedural", recipe:heldMeshRecipe(item.id), visible:true, castsShadow:true, receivesLight:true, ...extra }; }
export function createProjectileMeshDescriptor(projectile) { return { id:`mesh_${projectile.id}`, itemId:projectile.itemId, meshKind:"procedural:hebrew-letter-projectile", recipe:heldMeshRecipe("hebrewProjectile"), letter:projectile.letter, glow:true, trail:true }; }
export default createHeldMeshDescriptor;
