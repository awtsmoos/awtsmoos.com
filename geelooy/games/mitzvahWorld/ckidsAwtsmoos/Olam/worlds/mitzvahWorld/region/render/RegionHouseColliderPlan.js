// B"H
/** @file RegionHouseColliderPlan.js @description Pure wall-slab plan for region house colliders that never seal the front door. */
const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
export function houseColliderSlabs(house = {}) {
  const sx = Math.max(1, num(house.sx, 8)), sy = Math.max(1, num(house.sy, 4.2)), sz = Math.max(1, num(house.sz, 6));
  const wall = Math.max(0.18, Math.min(sx, sz) * 0.045);
  const doorWidth = Math.min(sx * 0.52, Math.max(2.2, num(house.doorWidth, 2.6)));
  const doorHeight = Math.min(sy * 0.78, Math.max(2.4, num(house.doorClearHeight, 3.05)));
  const side = Math.max(wall, (sx - doorWidth) / 2);
  const lintel = Math.max(wall, sy - doorHeight);
  const halfW = sx / 2, halfD = sz / 2;
  return [
    { name:"back", center:[0, sy / 2, -halfD], size:[sx, sy, wall] },
    { name:"left", center:[-halfW, sy / 2, 0], size:[wall, sy, sz] },
    { name:"right", center:[halfW, sy / 2, 0], size:[wall, sy, sz] },
    { name:"front_left", center:[-(doorWidth / 2 + side / 2), sy / 2, halfD], size:[side, sy, wall] },
    { name:"front_right", center:[doorWidth / 2 + side / 2, sy / 2, halfD], size:[side, sy, wall] },
    { name:"front_lintel", center:[0, doorHeight + lintel / 2, halfD], size:[doorWidth, lintel, wall] }
  ].map(s => ({ ...s, houseId:house.id || house.name || "house", yaw:num(house.yaw, 0), x:num(house.x, 0), z:num(house.z, 0), doorWidth, doorHeight, wall }));
}
export function auditHouseColliderSlabs(house = {}) {
  const slabs = houseColliderSlabs(house), sx = Math.max(1, num(house.sx, 8)), sy = Math.max(1, num(house.sy, 4.2));
  const doorWidth = slabs[0]?.doorWidth || 0, doorHeight = slabs[0]?.doorHeight || 0;
  return { ok:slabs.length === 6 && doorWidth > 0 && doorWidth < sx && doorHeight > 0 && doorHeight < sy, slabs:slabs.length, doorWidth, doorHeight, frontSlabs:slabs.filter(s => s.name.startsWith("front")).length };
}
export function auditHousePlanColliders(houses = []) { const rows = houses.map(auditHouseColliderSlabs); return { ok:rows.every(r => r.ok), houses:houses.length, rows }; }
export default { houseColliderSlabs, auditHouseColliderSlabs, auditHousePlanColliders };
