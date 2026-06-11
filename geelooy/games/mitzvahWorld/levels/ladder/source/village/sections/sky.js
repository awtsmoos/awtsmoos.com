// B"H
/**
 * @file sky.js
 * @description
 * Chapter 117: The village sky stops being a flat orange wall.
 * The Awtsmoos lowers the glare, raises blue dusk above the horizon, and keeps
 * Lambert lighting warm enough for stone, grass, and white shirts to read.
 */
export default {
  ProceduralSky: [{
    name: "stable_soft_blue_gold_village_sky",
    timeOfDay: 14.8,
    timeMultiplier: 0,
    sunIntensity: 0.5,
    hemiIntensity: 0.74,
    ambientIntensity: 0.42,
    fogNear: 155,
    fogFar: 620,
    topColor: 0x8fb8dc,
    bottomColor: 0xd8cfa7,
    horizonGlow: 0xf2d28b,
    mobileLambertGrade: "soft-clear-village-readable",
    position: { x: 0, y: 0, z: 0 }
  }],
  VillageSkyLayers: [],
  VillageBackdrop: [],
  VillageLightingRig: [{
    name: "stable_picture_reference_lambert_rig",
    skyColor: 0xc9dcdf,
    groundColor: 0x607a4f,
    hemiIntensity: 0.58,
    sunColor: 0xffd59b,
    sunIntensity: 0.54,
    sunX: -24,
    sunY: 26,
    sunZ: 18,
    fogColor: 0xd9d2b5,
    fogNear: 160,
    fogFar: 620
  }]
};
