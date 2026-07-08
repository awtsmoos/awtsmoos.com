/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE GEVURAH WALLS — GevurahWalls.js
 *   ───────────────────────────────────────
 *   "Gevurah" — Strength, Boundary, Discipline.
 *   The walls define the space; they say "here" and "not there."
 *   Without Gevurah, the light would be blinding and without form.
 *   The bricks are the blocks of reality, stacked with holy precision.
 *
 *   Like the walls of the Beis HaMikdash that separated the holy 
 *   from the mundane, these walls provide the structure needed
 *   for the light of the Awtsmoos to be contained.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module GevurahWalls
 */

/**
 * @constant {import('../../nivrayimDefs.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1').NefeshDef[]} GEVURAH_WALLS_LIST
 * @description
 *   The boundaries of the world.
 *   Each wall is a manifestation of Gevurah, providing safety 
 *   and definition to the Chossid's path.
 */
export const GEVURAH_WALLS_LIST = [
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
];

export default GEVURAH_WALLS_LIST;
