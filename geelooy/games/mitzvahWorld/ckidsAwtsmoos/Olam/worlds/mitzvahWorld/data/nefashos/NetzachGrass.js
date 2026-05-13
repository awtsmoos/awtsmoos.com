/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE NETZACH GRASS — NetzachGrass.js
 *   ───────────────────────────────────────
 *   "Netzach" — Victory, Endurance, Proliferation.
 *   The grass does not merely grow; it triumphs over the bare earth.
 *   Each blade is a spark of life from the Awtsmoos.
 *
 *   Many patches now — thick clusters near buildings,
 *   sparse wisps across the open field, and dense tufts
 *   at the edges of the world.
 * ════════════════════════════════════════════════════════════════════════
 * @module NetzachGrass
 */

/** @type {import('../../nivrayimDefs.js').NefeshDef[]} */
export const NETZACH_GRASS_LIST = [
  // ── Dense central meadow ──
  {
    id: 'grass_central',
    type: 'grassPatch',
    position: [0, 0.01, 0],
    props: { radius: 30, count: 400, color: 0x4caf50 },
  },
  // ── Near the huts ──
  {
    id: 'grass_hut_area',
    type: 'grassPatch',
    position: [-8, 0.01, -8],
    props: { radius: 8, count: 150, color: 0x66bb6a },
  },
  // ── East field ──
  {
    id: 'grass_east_field',
    type: 'grassPatch',
    position: [25, 0.01, 0],
    props: { radius: 20, count: 250, color: 0x43a047 },
  },
  // ── West field ──
  {
    id: 'grass_west_field',
    type: 'grassPatch',
    position: [-25, 0.01, 5],
    props: { radius: 18, count: 200, color: 0x388e3c },
  },
  // ── North meadow ──
  {
    id: 'grass_north_meadow',
    type: 'grassPatch',
    position: [0, 0.01, -25],
    props: { radius: 15, count: 180, color: 0x2e7d32 },
  },
  // ── South field ──
  {
    id: 'grass_south_field',
    type: 'grassPatch',
    position: [5, 0.01, 25],
    props: { radius: 22, count: 300, color: 0x558b2f },
  },
  // ── Sparse outer ring ──
  {
    id: 'grass_outer_nw',
    type: 'grassPatch',
    position: [-40, 0.01, -35],
    props: { radius: 25, count: 120, color: 0x689f38 },
  },
  {
    id: 'grass_outer_se',
    type: 'grassPatch',
    position: [40, 0.01, 35],
    props: { radius: 25, count: 120, color: 0x7cb342 },
  },
  // ── Small tufts near buildings ──
  {
    id: 'grass_cottage_east',
    type: 'grassPatch',
    position: [15, 0.01, -10],
    props: { radius: 5, count: 80, color: 0x81c784 },
  },
  {
    id: 'grass_skyscraper_area',
    type: 'grassPatch',
    position: [0, 0.01, -32],
    props: { radius: 6, count: 60, color: 0xa5d6a7 },
  },
];

export default NETZACH_GRASS_LIST;
