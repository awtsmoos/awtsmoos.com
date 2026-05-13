/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE CHESED HUT — ChesedHut.js
 *   ───────────────────────────────────────
 *   "Chesed" — Loving-kindness, Expansiveness, Hospitality.
 *   The hut is a place of refuge, a shelter for the weary traveler.
 *   It opens its doors to all, a physical vessel of the Creator's
 *   desire to provide a home for His creations.
 *
 *   Like the tent of Avraham Avinu, which was open on all four sides
 *   to welcome guests from every corner of the earth — the hut is Chesed.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module ChesedHut
 */

/**
 * @constant {import('../../nivrayimDefs.js').NefeshDef} CHESED_HUT
 * @description
 *   The primary dwelling place.
 *   A vessel of warmth and protection, manifesting the attribute 
 *   of Chesed in the physical realm.
 */
export const CHESED_HUT = {
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
};

export default CHESED_HUT;
