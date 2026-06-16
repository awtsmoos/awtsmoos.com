// B"H
/** @file ColliderGeometryFactory.js @description Builds Three collider geometry from manifest records by category. */
import * as THREE from "/games/scripts/build/three.module.js";
import { categorySpec } from "./ColliderCategoryRegistry.js";
export function colliderGeometry(record = {}) { const spec = categorySpec(record.category); if (spec.geometry === "cylinder") { const radius = Number(record.radius || record.size?.[0] || .5), height = Number(record.height || record.size?.[1] || 2); return new THREE.CylinderGeometry(radius, radius, height, 12); } return new THREE.BoxGeometry(...(record.size || [1,1,1])); }
export function colliderMatrix(record = {}, groundY = () => 0) { const p = record.position || [0,0,0], y = Number(p[1] || 0) + groundY(p[0] || 0, p[2] || 0), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Number(record.yaw || 0), 0)); return new THREE.Matrix4().compose(new THREE.Vector3(p[0] || 0, y, p[2] || 0), q, new THREE.Vector3(1,1,1)); }
export function buildColliderGeometry(record, groundY) { const g = colliderGeometry(record); g.applyMatrix4(colliderMatrix(record, groundY)); g.userData = { colliderRecord:record, category:record.category, owner:record.owner, visibleTwin:record.visibleTwin }; return g; }
export default { colliderGeometry, colliderMatrix, buildColliderGeometry };
