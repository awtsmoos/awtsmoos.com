/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE TIFERES CHOSSID — TiferesChossid.js
 *   ─────────────────────────────────────────
 *   "Tiferes" — Beauty, Harmony, Compassion.
 *   The Chossid is the bridge, the one who unifies the heavens and the earth.
 *   Through his actions, his speech, and his thoughts, he harmonizes
 *   the disparate elements of creation into a single song of praise.
 *
 *   The Chossid is the "Beautiful Form" (Tiferes), the pinnacle of 
 *   creation, who brings the light of the Awtsmoos into every corner.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module TiferesChossid
 */

/**
 * @constant {import('../../nivrayimDefs.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1').NefeshDef} TIFERES_CHOSSID
 * @description
 *   The definition of the traveler, the Chossid.
 *   The central figure of the Mitzvah World, a vessel of Tiferes
 *   in the world of action.
 */
export const TIFERES_CHOSSID = {
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
};

export default TIFERES_CHOSSID;
