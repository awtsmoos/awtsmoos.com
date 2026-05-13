/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE HOLY QUARTER — HolyQuarter.js
 *   ────────────────────────────────────────
 *   The spiritual and architectural heart of the city.
 * ════════════════════════════════════════════════════════════════════════
 */

export const HOLY_QUARTER = [
  {
    id: 'sanctuary_main',
    type: 'beisHaKnesses',
    position: [0, 0, 0],
    props: {
      width: 16, depth: 24, wallHeight: 10
    }
  },
  {
    id: 'skyscraper_tower_of_light',
    type: 'skyscraper',
    position: [0, 0, -60],
    props: {
      width: 10, depth: 10, floors: 15, floorHeight: 3.6,
      wallColor: 0xffffff, accentColor: 0x00ffff
    }
  },
  {
    id: 'elevator_to_heaven',
    type: 'elevator',
    position: [0, 0, -60],
    props: {
      startHeight: 0, endHeight: 54, speed: 4
    }
  }
];
