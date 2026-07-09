// B"H
/**
 * @file fromGraphNode.js
 * @description
 * Chapter 141: Explicit collision matter overrides decorative suspicion.
 *
 * The previous gate rejected names containing `village` before asking whether
 * the mesh was an authored collision body. That made house/fence boxes reach
 * `addObject()` and still insert zero triangles. Now the Awtsmoos judges the
 * inner kav first: explicit collision bodies enter even when their owner is a
 * village Nivra. Decorative visuals remain excluded.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

const MAX_TRIANGLES_PER_MESH = 10000;
const SOLID_TYPES = new Set(["SolidBlock", "MovingPlatform"]);
const DECORATIVE_TYPES = new Set([
  "Coin", "Chossid", "VillagePictureProp", "ProceduralSky", "ProceduralTerrain",
  "GrassPatch", "SpikeField", "FallResetTrigger", "TzedakahBox", "InteractiveDoor"
]);
const DECORATIVE_NAME_PARTS = ["coin", "chossid", "player", "grass", "lava", "sky", "particle", "spark"];
const scratchV1 = new THREE.Vector3();
const scratchV2 = new THREE.Vector3();
const scratchV3 = new THREE.Vector3();
const scratchSize = new THREE.Vector3();

function lower(value) { return String(value || "").toLowerCase(); }
function hasExplicitCollisionMatter(obj) {
  const data = obj.userData || {};
  return data.isSolid === true || data.collisionBody === true || data.addToOctree === true || data.explicitCollision === true || data.isBuilding === true;
}
function resolveAwtsmoosType(obj) {
  let cursor = obj;
  while (cursor) {
    const data = cursor.userData || {};
    const ref = cursor.nivraAwtsmoos || data.nivraAwtsmoos || data.nivra || data.owner;
    const type = data.awtsmoosType || data.className || data.type || ref?.constructor?.name || ref?.type;
    if (type) return String(type);
    cursor = cursor.parent;
  }
  return "";
}
function isDecorativeMesh(obj, type) {
  const data = obj.userData || {};
  if (data.skipOctree || data.noOctree || data.addToOctree === false || data.skipRaycast) return true;
  if (data.isPlayer || data.isNpc || data.isLiving || data.isSphere || data.isParticle) return true;
  if (DECORATIVE_TYPES.has(type)) return true;
  const name = lower(obj.name);
  return DECORATIVE_NAME_PARTS.some(part => name.includes(part));
}
function shouldEnterOctree(obj) {
  const type = resolveAwtsmoosType(obj);
  if (SOLID_TYPES.has(type)) return true;
  if (hasExplicitCollisionMatter(obj)) return !obj.userData?.skipOctree && !obj.userData?.noOctree && obj.userData?.addToOctree !== false && !obj.userData?.skipRaycast;
  if (isDecorativeMesh(obj, type)) return false;
  return false;
}
function thickenFlatBox(box) {
  box.getSize(scratchSize);
  if (scratchSize.y < 0.1) { box.min.y -= 0.5; box.max.y += 0.5; }
  if (scratchSize.x < 0.01) { box.min.x -= 0.01; box.max.x += 0.01; }
  if (scratchSize.z < 0.01) { box.min.z -= 0.01; box.max.z += 0.01; }
  return box;
}
function addMeshTriangles(octree, obj) {
  const count = obj.geometry.index ? obj.geometry.index.count : obj.geometry.attributes.position.count;
  const limit = obj.userData?.largeCollisionBody || obj.userData?.isBuilding ? 100000 : MAX_TRIANGLES_PER_MESH;
  if (count > limit * 3) {
    console.warn(`B"H - Skipping oversized collision mesh [${obj.name}] with ${count / 3} triangles.`);
    return;
  }
  if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
  const box = thickenFlatBox(obj.geometry.boundingBox.clone().applyMatrix4(obj.matrixWorld));
  octree.box.union(box);
  const geometry = obj.geometry.index ? obj.geometry.toNonIndexed() : obj.geometry;
  const pos = geometry.attributes.position;
  if (!pos) return;
  let added = 0;
  for (let i = 0; i < pos.count; i += 3) {
    scratchV1.fromBufferAttribute(pos, i).applyMatrix4(obj.matrixWorld);
    scratchV2.fromBufferAttribute(pos, i + 1).applyMatrix4(obj.matrixWorld);
    scratchV3.fromBufferAttribute(pos, i + 2).applyMatrix4(obj.matrixWorld);
    if ([scratchV1, scratchV2, scratchV3].some(v => !Number.isFinite(v.x) || !Number.isFinite(v.y) || !Number.isFinite(v.z))) continue;
    const triangle = new THREE.Triangle(scratchV1.clone(), scratchV2.clone(), scratchV3.clone());
    triangle.sourceMesh = obj;
    octree.allTriangles.push(triangle);
    added += 1;
  }
  if (obj.geometry.index) geometry.dispose();
  if (obj.userData?.collisionBody) console.info('B"H | OCTREE_EXPLICIT_COLLISION_TRIANGLES', { name: obj.name, added });
}

export default {
  fromGraphNode(group) {
    if (!group) return;
    group.updateMatrixWorld(true);
    group.traverse(obj => {
      if (!obj.isMesh || !obj.geometry || !shouldEnterOctree(obj)) return;
      addMeshTriangles(this, obj);
    });
    this.isBuilt = false;
    if (!this._isManaged) this.build();
  }
};
