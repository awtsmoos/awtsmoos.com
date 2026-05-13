/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE BLUEPRINTS OF HOUSEHOLD VESSELS — FurnitureManifest.js
 *   ──────────────────────────────────────────────────────────
 *   All internal items defined in the Universal Geometry Engine format.
 * ════════════════════════════════════════════════════════════════════════
 */

export const FURNITURE_BLUEPRINTS = {
  table: {
    variables: { w: 2, d: 1.2, h: 0.8, legR: 0.05 },
    components: [
      {
        type: 'box',
        params: ['$w', 0.1, '$d'],
        position: [0, '$h', 0],
        material: 'DARK_WOOD'
      },
      {
        type: 'cylinder',
        params: ['$legR', '$legR', '$h', 16],
        position: ['$w/2 - 0.1', '$h/2', '$d/2 - 0.1'],
        modifiers: [
          { type: 'mirror', axes: ['x', 'z'] }
        ],
        material: 'DARK_WOOD'
      }
    ]
  },
  
  chair: {
    variables: { sw: 0.5, sh: 0.5, legR: 0.04 },
    components: [
      {
        type: 'box',
        params: ['$sw', 0.05, '$sw'],
        position: [0, '$sh', 0],
        material: 'DARK_WOOD'
      },
      {
        type: 'box',
        params: ['$sw', 0.6, 0.05],
        position: [0, '$sh + 0.3', '-$sw/2'],
        material: 'DARK_WOOD'
      },
      {
        type: 'cylinder',
        params: ['$legR', '$legR', '$sh', 16],
        position: ['$sw/2 - 0.05', '$sh/2', '$sw/2 - 0.05'],
        modifiers: [
          { type: 'mirror', axes: ['x', 'z'] }
        ],
        material: 'DARK_WOOD'
      }
    ]
  },

  painting: {
    variables: { w: 1, h: 1.2 },
    components: [
      {
        type: 'box',
        params: ['$w', '$h', 0.05],
        position: [0, 0, 0],
        material: 'JERUSALEM_STONE'
      },
      {
        type: 'box',
        params: ['$w + 0.1', '$h + 0.1', 0.02],
        position: [0, 0, -0.02],
        material: 'DARK_WOOD'
      }
    ]
  }
};
