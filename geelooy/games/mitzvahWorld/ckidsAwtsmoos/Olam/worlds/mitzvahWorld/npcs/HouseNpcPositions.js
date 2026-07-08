// B"H
/** @file HouseNpcPositions.js @description Places NPCs visibly near houses when houses exist, parser-clear. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function nameOf(object) { return String(object && object.name ? object.name : "").toLowerCase(); }
function isHouseLike(object) { const name = nameOf(object); return name.includes("house") || name.includes("home") || name.includes("hut"); }
function findHouses(scene) { const houses = []; if (!scene || typeof scene.traverse !== "function") return houses; scene.traverse(child => { if (isHouseLike(child)) houses.push(child); }); return houses; }
export function getVisibleNpcPositions(scene) { const houses = findHouses(scene), positions = []; for (const house of houses.slice(0,4)) { const box = new THREE.Box3().setFromObject(house); if (!Number.isFinite(box.min.x) || !Number.isFinite(box.max.x)) continue; const center = box.getCenter(new THREE.Vector3()), frontZ = box.min.z - 1.4; positions.push([center.x - 1.4, 0, frontZ]); positions.push([center.x + 1.4, 0, frontZ]); } if (positions.length) return positions; return [[2.4,0,-3.5],[-2.7,0,-4.2],[4.8,0,2.8],[-5.2,0,3.1]]; }
