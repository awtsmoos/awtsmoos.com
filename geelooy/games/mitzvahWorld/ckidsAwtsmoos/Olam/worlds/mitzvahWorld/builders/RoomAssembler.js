// B"H
/**
 * @file RoomAssembler.js
 * @description Assembles rooms from parser-clear walls, windows, floors, and manifest furniture.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { makeWall, makeFloor, makeWindow } from "./wallUtils.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { GeometryEngine } from "../GeometryEngine.js?compact=true&v=awtsmoos-geometry-engine-20260614-bh2";
import { FURNITURE_BLUEPRINTS } from "../data/manifests/FurnitureManifest.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
function roomWalls(roomDef) { return roomDef && roomDef.walls ? roomDef.walls : {}; }
function wallData(walls, key) { return walls && walls[key] ? walls[key] : {}; }
function hidden(walls, key) { return wallData(walls, key).hidden === true; }
function hasWindow(walls, key) { return wallData(walls, key).hasWindow === true; }
function hasDoor(walls, key) { return wallData(walls, key).hasDoor === true; }
function triple(value, fallback) { return Array.isArray(value) ? value : fallback; }
function addNorth(roomGroup, wallMat, walls, rw, rh, hd, mh, t, olam) { if (hidden(walls,"north")) return; makeWall(roomGroup, wallMat, 0, mh, -hd, rw, rh, t, olam); if (hasWindow(walls,"north")) makeWindow(roomGroup, 0, mh, -hd - .01, 1, 1, "z"); }
function addSouth(roomGroup, wallMat, walls, rw, rh, hd, hw, mh, t, olam) { if (hidden(walls,"south")) return; const doorW = hasDoor(walls,"south") ? 1.2 : 0; if (doorW > 0) { const sideW = (rw - doorW) / 2; makeWall(roomGroup, wallMat, -(hw - sideW / 2), mh, hd, sideW, rh, t, olam); makeWall(roomGroup, wallMat, (hw - sideW / 2), mh, hd, sideW, rh, t, olam); makeWall(roomGroup, wallMat, 0, rh - .5, hd, doorW, 1, t, olam); } else makeWall(roomGroup, wallMat, 0, mh, hd, rw, rh, t, olam); }
function addFurniture(roomGroup, furniture, olam) { for (const item of furniture || []) { const blueprint = FURNITURE_BLUEPRINTS[item.type]; if (!blueprint) continue; const furnitureGroup = GeometryEngine.manifest(blueprint, { vars:item.props || {}, olam }); const p = triple(item.position, [0,0,0]); furnitureGroup.position.set(p[0], p[1], p[2]); roomGroup.add(furnitureGroup); } }
export async function assembleRoom(parentGroup, roomDef, materials, olam = null) {
  const wallMat = materials.wallMat, floorMat = materials.floorMat, position = triple(roomDef.position, [0,0,0]), size = triple(roomDef.size, [6,3,6]), walls = roomWalls(roomDef);
  const rw = size[0], rh = size[1], rd = size[2], t = .2, hw = rw/2, hd = rd/2, mh = rh/2;
  const roomGroup = new THREE.Group(); roomGroup.position.set(position[0], position[1], position[2]); parentGroup.add(roomGroup);
  makeFloor(roomGroup, floorMat, 0, rw, rd, olam); addNorth(roomGroup, wallMat, walls, rw, rh, hd, mh, t, olam); addSouth(roomGroup, wallMat, walls, rw, rh, hd, hw, mh, t, olam);
  if (!hidden(walls,"east")) makeWall(roomGroup, wallMat, hw, mh, 0, t, rh, rd, olam);
  if (!hidden(walls,"west")) makeWall(roomGroup, wallMat, -hw, mh, 0, t, rh, rd, olam);
  addFurniture(roomGroup, roomDef.furniture || [], olam);
  return roomGroup;
}
