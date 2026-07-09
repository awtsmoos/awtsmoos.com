// B"H
/** @file DoorMeshFactory.js @description Visible interaction doors that never become doorway-blocking octree slabs. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
function createDoorMaterial() { const Ctor = THREE.MeshLambertMaterial || THREE.MeshBasicMaterial; return new Ctor({ color:0x4a1f0b, transparent:true, opacity:.92 }); }
export function createDoorMesh(options = {}) { const door = new THREE.Mesh(new THREE.BoxGeometry(options.width || 1.25, options.height || 2.05, options.depth || .08), createDoorMaterial()); door.name = options.name || "mitzvah-world-visible-passable-door"; door.userData = { ...(door.userData || {}), isDoor:true, interactable:true, passableDoorway:true, doorwayThresholdPassable:true, skipOctree:true, noOctree:true, addToOctree:false, isSolid:false, visibleDoorMeshNoCollider:true }; door.castShadow = false; door.receiveShadow = true; door.frustumCulled = false; return door; }
