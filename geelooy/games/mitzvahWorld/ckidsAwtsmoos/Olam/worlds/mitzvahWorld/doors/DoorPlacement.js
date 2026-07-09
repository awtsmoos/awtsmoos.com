// B"H
/** @file DoorPlacement.js @description Places passable visible doors at house front thresholds. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
export function getDoorPlacementForHouse(house) { const box = new THREE.Box3().setFromObject(house), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3()), frontZ = n(box.min.z, center.z) - .045, doorHeight = Math.max(1.75, Math.min(2.4, n(size.y, 4) * .48)), doorWidth = Math.max(.9, Math.min(1.45, n(size.x, 5) * .2)); return { position:new THREE.Vector3(n(center.x), n(box.min.y) + doorHeight / 2, frontZ), rotation:new THREE.Euler(0, 0, 0), width:doorWidth, height:doorHeight, depth:.08 }; }
