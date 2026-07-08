// B"H
/** @file ProjectileVisualRuntime.js @description Hebrew projectiles receive glowing visual descriptors and trails. */
import { createProjectileMeshDescriptor } from "../runtime/HeldMeshDescriptorFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { buildThreeHeldMesh } from "./ThreeHeldMeshBuilder.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export class ProjectileVisualRuntime {
  constructor(runtime) { this.runtime = runtime; this.visuals = new Map(); }
  create(projectile, THREE = globalThis.THREE) { const descriptor = createProjectileMeshDescriptor(projectile); const object = buildThreeHeldMesh(descriptor, THREE); object.name = `letter_${projectile.letter}_${projectile.id}`; const visual = { id:descriptor.id, projectileId:projectile.id, letter:projectile.letter, object, descriptor, trail:[projectile.origin] }; this.visuals.set(projectile.id, visual); this.runtime?.registerEntity?.({ id:descriptor.id, kind:"projectileVisual", tags:["projectileVisual", projectile.letter], descriptor }); return visual; }
  trail(projectile) { const visual=this.visuals.get(projectile.id); if (visual) visual.trail.push(projectile.position); return visual; }
  impact(projectileId) { const visual=this.visuals.get(projectileId); if (visual?.object) visual.object.visible=false; return visual; }
  snapshot() { return { count:this.visuals.size, visuals:[...this.visuals.values()].map(v => ({ projectileId:v.projectileId, letter:v.letter, trail:v.trail.length })) }; }
}
export function createProjectileVisualRuntime(runtime) { return new ProjectileVisualRuntime(runtime); }
export default createProjectileVisualRuntime;
