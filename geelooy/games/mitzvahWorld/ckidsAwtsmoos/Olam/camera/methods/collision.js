// B"H
/**
 * @file collision.js
 * @description
 * Chapter 97: the ray refuses NaN geometry after dialogue.
 * The Awtsmoos appoints a stricter gate: no recursive raycast may touch a mesh
 * unless its matrix, position attributes, and bounds are finite. Broken meshes
 * are marked once, skipped forever, and the user receives diagnostics instead
 * of `three.core.js NAN VALUE FOUND` explosions.
 */
import { diagThrottle } from "../../../utils/AwtsmoosDiagnostics.js?v=village-diagnostics-20260612-bh1";

function finiteArray(arr, limit = 24000) {
  if (!arr) return true;
  const max = Math.min(arr.length, limit);
  for (let i = 0; i < max; i += 1) if (!Number.isFinite(arr[i])) return false;
  return true;
}
function geometryIsFinite(geometry) {
  if (!geometry) return true;
  const pos = geometry.attributes?.position?.array;
  if (!finiteArray(pos)) return false;
  geometry.computeBoundingBox?.(); geometry.computeBoundingSphere?.();
  const b = geometry.boundingBox, s = geometry.boundingSphere;
  return (!b || [b.min.x, b.min.y, b.min.z, b.max.x, b.max.y, b.max.z].every(Number.isFinite)) && (!s || [s.center.x, s.center.y, s.center.z, s.radius].every(Number.isFinite));
}
function matrixFinite(object) { const e = object?.matrixWorld?.elements; return !e || e.every(Number.isFinite); }
function markUnsafe(object, reason) { if (!object) return; object.userData ||= {}; object.userData.skipRaycast = true; object.userData.raycastSkipReason = reason; diagThrottle("raycast-skip", { name: object.name, reason }, 1200, "warn"); }
function targetSafe(object) {
  if (!object || object.userData?.skipRaycast) return false;
  object.updateMatrixWorld?.(true);
  if (!matrixFinite(object)) { markUnsafe(object, "nan-matrix"); return false; }
  if (object.geometry && !geometryIsFinite(object.geometry)) { markUnsafe(object, "nan-geometry"); return false; }
  return true;
}
function collectLeaves(object, recursive) {
  const leaves = [];
  const visit = child => {
    if (!targetSafe(child)) return;
    if (child.raycast && (child.isMesh || child.isLine || child.isPoints || child.isSprite)) leaves.push(child);
    if (recursive) for (const sub of child.children || []) visit(sub);
  };
  visit(object);
  return leaves;
}
function safeIntersect(raycaster, object, recursive = false) {
  if (!targetSafe(object)) return [];
  const hits = [];
  for (const target of collectLeaves(object, recursive)) {
    try { hits.push(...raycaster.intersectObject(target, false)); }
    catch (error) { markUnsafe(target, error?.message || "raycast-error"); }
  }
  hits.sort((a, b) => a.distance - b.distance);
  return hits;
}
function isNpcLike(nivra) { return nivra?.type === "interactiveNpc" || nivra?.type === "customNpc" || nivra?.type === "medabeir"; }
function targetForNivra(nivra) { if (!nivra || nivra.type === 'chossid' || nivra.type === 'spikeHazard' || nivra.type === 'proceduralTerrain') return null; if (nivra.raycastMesh) return nivra.raycastMesh; if (nivra.interactionMesh) return nivra.interactionMesh; if (isNpcLike(nivra)) return null; return nivra.mesh || nivra.modelMesh || null; }
function validNivraTarget(nivra) { const mesh = targetForNivra(nivra); return !!mesh && !mesh.userData?.skipRaycast; }

export default {
  updateSceneObjects(newObjects) { this.objectsInScene = newObjects; this.previousResults.clear(); },
  performOptimizedRaycasting(isCorrected) {
    const isSceneChanged = this.isSceneChanged();
    for (const obj of this.objectsInScene) {
      if (!obj || obj.userData?.skipRaycast) continue;
      const collisionResults = isSceneChanged || !this.previousResults.has(obj) ? safeIntersect(this.raycaster, obj, true) : this.previousResults.get(obj);
      this.previousResults.set(obj, collisionResults);
      if (collisionResults.length > 0) {
        const distanceToObject = collisionResults[0].distance - this.offsetFromWall;
        if (Number.isFinite(distanceToObject) && distanceToObject < this.correctedDistance) { this.correctedDistance = distanceToObject; isCorrected = true; }
      }
    }
    return isCorrected;
  },
  getHovered(startAlternative, directionAlternative) {
    if (startAlternative && directionAlternative) this.mouseRaycaster.set(startAlternative, directionAlternative.multiplyScalar(-1)); else this.mouseRaycaster.setFromCamera(this.olam.pointer, this.camera);
    let closest = null;
    if (this.olam.interactableNivrayim) {
      for (const nivra of this.olam.interactableNivrayim) {
        if (!validNivraTarget(nivra)) continue;
        const targetMesh = targetForNivra(nivra);
        const recursive = !targetMesh.userData?.awtsmoosRayProxy && !isNpcLike(nivra);
        const hits = safeIntersect(this.mouseRaycaster, targetMesh, recursive);
        if (hits.length > 0) { const hit = hits[0]; if (!closest || hit.distance < closest.distance) closest = { distance: hit.distance, point: hit.point, object: hit.object, nivraAwtsmoos: nivra }; }
      }
    }
    if (this.olam.interactiveOctree) {
      const oct = this.olam.interactiveOctree.rayIntersect(this.mouseRaycaster.ray);
      if (oct && Number.isFinite(oct.distance) && (!closest || oct.distance < closest.distance)) { oct.point = oct.point || oct.position; if (oct.triangle) oct.object = oct.triangle.sourceMesh || oct.object; if (oct.object?.nivraAwtsmoos) oct.nivraAwtsmoos = oct.object.nivraAwtsmoos; closest = oct; }
    }
    return closest || null;
  },
  isSceneChanged() { return false; }
};
