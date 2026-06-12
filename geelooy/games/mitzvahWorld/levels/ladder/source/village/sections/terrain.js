// B"H
/**
 * @file terrain.js
 * @description
 * Chapter 623: the fallback terrain also grows, so no compiler path can shrink
 * the village back to a 190 meter island. The same hill/road covenant keeps all
 * objects grounded on one lawful surface.
 */
const ground = {
  name: "stable_physics_terrain_lawful_textured_ground",
  width: 760,
  depth: 720,
  segments: 96,
  collisionSegments: 52,
  isSolid: true,
  noSafetySlab: true,
  textureType: "safegrass",
  textureSize: 1024,
  microNoise: 0.018,
  mobileTone: "soft-clear-meadow-green",
  hills: [
    { x: -210, z: -150, height: 7.5, radius: 135 },
    { x: 215, z: -125, height: 6.4, radius: 150 },
    { x: -225, z: 170, height: 5.9, radius: 145 },
    { x: 245, z: 190, height: 6.8, radius: 160 },
    { x: 0, z: 245, height: 3.6, radius: 170 }
  ],
  points: [
    { x: -95, z: -58, y: 3.2, radius: 120 },
    { x: 85, z: -72, y: 2.8, radius: 128 },
    { x: -100, z: 70, y: 2.5, radius: 118 },
    { x: 88, z: 78, y: 2.1, radius: 112 },
    { x: -12, z: 92, y: 1.4, radius: 138 }
  ],
  plateaus: [
    { x: 0, z: 4, y: 0.02, rx: 42, rz: 35 },
    { x: 13, z: -11, y: 0.02, rx: 38, rz: 32 },
    { x: -46, z: 27, y: 0.08, rx: 34, rz: 30 },
    { x: 57, z: 33, y: 0.12, rx: 36, rz: 32 },
    { x: 118, z: 62, y: 0.18, rx: 48, rz: 42 }
  ],
  roads: [
    { width: 16, feather: 18, flatten: 0.86, points: [[-150,-60],[-90,-44],[-40,-13],[0,4],[38,18],[92,60],[150,105]] },
    { width: 11, feather: 14, flatten: 0.72, points: [[0,4],[13,-11],[57,33],[118,62]] },
    { width: 10, feather: 13, flatten: 0.68, points: [[0,4],[-46,27],[-115,-44]] }
  ],
  position: { x: 0, y: -0.72, z: 0 }
};
export default { ProceduralTerrain: [ground], VillageGroundPlane: [] };
