// B"H
/** @file BuildingLifecycleRuntime.js @description Buildings age, wear, repair, and support village growth. */
export function createBuildingLifecycleRuntime(memory = globalThis.__MITZVAH_WORLD_MEMORY__, environment = globalThis.__MITZVAH_ENVIRONMENT_WEAR__) {
  const buildings = new Map();
  function ensure(id, kind = 'house') { if (!buildings.has(id)) buildings.set(id, { id, kind, age:0, wear:0, repairs:0 }); return buildings.get(id); }
  function age(id, years = 1) { const b = ensure(id); b.age += years; b.wear += years * .4; memory?.record?.('building-aged', b); return b; }
  function damage(id, amount = 1) { const b = ensure(id); b.wear += amount; environment?.mark?.(id, 'buildingWear', amount); return b; }
  function repair(id, amount = 1) { const b = ensure(id); b.wear = Math.max(0, b.wear - amount); b.repairs += amount; memory?.record?.('building-repaired', b); return b; }
  function report() { return { buildings:buildings.size, worn:[...buildings.values()].filter(b => b.wear > 5).length }; }
  return { ensure, age, damage, repair, report, buildings };
}
export default createBuildingLifecycleRuntime;
