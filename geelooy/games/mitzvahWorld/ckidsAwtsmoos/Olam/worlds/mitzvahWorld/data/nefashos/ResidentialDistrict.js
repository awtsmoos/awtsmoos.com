/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE RESIDENTIAL DISTRICT — ResidentialDistrict.js
 *   ──────────────────────────────────────────────────
 *   Where the families of the Chassidim dwell in warmth and light.
 * ════════════════════════════════════════════════════════════════════════
 */

export const RESIDENTIAL_DISTRICT = [
  // ── Northwest Block (Bricks) ──
  {
    id: 'res_brick_1',
    type: 'windowedHouse',
    position: [-30, 0, -20],
    props: { materialName: 'RED_BRICK', stories: 2 }
  },
  {
    id: 'res_brick_2',
    type: 'multiRoomHouse',
    position: [-50, 0, -10],
    props: { materialName: 'RED_BRICK' }
  },

  // ── Northeast Block (Stone) ──
  {
    id: 'res_stone_1',
    type: 'windowedHouse',
    position: [35, 0, -25],
    props: { materialName: 'JERUSALEM_STONE', stories: 3 }
  },
  {
    id: 'res_stone_2',
    type: 'multiRoomHouse',
    position: [55, 0, -15],
    props: { 
      materialName: 'JERUSALEM_STONE',
      layout: [
        {
          id: 'dining_hall',
          position: [0, 0, 0],
          size: [8, 3.5, 6],
          walls: { north: { hasWindow: true }, south: { hasDoor: true } },
          furniture: [
            { type: 'table', position: [0, 0, 0], props: { width: 3, depth: 1.5 } },
            { type: 'chair', position: [2, 0, 0], props: { scale: 0.8 } },
            { type: 'chair', position: [-2, 0, 0], props: { scale: 0.8 } }
          ]
        },
        {
          id: 'study_wing',
          position: [6.5, 0, 0],
          size: [5, 3.5, 5],
          walls: { west: { hidden: true }, east: { hasWindow: true } },
          furniture: [
            { type: 'table', position: [1, 0, 0], props: { width: 1.5, depth: 1 } },
            { type: 'chair', position: [1, 0, 1], props: { scale: 0.9 } },
            { type: 'painting', position: [2.4, 2, 0], props: { w: 1.2, h: 0.8 } }
          ]
        }
      ]
    }
  },

  // ── Scattered Huts & Cottages ──
  {
    id: 'hut_west_1',
    type: 'hut',
    position: [-20, 0, 15],
    props: { wallColor: 0xd2b48c }
  },
  {
    id: 'cottage_east_1',
    type: 'cottage',
    position: [25, 0, 20],
    props: { wallColor: 0xe0d0b0 }
  }
];
