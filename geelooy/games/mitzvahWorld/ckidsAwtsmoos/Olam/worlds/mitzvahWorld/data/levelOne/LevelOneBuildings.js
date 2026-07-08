// B"H
/** Buildings: village skyline, houses, market, and one reduced distant learning tower. */
export const LEVEL_ONE_BUILDINGS = Object.freeze([
  { id: 'main_beis_midrash', type: 'beisHaKnesses', position: [0, 0, -32], props: { width: 18, depth: 28, wallHeight: 12 } },
  { id: 'rebbe_house', type: 'cottage', position: [-10, 0, -16], props: { width: 7, depth: 6, wallHeight: 3 } },
  { id: 'guest_house', type: 'cottage', position: [11, 0, -15], props: { width: 6, depth: 5, wallHeight: 3 } },
  { id: 'schoolhouse', type: 'windowedHouse', position: [-20, 0, -36], props: { width: 10, depth: 8, wallHeight: 3, stories: 2 } },
  { id: 'mitzvah_market', type: 'multiRoomHouse', position: [21, 0, -28], props: { width: 13, depth: 9, wallHeight: 4 } },
  { id: 'south_home_one', type: 'hut', position: [-24, 0, -5], props: { w: 6, d: 6, h: 3 } },
  { id: 'south_home_two', type: 'hut', position: [24, 0, -5], props: { w: 6, d: 6, h: 3 } },
  { id: 'future_learning_tower', type: 'skyscraper', position: [38, 0, -70], props: { width: 8, depth: 8, floors: 3, floorH: 4, distantBudgeted:true } }
]);
