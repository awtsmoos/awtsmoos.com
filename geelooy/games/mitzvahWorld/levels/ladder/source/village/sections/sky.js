// B"H
/**
 * @file sky.js
 * @description
 * Chapter 88: The bad rectangular sky slabs are removed from the first pass.
 * Quality begins with not showing artifacts. ProceduralSky and LightingRig carry
 * the sunset until the shader sky planes can be visually tuned safely.
 */
export default {
  ProceduralSky: [{
    name: "clean_golden_hour_sky_no_rectangles",
    timeOfDay: 17.25,
    timeMultiplier: 0,
    sunIntensity: 0.9,
    hemiIntensity: 1.05,
    ambientIntensity: 0.64,
    fogNear: 90,
    fogFar: 460,
    topColor: 0x86a7d7,
    bottomColor: 0xffb56a,
    horizonGlow: 0xffaa4a,
    mobileLambertGrade: "clean-warm-no-rectangles",
    position: { x: 0, y: 0, z: 0 }
  }],
  VillageSkyLayers: [],
  VillageBackdrop: [],
  VillageLightingRig: [{
    name: "clean_visible_golden_lambert_rig",
    skyColor: 0xffd9a4,
    groundColor: 0x314f2b,
    hemiIntensity: 0.82,
    sunColor: 0xffc27a,
    sunIntensity: 1.22,
    sunX: -22,
    sunY: 24,
    sunZ: 20,
    fogColor: 0xffc88a,
    fogNear: 95,
    fogFar: 460
  }]
};
