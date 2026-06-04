// B"H
/**
 * @file terrain.js
 * @description
 * Chapter 90: The ground becomes darker, richer, and less toy-flat.
 * A physical terrain remains underneath; a shader-baked Lambert ground plane
 * carries grass/dirt/flower color with stronger contrast and safer placement.
 */
export default {
  ProceduralTerrain: [{
    name: "stable_physics_terrain_under_rich_ground",
    width: 190,
    depth: 190,
    segments: 72,
    isSolid: true,
    textureType: "safegrass",
    textureSize: 768,
    microNoise: 0.04,
    mobileTone: "darker-golden-village-green",
    points: [
      { x: -95, z: -95, y: 0 }, { x: 95, z: -95, y: 0 },
      { x: 95, z: 95, y: 0 }, { x: -95, z: 95, y: 0 }
    ],
    position: { x: 0, y: -0.72, z: 0 }
  }],
  VillageGroundPlane: [{
    name: "shader_baked_rich_grass_dirt_ground",
    width: 188,
    depth: 188,
    y: -0.64,
    size: 768,
    repeatX: 1,
    repeatY: 1,
    color: 0x5f7f38,
    grassDark: 0x375a27,
    grassLight: 0x8daa52,
    flowerColor: 0xe8d860
  }]
};
