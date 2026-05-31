// B"H
/**
 * @file collision.js
 * @description
 * Chapter 96: the Kav refuses to stare into every eyelash of an NPC model.
 * The Awtsmoos appoints one humble proxy-box as the interaction vessel, so
 * mobile raycasting remains light, finite, and honest. Model meshes are garments;
 * ray targets are simple signs.
 */
function geometryIsFinite(geometry) {
  const arr = geometry?.attributes?.position?.array;
  if (!arr) return true;
  const limit = Math.min(arr.length, 12000);
  for (let i = 0; i < limit; i += 1) if (!Number.isFinite(arr[i])) return false;
  return true;
}

function markUnsafe(object, reason) {
  object.userData ||= {};
  object.userData.skipRaycast = true;
  object.userData.raycastSkipReason = reason;
}

function raycastTargetIsFinite(object) {
  let ok = true;
  object?.traverse?.(child => {
    if (!ok || child.userData?.skipRaycast) return;
    if (child.geometry && !geometryIsFinite(child.geometry)) {
      markUnsafe(child, "nan-geometry");
      ok = false;
    }
  });
  return ok;
}

function safeIntersect(raycaster, object, recursive = false) {
  if (!object || object.userData?.skipRaycast || !raycastTargetIsFinite(object)) return [];
  try { return raycaster.intersectObject(object, recursive); }
  catch (error) { markUnsafe(object, error?.message || "raycast-error"); return []; }
}

function isNpcLike(nivra) {
  return nivra?.type === "interactiveNpc" || nivra?.type === "customNpc" || nivra?.type === "medabeir";
}

function targetForNivra(nivra) {
  if (!nivra || nivra.type === 'chossid' || nivra.type === 'spikeHazard' || nivra.type === 'proceduralTerrain') return null;
  if (nivra.raycastMesh) return nivra.raycastMesh;
  if (nivra.interactionMesh) return nivra.interactionMesh;
  if (isNpcLike(nivra)) return null;
  return nivra.mesh || nivra.modelMesh || null;
}

function validNivraTarget(nivra) {
  const mesh = targetForNivra(nivra);
  return !!mesh && !mesh.userData?.skipRaycast;
}

export default {
  updateSceneObjects(newObjects) {
    this.objectsInScene = newObjects;
    this.previousResults.clear();
  },

  performOptimizedRaycasting(isCorrected) {
    const isSceneChanged = this.isSceneChanged();
    for (const obj of this.objectsInScene) {
      if (!obj || obj.userData?.skipRaycast) continue;
      const collisionResults = isSceneChanged || !this.previousResults.has(obj) ? safeIntersect(this.raycaster, obj, true) : this.previousResults.get(obj);
      this.previousResults.set(obj, collisionResults);
      if (collisionResults.length > 0) {
        const distanceToObject = collisionResults[0].distance - this.offsetFromWall;
        if (Number.isFinite(distanceToObject) && distanceToObject < this.correctedDistance) {
          this.correctedDistance = distanceToObject;
          isCorrected = true;
        }
      }
    }
    return isCorrected;
  },

  getHovered(startAlternative, directionAlternative) {
    if (startAlternative && directionAlternative) this.mouseRaycaster.set(startAlternative, directionAlternative.multiplyScalar(-1));
    else this.mouseRaycaster.setFromCamera(this.olam.pointer, this.camera);
    let closest = null;
    if (this.olam.interactableNivrayim) {
      for (const nivra of this.olam.interactableNivrayim) {
        if (!validNivraTarget(nivra)) continue;
        const targetMesh = targetForNivra(nivra);
        const recursive = !targetMesh.userData?.awtsmoosRayProxy && !isNpcLike(nivra);
        const hits = safeIntersect(this.mouseRaycaster, targetMesh, recursive);
        if (hits.length > 0) {
          const hit = hits[0];
          if (!closest || hit.distance < closest.distance) closest = { distance: hit.distance, point: hit.point, object: hit.object, nivraAwtsmoos: nivra };
        }
      }
    }
    if (this.olam.interactiveOctree) {
      const oct = this.olam.interactiveOctree.rayIntersect(this.mouseRaycaster.ray);
      if (oct && (!closest || oct.distance < closest.distance)) {
        oct.point = oct.point || oct.position;
        if (oct.triangle) oct.object = oct.triangle.sourceMesh || oct.object;
        if (oct.object?.nivraAwtsmoos) oct.nivraAwtsmoos = oct.object.nivraAwtsmoos;
        closest = oct;
      }
    }
    return closest || null;
  },

  isSceneChanged() { return false; }
};
