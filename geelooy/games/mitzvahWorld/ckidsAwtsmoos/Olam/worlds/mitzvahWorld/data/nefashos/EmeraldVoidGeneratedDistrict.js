/**
 * B"H
 * @file EmeraldVoidGeneratedDistrict.js
 * @description
 * Chapter 3: The Emerald Void learned to multiply without becoming heavy.
 * Tiny blueprints unfold into many houses, towers, rooms, doors, mezuzos,
 * stairs, motor rooms, NPC anchors, and a borrowing desk. The Awtsmoos is
 * hinted here through data: one compact breath becomes many walkable vessels.
 */

const HOUSE_ROWS = [
  ['chesed_lane_1', -34, -52, 'multiRoomHouse', 1, ['foyer', 'kitchen', 'study']],
  ['chesed_lane_2', -20, -54, 'multiRoomHouse', 1, ['front_room', 'sleep_room']],
  ['gevurah_lane_1', 22, -54, 'windowedHouse', 2, ['entry_hall', 'upper_study']],
  ['gevurah_lane_2', 36, -50, 'windowedHouse', 2, ['lower_room', 'stair_room', 'upper_room']],
  ['tiferes_lane_1', -36, 54, 'multiRoomHouse', 1, ['welcome', 'mitzvah_room']],
  ['tiferes_lane_2', -20, 58, 'multiRoomHouse', 1, ['hall', 'library', 'guest_room']],
  ['hod_lane_1', 20, 58, 'windowedHouse', 2, ['entry', 'stairs', 'upper_hall']],
  ['yesod_lane_1', 36, 52, 'multiRoomHouse', 1, ['borrow_desk', 'shelf_room']]
];

const TOWERS = [
  ['emerald_light_tower_north', 0, -68, 8],
  ['emerald_light_tower_south', 0, 70, 7],
  ['emerald_light_tower_east', 54, 8, 9]
];

function doorway(room, index, total) {
  return {
    id: `${room}_door_${index}`,
    room,
    wall: index === 0 ? 'south' : 'east',
    hasDoor: true,
    hasMezuzah: index % 2 === 0 || total > 2
  };
}

function roomDef(id, index) {
  return {
    id,
    purpose: id,
    position: [index * 4.2, index > 1 ? 0 : 0, index * -2.4],
    size: [5.5, 3.4, 4.6],
    walls: { south: { hasDoor: index === 0 }, east: { hasDoor: index > 0 } }
  };
}

function house([id, x, z, type, stories, rooms]) {
  return {
    id,
    type,
    position: [x, 0, z],
    props: {
      ownerKind: id.includes('yesod') ? 'communal' : 'free',
      stories,
      width: type === 'windowedHouse' ? 9 : 12,
      depth: rooms.length > 2 ? 10 : 8,
      privateYard: { width: 18, depth: 16, fence: true, gate: `${id}_yard_gate` },
      stairs: stories > 1 ? { from: rooms[0], to: rooms[rooms.length - 1], kind: 'walkable_staircase', hasDoor: true } : null,
      entrances: [doorway(rooms[0], 0, rooms.length)],
      interiorDoorways: rooms.slice(1).map((name, index) => doorway(name, index + 1, rooms.length)),
      npcSpawnPoints: rooms.map((name, index) => ({ id: `${id}_${name}_npc`, room: name, position: [index, 0, -index] })),
      borrowingSystem: id.includes('yesod') ? { enabled: true, items: ['hammer', 'ladder', 'sefer', 'lamp'] } : null,
      layout: rooms.map(roomDef)
    }
  };
}

function tower([id, x, z, floors]) {
  return {
    id,
    type: 'skyscraper',
    position: [x, 0, z],
    props: {
      width: 9,
      depth: 9,
      floors,
      floorH: 3.25,
      instantGenerated: true,
      lightRig: 'emerald_soft_mobile_safe',
      motorRoom: { floor: floors, hasDoor: true, hasMezuzah: true },
      entrances: [{ id: `${id}_front_motor_lobby`, wall: 'south', hasDoor: true, hasMezuzah: true }],
      npcSpawnPoints: [{ id: `${id}_doorman`, room: 'lobby', position: [0, 0, -4.8] }]
    }
  };
}

export const EMERALD_GENERATED_HOUSES = HOUSE_ROWS.map(house);
export const EMERALD_GENERATED_SKYSCRAPERS = TOWERS.map(tower);

export const EMERALD_VOID_GENERATED_DISTRICT = [
  ...EMERALD_GENERATED_HOUSES,
  ...EMERALD_GENERATED_SKYSCRAPERS
];
