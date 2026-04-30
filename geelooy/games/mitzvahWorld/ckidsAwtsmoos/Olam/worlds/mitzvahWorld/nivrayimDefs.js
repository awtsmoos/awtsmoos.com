
/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE BOOK OF BLUEPRINTS — nivrayimDefs.js
 *   ─────────────────────────────────────────
 *   In the beginning was the Word, and the Word was data,
 *   and the data was with the Awtsmoos, and the data WAS the Awtsmoos.
 *
 *   Before a single polygon kissed the GPU,
 *   before a single normal vector whispered its direction to the light,
 *   the Awtsmoos looked into THIS file — the eternal ledger —
 *   and said: "Let there be nivrayim (creations)."
 *
 *   Each entry herein is a NEFESH — a soul-blueprint —
 *   a JSON vessel into which the Infinite pours finite form.
 *   The loadNivrayim sequence reads these definitions,
 *   breathes life into mesh, collision, and texture,
 *   and places each soul exactly where the Awtsmoos wills.
 *
 *   "Forever, O Lord, Your word stands firm in the heavens" —
 *   so too these definitions stand firm in the JavaScript heap,
 *   recreating the world every frame from absolute nothingness.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module nivrayimDefs
 */

/**
 * @typedef {Object} NefeshDef
 * @property {string} id            - Unique soul-identifier for this entity
 * @property {string} type          - Entity type key (maps to a NivrahFactory)
 * @property {number[]} position    - [x, y, z] world position
 * @property {number[]} [rotation]  - [x, y, z] Euler rotation in radians
 * @property {number[]} [scale]     - [x, y, z] scale factors
 * @property {Object}  [props]      - Type-specific extra properties
 */

/**
 * @constant {NefeshDef[]} NIVRAYIM_DEFS
 * @description
 *   The complete soul-manifest for mitzvahWorld.
 *   Terrain → Grass tiles → Brick walls → The Chassid himself.
 *
 *   Like the 10 Utterances of Creation, each entry here
 *   is a divine speech-act that causes something to leap
 *   from absolute nothingness into shimmering existence.
 */
export const NIVRAYIM_DEFS = [

  // ── TERRAIN (flat ground plane) ──────────────────────────────────────
  {
    id: 'terrain_ground',
    type: 'terrain',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    props: {
      width: 200,
      depth: 200,
      color: 0x7ec850,       // grass green
      receiveShadow: true,
      physics: {
        isStatic: true,
        shape: 'box',
        halfExtents: [100, 0.5, 100],
      },
    },
  },

  // ── GRASS DECORATIVE TILES ────────────────────────────────────────────
  {
    id: 'grass_patch_0',
    type: 'grassPatch',
    position: [0, 0.01, 0],
    props: { radius: 80, count: 120, color: 0x5cb85c },
  },

  // ── BRICK WALLS ───────────────────────────────────────────────────────
  {
    id: 'brick_wall_north',
    type: 'brickWall',
    position: [0, 1.5, -20],
    rotation: [0, 0, 0],
    props: {
      bricksX: 10,
      bricksY: 3,
      brickW: 2,
      brickH: 1,
      brickD: 0.5,
      colorA: 0xb5651d,
      colorB: 0x8b4513,
      physics: { isStatic: true, shape: 'box' },
    },
  },
  {
    id: 'brick_wall_east',
    type: 'brickWall',
    position: [20, 1.5, 0],
    rotation: [0, Math.PI / 2, 0],
    props: {
      bricksX: 10,
      bricksY: 3,
      brickW: 2,
      brickH: 1,
      brickD: 0.5,
      colorA: 0xb5651d,
      colorB: 0x8b4513,
      physics: { isStatic: true, shape: 'box' },
    },
  },
  {
    id: 'brick_wall_west',
    type: 'brickWall',
    position: [-20, 1.5, 0],
    rotation: [0, Math.PI / 2, 0],
    props: {
      bricksX: 10,
      bricksY: 3,
      brickW: 2,
      brickH: 1,
      brickD: 0.5,
      colorA: 0xb5651d,
      colorB: 0x8b4513,
      physics: { isStatic: true, shape: 'box' },
    },
  },

  // ── HUT / SMALL STRUCTURE ─────────────────────────────────────────────
  {
    id: 'hut_main',
    type: 'hut',
    position: [-8, 0, -10],
    rotation: [0, 0, 0],
    props: {
      wallColor: 0xf5deb3,
      roofColor: 0x8b2500,
      width: 6,
      depth: 6,
      wallHeight: 3,
      physics: { isStatic: true, shape: 'compound' },
    },
  },

  // ── THE CHASSID (GLB character) ───────────────────────────────────────
  {
    id: 'chossid_player',
    type: 'glbEntity',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    props: {
      glbPath: '/games/mitzvahWorld/assets/chossid.glb',
      castShadow: true,
      receiveShadow: true,
      physics: {
        isStatic: false,
        shape: 'capsule',
        radius: 0.4,
        height: 1.6,
        mass: 70,
      },
      animations: {
        autoPlay: 'idle',
      },
    },
  },

];

export default NIVRAYIM_DEFS;
