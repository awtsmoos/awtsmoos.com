// B"H
/**
 * @file terrain.js
 * @description
 * Chapter 35: The village ground is authored as its own reusable section.
 * ProceduralTerrain remains the physical broad surface; VillageGroundPlane adds
 * painted Lambert earth on top so the screenshot-like grass/dirt language reads
 * immediately at spawn.
 */
export default {
  ProceduralTerrain: [{
    name: "reference_physics_terrain_under_painted_ground",
    width: 190,
    depth: 190,
    segments: 72,
    isSolid: true,
    textureType: "safegrass",
    textureSize: 768,
    microNoise: 0.032,
    mobileTone: "warm-readable-green",
    points: [
      { x: -95, z: -95, y: 0 }, { x: 95, z: -95, y: 0 },
      { x: 95, z: 95, y: 0 }, { x: -95, z: 95, y: 0 }
    ],
    position: { x: 0, y: -0.72, z: 0 }
  }],
  VillageGroundPlane: [{
    name: "reference_painted_grass_dirt_ground",
    width: 190,
    depth: 190,
    y: -0.665,
    size: 1024,
    repeatX: 1,
    repeatY: 1,
    color: 0x789346,
    pathUv: [[0.12, 0.82], [0.32, 0.62], [0.48, 0.51], [0.68, 0.38], [0.88, 0.22]]
  }]
};
