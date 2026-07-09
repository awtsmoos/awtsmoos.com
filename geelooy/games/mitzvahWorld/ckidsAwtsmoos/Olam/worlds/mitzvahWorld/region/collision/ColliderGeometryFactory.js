// B"H
/**
 * @file ColliderGeometryFactory.js
 * @description
 * Builds invisible collider geometry from normalized records. Records produced
 * by GroundedColliderBuilder are already center-based, so this factory never
 * adds terrain height a second time.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { categorySpec } from "./ColliderCategoryRegistry.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

function num(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function sizeOf(record = {}) {
  const size = Array.isArray(record.size) ? record.size : [record.sx, record.sy || record.height, record.sz];
  return [
    Math.max(0.05, num(size[0], 1)),
    Math.max(0.05, num(size[1], 1)),
    Math.max(0.05, num(size[2], 1))
  ];
}

function centerOf(record = {}, groundY = () => 0) {
  if (record.centerBased === true && Array.isArray(record.position)) {
    return new THREE.Vector3(num(record.position[0]), num(record.position[1]), num(record.position[2]));
  }
  const size = sizeOf(record);
  const position = Array.isArray(record.position) ? record.position : [record.x, record.y, record.z];
  const x = num(record.x, num(position[0], 0));
  const z = num(record.z, num(position[2], 0));
  const base = num(record.baseY, groundY(x, z));
  const y = num(position[1], base + size[1] / 2);
  return new THREE.Vector3(x, y, z);
}

export function colliderGeometry(record = {}) {
  const spec = categorySpec(record.category);
  const size = sizeOf(record);
  if (spec.geometry === "cylinder") {
    const radius = Math.max(0.05, num(record.radius, Math.max(size[0], size[2]) / 2));
    return new THREE.CylinderGeometry(radius, radius, size[1], 12);
  }
  return new THREE.BoxGeometry(size[0], size[1], size[2]);
}

export function colliderMatrix(record = {}, groundY = () => 0) {
  const center = centerOf(record, groundY);
  const yaw = num(record.yaw, 0);
  const rotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0));
  return new THREE.Matrix4().compose(center, rotation, new THREE.Vector3(1, 1, 1));
}

export function buildColliderGeometry(record, groundY) {
  const geometry = colliderGeometry(record);
  geometry.applyMatrix4(colliderMatrix(record, groundY));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  geometry.userData = {
    colliderRecord: record,
    category: record.category,
    owner: record.owner,
    visibleTwin: record.visibleTwin,
    centerBased: record.centerBased === true
  };
  return geometry;
}

export function auditColliderGeometryRecord(record = {}) {
  const size = sizeOf(record);
  const center = centerOf(record);
  return {
    ok: size.every(v => Number.isFinite(v) && v > 0) && Number.isFinite(center.x) && Number.isFinite(center.y) && Number.isFinite(center.z),
    centerBased: record.centerBased === true,
    position: [center.x, center.y, center.z],
    size
  };
}

export default {
  colliderGeometry,
  colliderMatrix,
  buildColliderGeometry,
  auditColliderGeometryRecord
};
