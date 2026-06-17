// B"H
export function starterStationReport(olam = null) {
  const zone = olam?.__starterStationZone || null;
  return zone?.report || { ok:false, reason:"starter station not installed" };
}
export default starterStationReport;
