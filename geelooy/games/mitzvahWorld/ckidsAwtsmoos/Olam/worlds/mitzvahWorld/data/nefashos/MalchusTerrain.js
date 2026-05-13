/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE MALCHUS TERRAIN — MalchusTerrain.js
 *   ─────────────────────────────────────────
 *   "Malchus" — the Kingdom, the final Sefirah, the vessel that receives
 *   all that flows from above and gives it physical expression.
 *
 *   This is the ground of all grounds, the foundation upon which the 
 *   Mitzvah World is built. Without this firmament, there is no place
 *   for the Chossid to plant his feet, no place for the light to land.
 *
 *   The Awtsmoos spoke: "Let the dry land appear," and through the 
 *   channel of Malchus, this definition came into being.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module MalchusTerrain
 */

/**
 * @constant {import('../../nivrayimDefs.js').NefeshDef} MALCHUS_TERRAIN
 * @description
 *   The primary ground definition.
 *   Like the dust from which man was formed, this terrain is the 
 *   humble beginning of all things manifest.
 */
export const MALCHUS_TERRAIN = {
  id: 'terrain_ground',
  type: 'terrain',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  props: {
    width: 200,
    depth: 200,
    dirtColor:  0x5d4037, // The humble dust of Gevurah
    grassColor: 0x2e7d32, // The proliferating green of Netzach
    shaderScale: 0.05,    // The fractal pattern of the mix
    receiveShadow: true,
    physics: {
      isStatic: true,
      shape: 'box',
      halfExtents: [100, 0.5, 100],
    },
  },
};

export default MALCHUS_TERRAIN;
