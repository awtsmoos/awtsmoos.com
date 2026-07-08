// B"H
/** @file ThreeSkeletonAdapter.js @description Plain Awtsmoos bone blueprints become Three bones only here. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function v3(p = [0,0,0]) { return new THREE.Vector3(Number(p[0]) || 0, Number(p[1]) || 0, Number(p[2]) || 0); }
function makeBone(def) { const b = new THREE.Bone(); b.name = def.id; const p = v3(def.position); b.position.copy(p); b.userData.awtsmoosBone = true; b.userData.tags = def.tags || []; return b; }
export function createThreeSkeleton(blueprint = {}) {
  const defs = blueprint.bones || [], map = {}, bones = [];
  defs.forEach(def => { const bone = makeBone(def); map[def.id] = bone; bones.push(bone); });
  defs.forEach(def => { const bone = map[def.id], parent = map[def.parent]; if (parent) parent.add(bone); });
  const rootBone = map[blueprint.root || "root"] || bones[0] || new THREE.Bone();
  const skeleton = new THREE.Skeleton(bones);
  skeleton.calculateInverses();
  return { rootBone, skeleton, bones, boneMap:map, blueprint };
}
export default createThreeSkeleton;
