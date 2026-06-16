// B"H
/** @file DoorExistence.js @description Door lookup without optional parser paths. */
function keyOf(house) { return house && house.userData && house.userData.houseKey ? house.userData.houseKey : house && house.name ? house.name : "house"; }
export function hasDoorForHouse(scene, house) { const key = keyOf(house); let found = false; if (!scene || typeof scene.traverse !== "function") return false; scene.traverse(child => { const data = child && child.userData ? child.userData : {}; if (data.doorHouseKey === key) found = true; }); return found; }
export default hasDoorForHouse;
