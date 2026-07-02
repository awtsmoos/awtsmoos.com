// B"H
/** @file RaycastSafety.js @description Stops NaN geometry before Three raycast ever touches it. */
const BAD = new WeakSet();
const MAX_FULL = 90000;
const SAMPLE = 1200;
const finite = v => Number.isFinite(Number(v));
const everyFinite = arr => { if (!arr) return true; const n = arr.length || 0; if (n <= MAX_FULL) { for (let i = 0; i < n; i++) if (!finite(arr[i])) return false; return true; } const step = Math.max(1, Math.floor(n / SAMPLE)); for (let i = 0; i < n; i += step) if (!finite(arr[i])) return false; for (let i = Math.max(0, n - 64); i < n; i++) if (!finite(arr[i])) return false; return true; };
const vec = v => !v || (finite(v.x) && finite(v.y) && finite(v.z));
const box = b => !b || (vec(b.min) && vec(b.max));
const sphere = s => !s || (vec(s.center) && finite(s.radius));
const matrix = m => !m?.elements || m.elements.every(finite);
function ownerAllows(object) { const o = object?.nivraAwtsmoos; return o?.interactable === true || ["interactiveDoor", "cottageDoor", "interactiveNpc"].includes(o?.type); }
function fail(object, reason) { if (!object) return false; BAD.add(object); object.userData ||= {}; object.userData.skipRaycast = true; object.userData.raycastSkipReason = reason; object.visible = object.visible !== false ? object.visible : false; return false; }
export function markUnsafeRaycastObject(object, reason = "unsafe-raycast-object") { fail(object, reason); }
function finiteAttribute(attr) { if (!attr) return true; if (!everyFinite(attr.array)) return false; if (!finite(attr.count) || !finite(attr.itemSize)) return false; return true; }
function finiteMorphs(morphs = {}) { for (const list of Object.values(morphs || {})) for (const attr of list || []) if (!finiteAttribute(attr)) return false; return true; }
export function finiteGeometry(geometry, owner = null) {
  if (!geometry) return true;
  if (geometry.__awtsmoosRaycastFinite === true) return true;
  if (geometry.__awtsmoosRaycastFinite === false) return false;
  const attrs = geometry.attributes || {};
  for (const attr of Object.values(attrs)) if (!finiteAttribute(attr)) { geometry.__awtsmoosRaycastFinite = false; return fail(owner, "nan-geometry-attribute"); }
  if (!finiteAttribute(geometry.index)) { geometry.__awtsmoosRaycastFinite = false; return fail(owner, "nan-geometry-index"); }
  if (!finiteMorphs(geometry.morphAttributes)) { geometry.__awtsmoosRaycastFinite = false; return fail(owner, "nan-morph-attribute"); }
  try { if (!sphere(geometry.boundingSphere)) geometry.computeBoundingSphere?.(); if (!box(geometry.boundingBox)) geometry.computeBoundingBox?.(); } catch { geometry.__awtsmoosRaycastFinite = false; return fail(owner, "bad-bounds-compute"); }
  const ok = box(geometry.boundingBox) && sphere(geometry.boundingSphere);
  geometry.__awtsmoosRaycastFinite = ok;
  return ok || fail(owner, "bad-geometry-bounds");
}
export function isFiniteObject3D(object) {
  if (!object || BAD.has(object) || object.userData?.skipRaycast) return false;
  if (!vec(object.position) || !vec(object.scale) || !vec(object.rotation) || !matrix(object.matrix) || !matrix(object.matrixWorld)) return fail(object, "nan-transform");
  try { object.updateMatrixWorld?.(true); } catch { return fail(object, "matrix-update-failed"); }
  if (!matrix(object.matrixWorld)) return fail(object, "nan-world-matrix");
  return finiteGeometry(object.geometry, object);
}
export function layerAllows(object, mode = "interaction") {
  const layer = object?.userData?.interactionLayer;
  if (object?.userData?.visualOnly || layer === "decor" || layer === "visual-only") return false;
  if (mode === "interaction") return layer === "explicit-interaction" || object?.userData?.awtsmoosRayProxy || object?.userData?.doorClickTarget || object?.userData?.combatTargetProxy || ownerAllows(object);
  if (mode === "combat") return object?.userData?.selectableCombatTarget || object?.userData?.combatTargetProxy || layer === "combat-target";
  if (mode === "camera") return layer !== "explicit-interaction" && layer !== "combat-target";
  return true;
}
export function collectSafeRaycastLeaves(root, mode = "interaction", recursive = true) { const out = []; const visit = node => { if (!isFiniteObject3D(node)) return; if (layerAllows(node, mode) && node.raycast && (node.isMesh || node.isLine || node.isPoints || node.isSprite || node.isSkinnedMesh)) out.push(node); if (recursive) for (const child of node.children || []) visit(child); }; visit(root); return out; }
export function safeIntersectObject(raycaster, root, mode = "interaction", recursive = true) { const hits = []; for (const leaf of collectSafeRaycastLeaves(root, mode, recursive)) { try { hits.push(...raycaster.intersectObject(leaf, false)); } catch (error) { markUnsafeRaycastObject(leaf, error?.message || "raycast-error"); } } return hits.filter(hit => Number.isFinite(hit.distance) && vec(hit.point)).sort((a, b) => a.distance - b.distance); }
