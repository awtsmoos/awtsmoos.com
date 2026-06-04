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
    timeOfDay: 16.4,
    timeMultiplier: 0,
    sunIntensity: 0.44,
    hemiIntensity: 0.66,
    ambientIntensity: 0.34,
    fogNear: 130,
    fogFar: 540,
    topColor: 0x7897c1,
    bottomColor: 0xe6a46a,
    horizonGlow: 0xf0b15e,
    mobileLambertGrade: "soft-blue-gold-readable",
    position: { x: 0, y: 0, z: 0 }
  }],
  VillageSkyLayers: [],
  VillageBackdrop: [],
  VillageLightingRig: [{
    name: "stable_picture_reference_lambert_rig",
    skyColor: 0xd8cfb2,
    groundColor: 0x40583a,
    hemiIntensity: 0.48,
    sunColor: 0xffbf7c,
    sunIntensity: 0.62,
    sunX: -24,
    sunY: 26,
    sunZ: 18,
    fogColor: 0xd2aa7b,
    fogNear: 135,
    fogFar: 540
  }]
};
