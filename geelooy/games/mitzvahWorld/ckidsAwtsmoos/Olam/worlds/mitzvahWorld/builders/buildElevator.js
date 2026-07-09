// B"H
/**
 * @file buildElevator.js
 * @description Moving light platform with parser-clear tzimtzum binding.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { makeWall } from "./wallUtils.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
function propsOf(def) { return def && def.props ? def.props : {}; }
function triple(value, fallback) { return Array.isArray(value) ? value : fallback; }
function bindElevator(olam, group, py, startHeight, endHeight, speed, holdTime) {
  if (!olam || !olam.tzimtzum || typeof olam.tzimtzum.onUpdate !== "function") return;
  let currentY = startHeight, direction = 1, waitTimer = 0;
  olam.tzimtzum.onUpdate((t, delta) => { if (waitTimer > 0) { waitTimer -= delta; return; } currentY += direction * speed * delta; if (currentY >= endHeight) { currentY = endHeight; direction = -1; waitTimer = holdTime; } else if (currentY <= startHeight) { currentY = startHeight; direction = 1; waitTimer = holdTime; } group.position.y = py + currentY; group.updateMatrixWorld(true); });
}
export async function buildElevator(scene, physics, def, olam = null) {
  const props = propsOf(def), color = props.color || 0xc0c0c0, width = props.width || 3, depth = props.depth || 3, startHeight = props.startHeight || 0, endHeight = props.endHeight || 20, speed = props.speed || 2, holdTime = props.holdTime || 2;
  const position = triple(def.position, [0,0,0]), mat = new THREE.MeshLambertMaterial({ color });
  const group = new THREE.Group(); group.position.set(position[0], position[1] + startHeight, position[2]); group.name = def.id || "moving_elevator";
  makeWall(group, mat, 0, .1, 0, width, .2, depth, olam);
  const track = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, endHeight - startHeight, 8), new THREE.MeshBasicMaterial({ color:0x00ffff, transparent:true, opacity:.3 }));
  track.position.set(0, (endHeight - startHeight) / 2 - startHeight, 0); group.add(track);
  bindElevator(olam, group, position[1], startHeight, endHeight, speed, holdTime);
  return [group];
}
