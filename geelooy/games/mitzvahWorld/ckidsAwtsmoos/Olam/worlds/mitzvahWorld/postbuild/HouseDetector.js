// B"H
/** @file HouseDetector.js @description Finds likely houses in built objects without optional chaining. */
function dataOf(object) { return object && object.userData ? object.userData : {}; }
function text(value) { return String(value || "").toLowerCase(); }
export function isLikelyHouse(object) { const data = dataOf(object); const name = text(object && object.name ? object.name : object && object.id ? object.id : data.nefeshId); const type = text(object && object.type ? object.type : data.nefeshType); return name.includes("house") || name.includes("home") || name.includes("hut") || type.includes("house") || type.includes("home") || type.includes("hut"); }
export function getHouseObject3D(house) { if (!house) return null; if (house.mesh) return house.mesh; if (house.group) return house.group; if (house.object3D) return house.object3D; return house; }
export function hasDoorChild(root) { if (!root || typeof root.traverse !== "function") return false; let found = false; root.traverse(child => { const name = text(child && child.name ? child.name : ""); const data = dataOf(child); if (name.includes("door") || data.isDoor || data.generatedHouseDoor) found = true; }); return found; }
export function scanHouseObjects(scene) { const houses = []; if (!scene || typeof scene.traverse !== "function") return houses; scene.traverse(object => { if (isLikelyHouse(object)) houses.push(object); }); return houses; }
