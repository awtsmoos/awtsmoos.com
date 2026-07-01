// B"H
/**
 * Purpose: sanitize material options before GPU construction.
 * Owner: SafeMaterialApplier.
 * Inputs: caller material options with possible bad map objects.
 * Outputs: shallow clean option objects with valid texture slots only.
 * Runtime authority: owns no meshes, only material construction hygiene.
 * Performance: one shallow pass, no scene traversal, no allocations per frame.
 * Update order: runs before material creation.
 * Callers: SafeMaterialApplier.apply.
 * Calls: no external systems.
 * Invariants: visible true and opacity finite by default.
 * Failure modes: invalid texture objects become null instead of shader poison.
 * Future: accept color-space normalization flags from terrain manifests.
 */
const TEXTURE_SLOTS = ["map", "normalMap", "emissiveMap", "lightMap"];

export function sanitizeMaterialOptions(options = {}) {
  const clean = { ...(options || {}) };
  for (const slot of TEXTURE_SLOTS) {
    if (clean[slot] && typeof clean[slot] === "object" && !clean[slot].isTexture) clean[slot] = null;
  }
  clean.visible = true;
  clean.opacity = Number.isFinite(Number(clean.opacity)) ? Number(clean.opacity) : 1;
  return clean;
}
