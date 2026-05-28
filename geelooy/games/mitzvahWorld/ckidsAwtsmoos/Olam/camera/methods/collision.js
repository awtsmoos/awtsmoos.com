// B"H
/**
 * @file collision.js
 * @description
 * Chapter 12: The Kav stops staring into broken shards.
 *
 * Some visual meshes in the clean desert are not meant for hover raycasts. When
 * the mouse ray touched malformed or non-interactive geometry, THREE warned
 * about NaN values. This file now raycasts only safe interactive vessels and
 * catches bad geometry, so hovering cannot poison the console.
 */
function safeIntersect(raycaster, object) {
  if (!object || object.userData?.skipRaycast) return [];
  try {
    return raycaster.intersectObject(object, true);
  } catch {
    object.userData ||= {};
    object.userData.skipRaycast = true;
    return [];
  }
}

function validNivraTarget(nivra) {
  if (!nivra || nivra.type === 'chossid' || nivra.type === 'spikeHazard' || nivra.type === 'proceduralTerrain') return false;
  const mesh = nivra.modelMesh || nivra.mesh;
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
      const collisionResults = isSceneChanged || !this.previousResults.has(obj)
        ? safeIntersect(this.raycaster, obj)
        : this.previousResults.get(obj);
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
        const targetMesh = nivra.modelMesh || nivra.mesh;
        const hits = safeIntersect(this.mouseRaycaster, targetMesh);
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

  isSceneChanged() {
    return false;
  }
};
