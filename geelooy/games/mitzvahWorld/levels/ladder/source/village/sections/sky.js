// B"H
/**
 * @file sky.js
 * @description
 * Stabilized lighting. Less glare, warmer readable color, no bright washed-out
 * slabs. The scene should stop looking blown out.
 */
export default {
  ProceduralSky: [{
    name: "stable_soft_golden_sky",
    timeOfDay: 16.8,
    timeMultiplier: 0,
    sunIntensity: 0.52,
    hemiIntensity: 0.72,
    ambientIntensity: 0.38,
    fogNear: 110,
    fogFar: 470,
    topColor: 0x7f9fc8,
    bottomColor: 0xe99a55,
    horizonGlow: 0xe88938,
    mobileLambertGrade: "soft-readable-not-blown-out",
    position: { x: 0, y: 0, z: 0 }
  }],
  VillageSkyLayers: [],
  VillageBackdrop: [],
  VillageLightingRig: [{
    name: "stable_dim_golden_lambert_rig",
    skyColor: 0xd9c49a,
    groundColor: 0x2c4328,
    hemiIntensity: 0.52,
    sunColor: 0xffb06a,
    sunIntensity: 0.72,
    sunX: -22,
    sunY: 24,
    sunZ: 20,
    fogColor: 0xd99a62,
    fogNear: 115,
    fogFar: 470
  }]
};
