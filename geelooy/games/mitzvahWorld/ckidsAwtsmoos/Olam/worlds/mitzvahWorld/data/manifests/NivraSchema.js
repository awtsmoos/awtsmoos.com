/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE BLUEPRINTS OF BRIYAH — NivrahSchema.js
 *   ────────────────────────────────────────────
 *   Every soul-type has a default vessel-form.
 *   This schema defines the "standard" dimensions, colors, and speeds
 *   for every creation in the Mitzvah World.
 *
 *   "Everything was created with a measure and a weight."
 * ════════════════════════════════════════════════════════════════════════
 */

export const NIVRA_SCHEMA = {
  terrain: {
    width: 300,
    depth: 300,
    dirtColor: 0x5d4037,
    grassColor: 0x2e7d32,
    shaderScale: 0.05
  },
  hut: {
    wallColor: 0xf5deb3,
    roofColor: 0x8b2500,
    width: 6,
    depth: 6,
    wallHeight: 3
  },
  cottage: {
    wallColor: 0xdeb887,
    roofColor: 0x654321,
    trimColor: 0xf5f5dc,
    width: 5,
    depth: 4,
    wallHeight: 2.5
  },
  windowedHouse: {
    materialName: 'JERUSALEM_STONE',
    width: 8,
    depth: 6,
    wallHeight: 3,
    stories: 2
  },
  skyscraper: {
    wallColor: 0x607d8b,
    accentColor: 0x37474f,
    glassColor: 0x90caf9,
    width: 8,
    depth: 8,
    floorHeight: 3.5,
    floors: 6
  },
  elevator: {
    color: 0xc0c0c0,
    width: 3,
    depth: 3,
    startHeight: 0,
    endHeight: 25,
    speed: 3,
    holdTime: 2
  },
  beisHaKnesses: {
    width: 15,
    depth: 22,
    wallHeight: 9
  }
};
