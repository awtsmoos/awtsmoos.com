/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE BOOK OF BLUEPRINTS — nivrayimDefs.js
 *   ─────────────────────────────────────────
 *   In the beginning was the Word, and the Word was data.
 *
 *   ADDITION — hut_test:
 *   A small gold-roofed hut at [6, 0, 4] — a few steps from spawn.
 *   Walk forward-right immediately. If collision is fixed: bounce.
 *   If still broken: phase through. Remove once confirmed working.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module nivrayimDefs
 */

/**
 * @typedef {Object} NefeshDef
 * @property {string}   id          - Unique soul-identifier
 * @property {string}   type        - Entity type key
 * @property {number[]} position    - [x, y, z] world position
 * @property {number[]} [rotation]  - [x, y, z] Euler rotation in radians
 * @property {number[]} [scale]     - [x, y, z] scale factors
 * @property {Object}   [props]     - Type-specific extra properties
 */

/**
 * @constant {NefeshDef[]} NIVRAYIM_DEFS
 * @description Complete soul-manifest for mitzvahWorld.
 *   Order matters: terrain first so ground raycasts work before buildings snap.
 */
export const NIVRAYIM_DEFS = [

  // ── TERRAIN ───────────────────────────────────────────────────────────
  {
    id: 'terrain_ground',
    type: 'terrain',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    props: {
      width: 200,
      depth: 200,
      color: 0x7ec850,
      receiveShadow: true,
      physics: {
        isStatic: true,
        shape: 'box',
        halfExtents: [100, 0.5, 100],
      },
    },
  },

  // ── GRASS ─────────────────────────────────────────────────────────────
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
      bricksX: 10, bricksY: 3, brickW: 2, brickH: 1, brickD: 0.5,
      colorA: 0xb5651d, colorB: 0x8b4513,
      physics: { isStatic: true, shape: 'box' },
    },
  },
  {
    id: 'brick_wall_east',
    type: 'brickWall',
    position: [20, 1.5, 0],
    rotation: [0, Math.PI / 2, 0],
    props: {
      bricksX: 10, bricksY: 3, brickW: 2, brickH: 1, brickD: 0.5,
      colorA: 0xb5651d, colorB: 0x8b4513,
      physics: { isStatic: true, shape: 'box' },
    },
  },
  {
    id: 'brick_wall_west',
    type: 'brickWall',
    position: [-20, 1.5, 0],
    rotation: [0, Math.PI / 2, 0],
    props: {
      bricksX: 10, bricksY: 3, brickW: 2, brickH: 1, brickD: 0.5,
      colorA: 0xb5651d, colorB: 0x8b4513,
      physics: { isStatic: true, shape: 'box' },
    },
  },

  // ── TEST HUT — small, near spawn, GOLD ROOF ───────────────────────────
  // B"H: At [6, 0, 4] — ~7 units from spawn. Walk forward-right to hit it fast.
  // Gold roof (0xFFD700) = unmistakably the collision test vessel.
  // Bounce off → collision fixed. Phase through → still broken.
  // Remove this entry once hut_main is also confirmed solid.
  {
    id: 'hut_test',
    type: 'hut',
    position: [6, 0, 4],
    rotation: [0, 0, 0],
    props: {
      wallColor:  0xffe4b5,   // Moccasin — pale, easy to see
      roofColor:  0xFFD700,   // Gold — the test beacon
      width:      4,
      depth:      4,
      wallHeight: 2.5,
      physics: { isStatic: true, shape: 'compound' },
    },
  },

  // ── HUT / MAIN ────────────────────────────────────────────────────────
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

  // ── THE CHASSID ───────────────────────────────────────────────────────
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