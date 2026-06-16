// B"H
/** @file RegionGrassExclusion.js @description Pure exclusion circles so grass does not grow through cottages, yards, and gates. */
const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
export function grassExclusionsFromReport(report = {}) {
  const houses = Array.isArray(report.houses) ? report.houses : [];
  const parcels = Array.isArray(houses.parcels) ? houses.parcels : houses.map(h => h.parcel).filter(Boolean);
  const houseCircles = houses.map(h => ({ id:h.id || h.houseId || "house", x:num(h.x), z:num(h.z), radius:Math.max(num(h.sx, 8), num(h.sz, 6)) * 0.72, type:"house" }));
  const yardCircles = parcels.map(p => ({ id:p.id, x:num(p.x), z:num(p.z), radius:Math.max(num(p.yard?.width, 14), num(p.yard?.depth, 12)) * 0.42, type:"yard" }));
  return [...houseCircles, ...yardCircles].filter(c => c.radius > 0.5);
}
export function pointInGrassExclusion(x, z, exclusions = []) { return exclusions.some(e => Math.hypot(num(x) - e.x, num(z) - e.z) <= e.radius); }
export function auditGrassExclusions(report = {}) {
  const exclusions = grassExclusionsFromReport(report), houses = Array.isArray(report.houses) ? report.houses : [];
  return { ok:houses.length === 0 || exclusions.length >= houses.length, exclusions:exclusions.length, houses:houses.length, types:[...new Set(exclusions.map(e => e.type))] };
}
export default { grassExclusionsFromReport, pointInGrassExclusion, auditGrassExclusions };
