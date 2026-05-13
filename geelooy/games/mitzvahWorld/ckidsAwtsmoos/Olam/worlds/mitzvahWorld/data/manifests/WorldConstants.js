/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE MASTER SPIRIT MANIFEST — WorldConstants.js
 *   ──────────────────────────────────────────────
 *   The fundamental constants of the Mitzvah World.
 *   Points 6, 13, and 32 of the 32 Emanations.
 * ════════════════════════════════════════════════════════════════════════
 */

export const WORLD_CONSTANTS = {
  PHYSICS: {
    GRAVITY: -9.81,
    AIR_RESISTANCE: 0.01,
    SOUL_REFRESH_RATE: 60, // Hz
  },
  
  // ── Point 6: Material Spirit Mapping ──
  MATERIALS: {
    JERUSALEM_STONE: {
      friction: 0.8,
      restitution: 0.1,
      footstepSound: 'stone_step',
      spiritualResonance: 1.2
    },
    RED_BRICK: {
      friction: 0.7,
      restitution: 0.05,
      footstepSound: 'brick_step',
      spiritualResonance: 1.0
    },
    DARK_WOOD: {
      friction: 0.6,
      restitution: 0.2,
      footstepSound: 'wood_step',
      spiritualResonance: 1.5
    },
    SKY_GLASS: {
      friction: 0.2,
      restitution: 0.1,
      footstepSound: 'glass_clink',
      spiritualResonance: 2.0
    }
  },

  // ── Point 13: Collision Layers ──
  LAYERS: {
    CHOSSID: 1,
    GROUND: 2,
    STRUCTURE: 4,
    INTERACTIVE: 8,
    GHOST: 16
  }
};
