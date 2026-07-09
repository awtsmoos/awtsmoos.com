// B"H
/** @file ThreeSceneNodeAdapter.js @description Scene graph wrappers for the current Three backend. */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
export function createThreeGroup(name = "awtsmoos_group") { const g = new THREE.Group(); g.name = name; g.userData.awtsmoosSceneNode = true; return g; }
export function createThreeMesh(geometry, material, name = "awtsmoos_mesh") { const m = new THREE.Mesh(geometry, material); m.name = name; m.castShadow = true; m.receiveShadow = true; return m; }
export function markThree(object, data = {}) { if (!object) return object; if (!object.userData) object.userData = {}; Object.assign(object.userData, data); return object; }
export default { createThreeGroup, createThreeMesh, markThree };
