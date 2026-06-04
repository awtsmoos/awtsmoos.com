// B"H
/**
 * @file terrain.js
 * @description
 * Chapter 93: The ground returns to the engine's lawful terrain.
 * The broken painted overlay is removed from active data. The physical terrain
 * keeps its original texturing/grounding role so village props can sit on earth.
 */
export default {
  ProceduralTerrain: [{
    name: "stable_physics_terrain_lawful_textured_ground",
    width: 190,
    depth: 190,
    segments: 72,
    isSolid: true,
    textureType: "safegrass",
    textureSize: 768,
    microNoise: 0.04,
    mobileTone: "warm-readable-green",
    points: [
      { x: -95, z: -95, y: 0 }, { x: 95, z: -95, y: 0 },
      { x: 95, z: 95, y: 0 }, { x: -95, z: 95, y: 0 }
    ],
    position: { x: 0, y: -0.72, z: 0 }
  }],
  VillageGroundPlane: []
};
