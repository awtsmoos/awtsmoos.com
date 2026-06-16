// B"H
/**
 * @file buildInteractiveElevator.js
 * @description Smart platform that moves to requested floors through parser-clear update binding.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { makeWall } from "../wallUtils.js";
function propsOf(def) { return def && def.props ? def.props : {}; }
function bindMotion(olam, group, def, floorHeight, speed, floors) {
  if (!olam || !olam.tzimtzum || typeof olam.tzimtzum.onUpdate !== "function") return;
  let targetFloor = 0, currentY = 0, moving = false;
  group.userData.goToFloor = floor => { if (floor >= 0 && floor < floors) targetFloor = floor; };
  olam.tzimtzum.onUpdate((t, dt) => { const targetY = targetFloor * floorHeight, diff = targetY - currentY; if (Math.abs(diff) > .05) { moving = true; currentY += Math.sign(diff) * speed * dt; group.position.y = currentY; group.updateMatrixWorld(true); return; } if (!moving) return; currentY = targetY; group.position.y = currentY; moving = false; if (olam.peula) olam.peula("ELEVATOR_ARRIVED", { id:def.id, floor:targetFloor }); });
}
export async function buildInteractiveElevator(scene, physics, def, olam = null) {
  const props = propsOf(def), floors = props.floors || 5, floorHeight = props.floorHeight || 4, width = props.width || 3, depth = props.depth || 3, speed = props.speed || 5;
  const group = new THREE.Group(); group.name = def.id || "interactive_elevator";
  const mat = new THREE.MeshLambertMaterial({ color:0xcccccc }); makeWall(group, mat, 0, .1, 0, width, .2, depth, olam);
  bindMotion(olam, group, def, floorHeight, speed, floors);
  return [group];
}
