// B"H
export function buildDenseWorldData(count = 48) {
  const houses = [], doors = [], npcs = [], animals = [], hostiles = [], triggers = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / 12), col = i % 12, x = 8 + col * 6, z = row * 8;
    houses.push({ id:`house_${i}`, x, z, width:3, depth:3 });
    doors.push({ id:`door_${i}`, x, z:z + 2.1, width:1, depth:.35, locked:i % 2 === 1, open:i % 2 === 0 });
    npcs.push({ id:`npc_${i}`, name:`Villager ${i}`, userData:{ kind:"npc", friendly:true }, position:{ x:x - 2.6, z:z - 1.9 } });
    animals.push({ id:`goat_${i}`, name:`Goat ${i}`, userData:{ kind:"animal", peaceful:true, species:"goat" }, position:{ x:x + 2.6, z:z - 1.9 } });
    hostiles.push({ id:`fox_${i}`, name:`Fox ${i}`, userData:{ kind:"creature", hostile:true, attackable:true }, position:{ x:x + 2.6, z:z + 3.1 }, hp:20 });
    if (i < count / 2) triggers.push({ id:`trigger_${i}`, kind:"quest-zone", x, z:z + 4, width:2, depth:2, trigger:true });
  }
  const bounds = { minX:-4, maxX:84, minZ:-6, maxZ:36 };
  const roads = [0, 8, 16, 24].map((z, i) => ({ id:`road_${i}`, x:42, z:z + 4, width:90, depth:4 }));
  const points = houses.flatMap(h => [{ id:`yard_${h.id}`, x:h.x + 2.8, z:h.z }, { id:`garden_${h.id}`, x:h.x - 2.8, z:h.z + 2.6 }]);
  const walls = boundaryWalls(bounds);
  return { worldId:"village", bounds, houses, walls, doors, roads, points, npcs, animals, hostiles, triggers, hazards:[], spawns:[{ id:"player_spawn", x:0, z:0, radius:.55 }] };
}

function boundaryWalls(bounds) {
  const cx = (bounds.minX + bounds.maxX) / 2, cz = (bounds.minZ + bounds.maxZ) / 2;
  const w = bounds.maxX - bounds.minX, h = bounds.maxZ - bounds.minZ;
  return [
    { id:"world_wall_west", x:bounds.minX - .5, z:cz, width:1, depth:h + 2 },
    { id:"world_wall_east", x:bounds.maxX + .5, z:cz, width:1, depth:h + 2 },
    { id:"world_wall_north", x:cx, z:bounds.minZ - .5, width:w + 2, depth:1 },
    { id:"world_wall_south", x:cx, z:bounds.maxZ + .5, width:w + 2, depth:1 }
  ];
}

export default buildDenseWorldData;
