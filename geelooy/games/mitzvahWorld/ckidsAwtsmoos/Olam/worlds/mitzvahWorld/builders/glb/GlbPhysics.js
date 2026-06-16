// B"H
/**
 * @file GlbPhysics.js
 * @description Dynamic capsule physics with parser-clear API detection.
 */
function n(value, fallback) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
function worldOf(physics) { return physics && physics.world ? physics.world : null; }
function canRapier(physics) { const world = worldOf(physics); return Boolean(world && typeof world.createRigidBody === "function" && physics.RAPIER); }
export function addDynamicCapsule(physics, x, y, z, physDef = {}) {
  const radius = n(physDef.radius, .4), height = n(physDef.height, 1.6), mass = n(physDef.mass, 70);
  try {
    if (physics && typeof physics.addDynamicCapsule === "function") physics.addDynamicCapsule({ x, y, z }, radius, height, mass);
    else if (canRapier(physics)) { const R = physics.RAPIER, world = worldOf(physics); const desc = R.RigidBodyDesc.dynamic().setTranslation(x, y + height / 2, z); const body = world.createRigidBody(desc); world.createCollider(R.ColliderDesc.capsule(height / 2, radius), body); }
  } catch (error) { console.error("B\"H - GlbPhysics error:", error); }
}
export default addDynamicCapsule;
