// B"H
/**
 * @file collision.js
 * @description Camera and hover raycasts share the finite-object covenant. The
 * camera sees solid world layers; interaction sees only explicit proxies and
 * safe owner-bearing targets.
 */
import { diagThrottle } from "../../../utils/AwtsmoosDiagnostics.js?compact=true&v=village-diagnostics-20260612-bh1";
import { safeIntersectObject } from "../../methods/helpers/mouse/RaycastSafety.js?compact=true&v=reality-raycast-20260629-bh1";

function isNpcLike(nivra) { return ["interactiveNpc", "customNpc", "medabeir"].includes(nivra?.type); }
function targetForNivra(nivra) {
  if (!nivra || nivra.type === "chossid" || nivra.type === "spikeHazard" || nivra.type === "proceduralTerrain") return null;
  return nivra.raycastMesh || nivra.interactionMesh || nivra.mesh || nivra.modelMesh || null;
}
function validNivraTarget(nivra) { const target = targetForNivra(nivra); return Boolean(target && !target.userData?.skipRaycast); }
function interactionRecursive(target, nivra) { return !target.userData?.awtsmoosRayProxy && !target.userData?.doorClickTarget && !isNpcLike(nivra); }

export default {
  updateSceneObjects(newObjects) {
    this.objectsInScene = newObjects || [];
    this.previousResults.clear();
  },

  performOptimizedRaycasting(isCorrected) {
    const changed = this.isSceneChanged();
    for (const obj of this.objectsInScene || []) {
      if (!obj || obj.userData?.skipRaycast) continue;
      const results = changed || !this.previousResults.has(obj) ? safeIntersectObject(this.raycaster, obj, "camera", true) : this.previousResults.get(obj);
      this.previousResults.set(obj, results);
      if (!results.length) continue;
      const distance = results[0].distance - this.offsetFromWall;
      if (Number.isFinite(distance) && distance < this.correctedDistance) { this.correctedDistance = distance; isCorrected = true; }
    }
    return isCorrected;
  },

  getHovered(startAlternative, directionAlternative) {
    if (startAlternative && directionAlternative) this.mouseRaycaster.set(startAlternative, directionAlternative.multiplyScalar(-1));
    else this.mouseRaycaster.setFromCamera(this.olam.pointer, this.camera);
    let closest = null;
    for (const nivra of this.olam.interactableNivrayim || []) {
      if (!validNivraTarget(nivra)) continue;
      const target = targetForNivra(nivra);
      const hits = safeIntersectObject(this.mouseRaycaster, target, "interaction", interactionRecursive(target, nivra));
      if (hits.length && (!closest || hits[0].distance < closest.distance)) closest = { distance:hits[0].distance, point:hits[0].point, object:hits[0].object, nivraAwtsmoos:nivra };
    }
    const oct = this.olam.interactiveOctree?.rayIntersect?.(this.mouseRaycaster.ray);
    if (oct && Number.isFinite(oct.distance) && (!closest || oct.distance < closest.distance)) {
      oct.point = oct.point || oct.position;
      if (oct.triangle) oct.object = oct.triangle.sourceMesh || oct.object;
      if (oct.object?.nivraAwtsmoos) oct.nivraAwtsmoos = oct.object.nivraAwtsmoos;
      closest = oct;
    }
    if (!closest && globalThis.__AWTSMOOS_RAY_DEBUG__) diagThrottle("hover-miss", { targets:(this.olam.interactableNivrayim || []).length }, 1500);
    return closest || null;
  },

  isSceneChanged() { return false; }
};
