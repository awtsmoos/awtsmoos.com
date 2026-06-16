// B"H
/** @file HouseScan.js @description House scanning without optional parser paths. */
function nameOf(object) { return String(object && object.name ? object.name : object && object.id ? object.id : "").toLowerCase(); }
function typeOf(object) { return String(object && object.type ? object.type : "").toLowerCase(); }
export function isHouseObject(object) { const name = nameOf(object), type = typeOf(object); return name.includes("house") || name.includes("hut") || type.includes("house"); }
export function scanHouses(scene) { const houses = []; if (!scene || typeof scene.traverse !== "function") return houses; scene.traverse(object => { if (isHouseObject(object)) houses.push(object); }); return houses; }
