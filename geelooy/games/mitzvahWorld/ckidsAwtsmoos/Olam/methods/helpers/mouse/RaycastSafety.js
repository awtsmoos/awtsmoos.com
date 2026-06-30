// B"H
/**
 * @file RaycastSafety.js
 * @description Finite-object contract for gameplay raycasts. Unsafe objects are
 * skipped before Three.js sees them; disallowed parents may still contain valid
 * explicit child proxies.
 */
const LIMIT = 36000;
const BAD = new WeakSet();
function finiteNumber(value) { return Number.isFinite(Number(value)); }
function finiteArray(array) { if (!array) return true; for (let i = 0; i < Math.min(array.length, LIMIT); i++) if (!finiteNumber(array[i])) return false; return true; }
function finiteVec(v) { return !v || (finiteNumber(v.x) && finiteNumber(v.y) && finiteNumber(v.z)); }
function finiteSphere(s) { return !s || (finiteVec(s.center) && finiteNumber(s.radius)); }
function finiteBox(b) { return !b || (finiteVec(b.min) && finiteVec(b.max)); }
function finiteMatrix(m) { return !m?.elements || m.elements.every(finiteNumber); }
function ownerAllows(object) { const owner = object?.nivraAwtsmoos; return owner?.interactable === true || owner?.type === "interactiveDoor" || owner?.type === "cottageDoor" || owner?.type === "interactiveNpc"; }
export function markUnsafeRaycastObject(object, reason = "unsafe-raycast-object") { if (!object) return; BAD.add(object); Object.assign(object.userData ||= {}, { skipRaycast:true, raycastSkipReason:reason }); }
export function finiteGeometry(geometry) { if (!geometry) return true; const attr = geometry.attributes?.position; if (!finiteArray(attr?.array)) return false; try { geometry.computeBoundingBox?.(); geometry.computeBoundingSphere?.(); } catch { return false; } return finiteBox(geometry.boundingBox) && finiteSphere(geometry.boundingSphere); }
export function isFiniteObject3D(object) { if (!object || BAD.has(object) || object.userData?.skipRaycast) return false; object.updateMatrixWorld?.(true); if (!finiteVec(object.position) || !finiteVec(object.scale) || !finiteMatrix(object.matrixWorld)) return false; if (!finiteGeometry(object.geometry)) return false; return true; }
export function layerAllows(object, mode = "interaction") { const layer = object?.userData?.interactionLayer; if (object?.userData?.visualOnly || layer === "decor" || layer === "visual-only") return false; if (mode === "interaction") return layer === "explicit-interaction" || object?.userData?.awtsmoosRayProxy || object?.userData?.doorClickTarget || object?.userData?.combatTargetProxy || ownerAllows(object); if (mode === "combat") return object?.userData?.selectableCombatTarget || object?.userData?.combatTargetProxy || layer === "combat-target"; if (mode === "camera") return layer !== "explicit-interaction" && layer !== "combat-target"; return true; }
export function collectSafeRaycastLeaves(root, mode = "interaction", recursive = true) { const out = []; const visit = node => { if (!isFiniteObject3D(node)) return; if (layerAllows(node, mode) && node.raycast && (node.isMesh || node.isLine || node.isPoints || node.isSprite || node.isSkinnedMesh)) out.push(node); if (recursive) for (const child of node.children || []) visit(child); }; visit(root); return out; }
export function safeIntersectObject(raycaster, root, mode = "interaction", recursive = true) { const hits = []; for (const leaf of collectSafeRaycastLeaves(root, mode, recursive)) { try { hits.push(...raycaster.intersectObject(leaf, false)); } catch (error) { markUnsafeRaycastObject(leaf, error?.message || "raycast-error"); } } return hits.filter(hit => Number.isFinite(hit.distance)).sort((a, b) => a.distance - b.distance); }
