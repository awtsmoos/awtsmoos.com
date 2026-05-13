/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE ENVIRONMENTAL PULSE — EnvironmentalManifest.js
 *   ────────────────────────────────────────────────────
 *   Points 4, 5, and 8 of the 32 Emanations.
 *   Consolidates Weather, Audio, and VFX definitions.
 * ════════════════════════════════════════════════════════════════════════
 */

export const ENVIRONMENTAL_MANIFEST = {
  // ── Point 4: Weather ──
  WEATHER: {
    dayCycle: {
      durationSeconds: 1200, // 20 minutes
      sunPath: 'arc',
      lightColors: {
        dawn: 0xffa500,
        noon: 0xffffff,
        dusk: 0xff4500,
        night: 0x000033
      }
    },
    wind: {
      baseSpeed: 0.5,
      gustProbability: 0.1
    }
  },

  // ── Point 5: Audio ──
  AUDIO: {
    ambience: {
      nature: { file: 'birds_chirping.mp3', volume: 0.3, distance: 50 },
      sanctuary: { file: 'holy_hum.mp3', volume: 0.5, distance: 20 }
    },
    ui: {
      click: 'menu_tick.wav',
      success: 'mitzvah_done.wav'
    }
  },

  // ── Point 8: VFX ──
  VFX: {
    holy_sparks: {
      count: 100,
      color: 0xffff00,
      size: 0.1,
      velocity: 0.5
    },
    dust_motes: {
      count: 500,
      color: 0xffffff,
      opacity: 0.2
    }
  }
};
