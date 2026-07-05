// B"H
/** @file HouseOctreeDiagnostics.js @description Octree proxy diagnostics. */
export function houseOctreeDiagnostics(root) {
  let octreeRegistered = false, broadInvisibleBlockers = 0;
  root?.traverse?.(node => {
    if (node?.userData?.octreeRegistered) octreeRegistered = true;
    if (node?.userData?.broadInvisibleHouseBlocker) broadInvisibleBlockers++;
  });
  return { octreeRegistered, broadInvisibleBlockers };
}

export default { houseOctreeDiagnostics };
