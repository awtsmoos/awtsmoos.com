// B"H
/** @file MultiStoryHouseMeshes.js @description Adds visible second floors and stairs. */
import * as THREE from "/games/scripts/build/three.module.js";

const floorMat = new THREE.MeshLambertMaterial({ color:0x9b7244 });
const stairMat = new THREE.MeshLambertMaterial({ color:0x7b532c });

export function addMultiStoryMeshes(group, house = {}, spec = {}, plan = {}) {
  if (!plan.enabled) return [];
  const made = [], width = Number(spec.width || 9), depth = Number(spec.depth || 8), y = plan.floorHeight;
  const floor = new THREE.Mesh(new THREE.BoxGeometry(width * .86, .16, depth * .78), floorMat);
  floor.name = `${house.id || "house"}_second_floor_walkable`;
  floor.position.set(0, y, 0);
  Object.assign(floor.userData ||= {}, { cottageSecondFloor:true, walkableFloor:true, floor:true, skipOctree:true, noOctree:true });
  group.add(floor); made.push(floor);
  for (let i = 0; i < plan.stair.steps; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(plan.stair.width, .14, plan.stair.depth / plan.stair.steps), stairMat);
    step.name = `${house.id || "house"}_walkable_stair_${i}`;
    step.position.set(plan.stair.x, .18 + y * (i + 1) / plan.stair.steps, plan.stair.z + i * (plan.stair.depth / plan.stair.steps));
    Object.assign(step.userData ||= {}, { cottageStair:true, walkableStair:true, skipOctree:true, noOctree:true });
    group.add(step); made.push(step);
  }
  return made;
}

export default addMultiStoryMeshes;
