// B"H
/**
 * @file VillageHouseAutoShell.js
 * @description Chapter 638: the visual cottage speaks, and a simple body answers.
 *
 * A house may be ornate, brick by brick, roof by roof, every visible shard
 * singing its own tiny letter into the scene. Collision needs a quieter vessel:
 * a measured shell of wall boxes around the finished visual form. This module
 * listens to the final world matrix, measures the local bounds, and rebuilds
 * clean slabs that the octree can drink without swallowing decorative detail.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

const CORNERS = [
  [0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1],
  [1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1]
];
const point = new THREE.Vector3();
const world = new THREE.Vector3();
const inverse = new THREE.Matrix4();
const localMatrix = new THREE.Matrix4();
const parentInverse = new THREE.Matrix4();
const worldPosition = new THREE.Vector3();
const worldQuaternion = new THREE.Quaternion();
const worldScale = new THREE.Vector3();

function n(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function bounded(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function localValue(worldValue, scale, fallback, min, max) {
  const raw = n(worldValue, fallback);
  const divided = raw / Math.max(0.001, Math.abs(n(scale, 1)));
  return bounded(Number.isFinite(divided) ? divided : fallback, min, max);
}

function cornersOf(box) {
  return CORNERS.map(bits => point.set(
    bits[0] ? box.max.x : box.min.x,
    bits[1] ? box.max.y : box.min.y,
    bits[2] ? box.max.z : box.min.z
  ).clone());
}

function setRootToHouseWorld(root, houseMesh) {
  houseMesh.updateMatrixWorld(true);
  root.parent?.updateMatrixWorld?.(true);
  if (root.parent) {
    parentInverse.copy(root.parent.matrixWorld).invert();
    localMatrix.copy(parentInverse).multiply(houseMesh.matrixWorld);
    localMatrix.decompose(root.position, root.quaternion, root.scale);
  } else {
    houseMesh.matrixWorld.decompose(root.position, root.quaternion, root.scale);
  }
  root.updateMatrixWorld(true);
}

function measureLocalBounds(houseMesh) {
  const bounds = new THREE.Box3();
  houseMesh.updateMatrixWorld(true);
  inverse.copy(houseMesh.matrixWorld).invert();
  houseMesh.traverse(child => {
    if (!child.isMesh || !child.geometry) return;
    if (!child.geometry.boundingBox) child.geometry.computeBoundingBox();
    for (const corner of cornersOf(child.geometry.boundingBox)) {
      world.copy(corner).applyMatrix4(child.matrixWorld).applyMatrix4(inverse);
      bounds.expandByPoint(world);
    }
  });
  return bounds.isEmpty() ? null : bounds;
}

function clearChildren(root) {
  while (root.children.length) {
    const child = root.children.pop();
    child.geometry?.dispose?.();
    child.material?.dispose?.();
  }
}

function wall(root, owner, materialFactory, name, center, size) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), materialFactory());
  mesh.name = name;
  mesh.position.copy(center);
  mesh.nivraAwtsmoos = owner;
  Object.assign(mesh.userData ||= {}, {
    isVillageHouseCollider: true,
    colliderRole: name,
    useAuthoredY: true,
    isSolid: true,
    explicitCollision: true,
    addToOctree: true,
    collisionBody: true,
    keepOriginalCollider: true,
    useExactGeometryCollider: true
  });
  delete mesh.userData.skipRaycast;
  root.add(mesh);
}

function shellPlan(bounds, options, scale) {
  const width = Math.max(0.2, bounds.max.x - bounds.min.x);
  const depth = Math.max(0.2, bounds.max.z - bounds.min.z);
  const height = Math.max(0.5, bounds.max.y - bounds.min.y);
  const minWall = Math.max(0.08, Math.min(width, depth) * 0.025);
  const maxWall = Math.max(minWall, Math.min(width, depth) * 0.16);
  const wallThickness = localValue(options.thickness ?? options.wallThickness, Math.max(scale.x, scale.z), Math.min(width, depth) * 0.045, minWall, maxWall);
  const doorWidth = localValue(options.doorWidth, scale.x, width * 0.24, width * 0.14, width * 0.52);
  const doorHeight = localValue(options.doorClearHeight ?? options.doorHeight, scale.y, height * 0.48, height * 0.34, height * 0.72);
  return { width, depth, height, wallThickness, doorWidth, doorHeight };
}

/**
 * Rebuilds a collider root from the actual final house bounds.
 *
 * @param {{root:THREE.Group,owner:object,houseMesh:THREE.Object3D,options:object,materialFactory:Function}} input
 * Shell rebuild contract.
 * @returns {boolean}
 * True when the visual house was measured and six simple collider slabs were born.
 */
export function rebuildMeasuredHouseShell(input) {
  const { root, owner, houseMesh, options = {}, materialFactory } = input || {};
  if (!root?.isObject3D || !houseMesh?.isObject3D || typeof materialFactory !== "function") return false;
  const bounds = measureLocalBounds(houseMesh);
  if (!bounds) return false;

  clearChildren(root);
  setRootToHouseWorld(root, houseMesh);
  houseMesh.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);

  const plan = shellPlan(bounds, options, worldScale);
  const cx = (bounds.min.x + bounds.max.x) * 0.5;
  const cy = bounds.min.y + plan.height * 0.5;
  const cz = (bounds.min.z + bounds.max.z) * 0.5;
  const sideWidth = Math.max(plan.wallThickness, (plan.width - plan.doorWidth) * 0.5);
  const lintelHeight = Math.max(plan.wallThickness, plan.height - plan.doorHeight);
  const frontZ = bounds.max.z;
  const backZ = bounds.min.z;
  const leftX = bounds.min.x;
  const rightX = bounds.max.x;

  wall(root, owner, materialFactory, "measured_house_back_wall_octree", new THREE.Vector3(cx, cy, backZ), new THREE.Vector3(plan.width, plan.height, plan.wallThickness));
  wall(root, owner, materialFactory, "measured_house_left_wall_octree", new THREE.Vector3(leftX, cy, cz), new THREE.Vector3(plan.wallThickness, plan.height, plan.depth));
  wall(root, owner, materialFactory, "measured_house_right_wall_octree", new THREE.Vector3(rightX, cy, cz), new THREE.Vector3(plan.wallThickness, plan.height, plan.depth));
  wall(root, owner, materialFactory, "measured_house_front_left_wall_octree", new THREE.Vector3(cx - plan.doorWidth * 0.5 - sideWidth * 0.5, cy, frontZ), new THREE.Vector3(sideWidth, plan.height, plan.wallThickness));
  wall(root, owner, materialFactory, "measured_house_front_right_wall_octree", new THREE.Vector3(cx + plan.doorWidth * 0.5 + sideWidth * 0.5, cy, frontZ), new THREE.Vector3(sideWidth, plan.height, plan.wallThickness));
  wall(root, owner, materialFactory, "measured_house_front_lintel_octree", new THREE.Vector3(cx, bounds.min.y + plan.doorHeight + lintelHeight * 0.5, frontZ), new THREE.Vector3(plan.doorWidth, lintelHeight, plan.wallThickness));

  Object.assign(root.userData ||= {}, { measuredHouseShell: true, awaitingVillageFinalTransform: false, measuredBounds: { min: bounds.min.toArray(), max: bounds.max.toArray() } });
  root.updateMatrixWorld(true);
  return true;
}
