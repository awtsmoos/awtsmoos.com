/**
 * B"H
 * @file DesertTestWorld.js
 * @description
 * Chapter 1: Before the Emerald Void could roar again, the Awtsmoos revealed
 * a smaller desert breath: three houses, sand underfoot, and enough silence
 * for debugging truth to become visible. This manifest is intentionally tiny,
 * so one can test loading, collision, doors, and NPC spawning without drowning
 * the browser in skyscrapers, generated markers, and endless shimmering sparks.
 */

export const DESERT_TEST_STRUCTURES = Object.freeze([
  Object.freeze({
    id: 'desert_test_ground',
    type: 'terrain',
    position: [0, -0.05, 0],
    props: { width: 120, depth: 120, color: 0xd8b26a }
  }),
  Object.freeze({
    id: 'desert_test_house_west',
    type: 'multiRoomHouse',
    position: [-18, 0, -10],
    props: { width: 10, depth: 8, stories: 1, rooms: ['entry', 'study'] }
  }),
  Object.freeze({
    id: 'desert_test_house_center',
    type: 'multiRoomHouse',
    position: [0, 0, -14],
    props: { width: 11, depth: 8, stories: 1, rooms: ['front_room', 'borrow_room'] }
  }),
  Object.freeze({
    id: 'desert_test_house_east',
    type: 'windowedHouse',
    position: [18, 0, -10],
    props: { width: 9, depth: 8, stories: 1, rooms: ['entry', 'upper_hint'] }
  })
]);

export const DESERT_TEST_WORLD_SETTINGS = Object.freeze({
  mode: 'desert-test',
  npcLimit: 2,
  disableEmeraldVoidFeatures: true
});
