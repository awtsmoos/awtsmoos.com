// B"H
/** @file InteriorDoorRuntime.js @description Interior door proof metadata. */
export function markInteriorDoors(root, count = 0) {
  root.userData ||= {};
  root.userData.interiorDoorCount = Math.max(Number(root.userData.interiorDoorCount || 0), Number(count || 0));
  return root.userData.interiorDoorCount;
}

export default { markInteriorDoors };
