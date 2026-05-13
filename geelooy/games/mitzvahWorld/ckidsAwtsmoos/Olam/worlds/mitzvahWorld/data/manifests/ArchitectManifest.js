/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE MASTER ARCHITECT MANIFEST — ArchitectManifest.js
 *   ──────────────────────────────────────────────────────
 *   Unified Data-Driven Blueprints for all Vessels.
 * ════════════════════════════════════════════════════════════════════════
 */

export const ARCHITECT_MANIFEST = {
  // ── THE HUT ──
  hut: {
    variables: { w: 6, d: 6, h: 3, t: 0.3 },
    components: [
      { type: 'box', params: ['$w', '$h', '$t'], position: [0, '$h/2', '-$d/2'], material: 'JERUSALEM_STONE' },
      { type: 'box', params: ['$w', '$h', '$t'], position: [0, '$h/2', '$d/2'],  material: 'JERUSALEM_STONE' },
      { type: 'box', params: ['$t', '$h', '$d'], position: ['$w/2', '$h/2', 0],  material: 'JERUSALEM_STONE' },
      { type: 'box', params: ['$t', '$h', '$d'], position: ['-$w/2', '$h/2', 0], material: 'JERUSALEM_STONE' },
      { type: 'box', params: ['$w + 0.5', 0.2, '$d + 0.5'], position: [0, '$h', 0], material: 'RED_BRICK' }
    ]
  },

  // ── THE COTTAGE ──
  cottage: {
    variables: { w: 5, d: 4, h: 2.5, t: 0.2 },
    components: [
      { type: 'box', params: ['$w', '$h', '$d'], position: [0, '$h/2', 0], material: 'JERUSALEM_STONE' },
      { type: 'box', params: ['$w + 0.4', 0.5, '$d + 0.4'], position: [0, '$h + 0.2', 0], material: 'RED_BRICK' }
    ]
  },

  // ── THE WINDOWED HOUSE ──
  windowedHouse: {
    variables: { width: 8, depth: 6, wallHeight: 3, stories: 2, t: 0.3 },
    components: [
      {
        type: 'repeat',
        count: '$stories',
        offset: [0, '$wallHeight', 0],
        component: {
          variables: { w: '$width', d: '$depth', h: '$wallHeight', t: '$t' },
          components: [
            { type: 'box', params: ['$w', '$h', '$t'], position: [0, '$h/2', '-$d/2'], material: 'JERUSALEM_STONE' },
            { type: 'box', params: ['$w', '$h', '$t'], position: [0, '$h/2', '$d/2'],  material: 'JERUSALEM_STONE' },
            { type: 'box', params: ['$t', '$h', '$d'], position: ['$w/2', '$h/2', 0],  material: 'JERUSALEM_STONE' },
            { type: 'box', params: ['$t', '$h', '$d'], position: ['-$w/2', '$h/2', 0], material: 'JERUSALEM_STONE' },
            { type: 'box', params: ['$w', 0.1, '$d'], position: [0, 0, 0], material: 'DARK_WOOD' }
          ]
        }
      },
      { type: 'box', params: ['$width + 0.6', 0.3, '$depth + 0.6'], position: [0, '$stories * $wallHeight', 0], material: 'RED_BRICK' }
    ]
  },

  // ── THE MULTI-ROOM HOUSE ──
  multiRoomHouse: {
    variables: { width: 12, depth: 8, wallHeight: 3.5, t: 0.4 },
    components: [
      { type: 'box', params: ['$width', '$wallHeight', '$depth'], position: [0, '$wallHeight/2', 0], material: 'JERUSALEM_STONE' },
      { type: 'box', params: ['$width + 0.5', 0.3, '$depth + 0.5'], position: [0, '$wallHeight', 0], material: 'RED_BRICK' }
    ]
  },

  // ── THE SKYSCRAPER ──
  skyscraper: {
    variables: { width: 10, depth: 10, floors: 5, floorH: 4 },
    components: [
      {
        type: 'repeat',
        count: '$floors',
        offset: [0, '$floorH', 0],
        component: {
          variables: { w: '$width', d: '$depth', h: '$floorH', t: 0.4 },
          components: [
            { type: 'box', params: ['$w', 0.2, '$d'], position: [0, 0, 0], material: 'DARK_WOOD' },
            { type: 'box', params: ['$w', '$h', '$t'], position: [0, '$h/2', '-$d/2'], material: 'JERUSALEM_STONE' },
            { type: 'box', params: ['$w', '$h', '$t'], position: [0, '$h/2', '$d/2'],  material: 'JERUSALEM_STONE' },
            { type: 'box', params: ['$t', '$h', '$d'], position: ['$w/2', '$h/2', 0],  material: 'JERUSALEM_STONE' },
            { type: 'box', params: ['$t', '$h', '$d'], position: ['-$w/2', '$h/2', 0], material: 'JERUSALEM_STONE' }
          ]
        }
      }
    ]
  },

  // ── THE BEIS HAKNESSES ──
  beisHaKnesses: {
    variables: { width: 15, depth: 22, wallHeight: 9 },
    components: [
      { type: 'box', params: ['$width', '$wallHeight', '$depth'], position: [0, '$wallHeight/2', 0], material: 'JERUSALEM_STONE' },
      { type: 'sphere', params: ['$width/2', 32, 16, 0, 6.28, 0, 1.57], position: [0, '$wallHeight', 0], material: 'SKY_GLASS' }
    ]
  },

  // ── THE TREE ──
  tree: {
    variables: { h: 6, r: 0.3, fr: 2.5 },
    components: [
      { type: 'cylinder', params: ['$r*0.7', '$r', '$h', 8], position: [0, '$h/2', 0], material: 'DARK_WOOD' },
      { type: 'sphere', params: ['$fr', 8, 8], position: [0, '$h', 0], material: 'JERUSALEM_STONE' }
    ]
  },

  // ── THE FLOWER ──
  flower: {
    variables: { h: 0.5, r: 0.05 },
    components: [
      { type: 'cylinder', params: [0.01, 0.01, '$h', 8], position: [0, '$h/2', 0], material: 'DARK_WOOD' },
      { type: 'sphere', params: [0.1, 8, 8], position: [0, '$h', 0], material: 'RED_BRICK' }
    ]
  },

  // ── THE HOLY PILLAR ──
  holyPillar: {
    variables: { h: 10, r: 0.5, count: 4 },
    components: [
      {
        type: 'cylinder',
        params: ['$r', '$r', '$h', 16],
        position: [0, '$h/2', 0],
        material: 'JERUSALEM_STONE',
        modifiers: [
          { type: 'mirror', params: { axis: 'y' } },
          { type: 'array', params: { count: '$count', offset: [2, 0, 0] } }
        ]
      }
    ]
  },

  // ── THE RADIANT GATE ──
  radiantGate: {
    variables: { w: 4, h: 6, t: 0.5 },
    components: [
      {
        type: 'box',
        params: ['$w', '$h', '$t'],
        position: [0, '$h/2', 0],
        material: 'SKY_GLASS',
        modifiers: [
          { type: 'extrude', params: { amount: 1, axis: 'y' } },
          { type: 'noise', params: { amount: 0.05 } }
        ]
      }
    ]
  }
};
