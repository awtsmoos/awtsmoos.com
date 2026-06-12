// B"H
/**
 * @file ProceduralTerrain.js
 * @description Chapter 422: the village ground grows wider and receives hills.
 * The Awtsmoos spreads the meadow so houses no longer flee the map, while roads
 * and plateaus flatten the places where feet, shops, and cottages must stand.
 */
export default [{
  "name": "wide_point_based_village_ground",
  "width": 760,
  "depth": 720,
  "thickness": 2,
  "segments": 96,
  "collisionSegments": 52,
  "isSolid": true,
  "noSafetySlab": true,
  "textureType": "safegrass",
  "textureSize": 1024,
  "microNoise": 0.018,
  "baseY": 0,
  "hills": [
    { "x": -210, "z": -150, "height": 7.5, "radius": 135 },
    { "x": 215, "z": -125, "height": 6.4, "radius": 150 },
    { "x": -225, "z": 170, "height": 5.9, "radius": 145 },
    { "x": 245, "z": 190, "height": 6.8, "radius": 160 },
    { "x": 0, "z": 245, "height": 3.6, "radius": 170 }
  ],
  "points": [
    { "x": -95, "z": -58, "y": 3.2, "radius": 120 },
    { "x": 85, "z": -72, "y": 2.8, "radius": 128 },
    { "x": -100, "z": 70, "y": 2.5, "radius": 118 },
    { "x": 88, "z": 78, "y": 2.1, "radius": 112 },
    { "x": -12, "z": 92, "y": 1.4, "radius": 138 }
  ],
  "plateaus": [
    { "x": 0, "z": 4, "y": 0.02, "rx": 42, "rz": 35 },
    { "x": 13, "z": -11, "y": 0.02, "rx": 38, "rz": 32 },
    { "x": -46, "z": 27, "y": 0.08, "rx": 34, "rz": 30 },
    { "x": 57, "z": 33, "y": 0.12, "rx": 36, "rz": 32 },
    { "x": -115, "z": -44, "y": 0.16, "rx": 42, "rz": 36 },
    { "x": 118, "z": 62, "y": 0.18, "rx": 48, "rz": 42 },
    { "x": 170, "z": -72, "y": 0.22, "rx": 52, "rz": 44 },
    { "x": -176, "z": 92, "y": 0.2, "rx": 50, "rz": 42 }
  ],
  "roads": [
    { "width": 16, "feather": 18, "flatten": 0.86, "points": [[-150,-60],[-90,-44],[-40,-13],[0,4],[38,18],[92,60],[150,105]] },
    { "width": 11, "feather": 14, "flatten": 0.72, "points": [[0,4],[13,-11],[57,33],[118,62]] },
    { "width": 10, "feather": 13, "flatten": 0.68, "points": [[0,4],[-46,27],[-115,-44]] },
    { "width": 10, "feather": 13, "flatten": 0.66, "points": [[38,18],[105,-34],[170,-72]] },
    { "width": 9, "feather": 12, "flatten": 0.62, "points": [[-46,27],[-116,70],[-176,92]] }
  ],
  "position": { "x": 0, "y": -0.72, "z": 0 },
  "mobileTone": "warm-readable-green"
}];
