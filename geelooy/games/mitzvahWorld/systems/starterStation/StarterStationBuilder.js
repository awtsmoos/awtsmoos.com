// B"H
import STARTER_STATION_ZONE_SPEC from "./StarterStationZoneSpec.js";
function hasObjectApi(olam) { return Boolean(olam && typeof olam.addObject === "function"); }
function makeStationNivra(station) { return { type:"starterStationMarker", name:`starter_station_${station.id}`, id:`starter_station_${station.id}`, position:station.position, label:station.label, task:station.task, userData:{ starterStation:true, stationId:station.id } }; }
export async function ensureStarterStationZone({ olam = null, scene = null, source = null } = {}) {
  const spec = STARTER_STATION_ZONE_SPEC;
  const report = { ok:true, source:source || "postbuild", id:spec.id, name:spec.name, stationCount:spec.stations.length, propCount:spec.props.length, added:0, mode:"report-only", sceneChildrenBefore:Array.isArray(scene?.children) ? scene.children.length : null };
  const nivrayim = spec.stations.map(makeStationNivra);
  olam.__starterStationZone = { spec, nivrayim, report };
  if (!hasObjectApi(olam)) return { ...report, reason:"olam.addObject unavailable; spec/report installed" };
  for (const item of nivrayim) {
    try { await olam.addObject(item.type, item); report.added += 1; report.mode = "olam-addObject"; }
    catch (error) { report.lastError = error?.message || String(error); }
  }
  report.sceneChildrenAfter = Array.isArray(scene?.children) ? scene.children.length : null;
  return report;
}
export default ensureStarterStationZone;
