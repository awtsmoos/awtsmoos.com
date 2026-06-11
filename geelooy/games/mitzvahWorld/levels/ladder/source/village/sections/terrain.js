// B"H
/**
 * @file terrain.js
 * @description
 * Chapter 622: Village terrain is the only village collider and it has no
 * hidden safety slab. One lawful ground surface, no extra invisible box.
 */
export default {
  ProceduralTerrain: [{
    name: "stable_physics_terrain_lawful_textured_ground",
    width: 190,
    depth: 190,
    segments: 72,
    collisionSegments: 12,
    isSolid: true,
    noSafetySlab: true,
    textureType: "safegrass",
    textureSize: 512,
    microNoise: 0.026,
    mobileTone: "soft-clear-meadow-green",
    points: [
      { x: -95, z: -95, y: 0 }, { x: 95, z: -95, y: 0 },
      { x: 95, z: 95, y: 0 }, { x: -95, z: 95, y: 0 }
    ],
    position: { x: 0, y: -0.72, z: 0 }
  }],
  VillageGroundPlane: []
};
