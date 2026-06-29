// B"H
/**
 * @file VillageHouseRuntimeReport.js
 * @description
 * A village must prove its houses are not hidden thoughts. This report counts
 * actual attached cottage roots and publishes them for Chrome/debug audits.
 */
function scopeOf(olam) {
  return olam?.aysh?.window || globalThis;
}

function meshCount(root) {
  let count = 0;
  root?.traverse?.(child => {
    if (child?.isMesh || child?.isInstancedMesh) count += 1;
  });
  return count;
}

function visibleChildCount(root) {
  let count = 0;
  root?.traverse?.(child => {
    if ((child?.isMesh || child?.isInstancedMesh) && child.visible !== false) count += 1;
  });
  return count;
}

function houseRow(house) {
  return {
    id: house.userData?.houseId || house.name,
    name: house.name,
    x: Number(house.position?.x || 0),
    y: Number(house.position?.y || 0),
    z: Number(house.position?.z || 0),
    visible: house.visible !== false,
    meshes: meshCount(house),
    visibleMeshes: visibleChildCount(house),
    starterVisibleHouse: Boolean(house.userData?.house?.starterVisibleHouse)
  };
}

export function buildVillageHouseReport(root, olam) {
  const houses = (root?.children || []).filter(child => child?.userData?.cottageBuilding === true);
  const rows = houses.map(houseRow);
  return {
    seal: "B'H VILLAGE_HOUSE_REPORT",
    houseCount: houses.length,
    visibleHouseCount: rows.filter(row => row.visible && row.visibleMeshes > 0).length,
    starterVisibleCount: rows.filter(row => row.starterVisibleHouse).length,
    meshCount: rows.reduce((sum, row) => sum + row.meshes, 0),
    visibleMeshCount: rows.reduce((sum, row) => sum + row.visibleMeshes, 0),
    houses: rows,
    at: Date.now(),
    olamName: olam?.name || "mitzvahWorld"
  };
}

export function publishVillageHouseReport(root, olam) {
  const report = buildVillageHouseReport(root, olam);
  root.userData.houseVisibilityReport = report;
  const scope = scopeOf(olam);
  scope.__MITZVAH_VILLAGE_HOUSE_REPORT__ = report;
  scope.__MITZVAH_VILLAGE_HOUSE_ROOT__ = root;
  console.log("B\"H VILLAGE_HOUSE_REPORT", report);
  return report;
}

export default publishVillageHouseReport;
