// B"H
/**
 * @file sky.js
 * @description
 * Chapter 36: Golden air receives its own authored section.
 * ProceduralSky sets global light color, VillageSkyLayers adds cheap cloud and
 * horizon planes, VillageBackdrop gives distant hills, and VillageLightingRig
 * binds Lambert materials into sunset.
 */
export default {
  ProceduralSky: [{
    name: "golden_hour_reference_sky_lambert",
    timeOfDay: 17.15,
    timeMultiplier: 0,
    sunIntensity: 0.86,
    hemiIntensity: 1.12,
    ambientIntensity: 0.58,
    fogNear: 70,
    fogFar: 410,
    topColor: 0x8fb8df,
    bottomColor: 0xffc17a,
    horizonGlow: 0xffb35a,
    mobileLambertGrade: "warm-fable-reference",
    position: { x: 0, y: 0, z: 0 }
  }],
  VillageSkyLayers: [{ name: "reference_gold_cloud_planes", glowZ: -88, cloudY: 29, cloudOpacity: 0.68 }],
  VillageBackdrop: [{ name: "reference_hills_and_sunset_glow", glowOpacity: 0.28, glowZ: -84 }],
  VillageLightingRig: [{
    name: "reference_golden_hour_lambert_rig",
    skyColor: 0xffd9a4,
    groundColor: 0x31512f,
    hemiIntensity: 0.72,
    sunColor: 0xffc27a,
    sunIntensity: 1.18,
    sunX: -24,
    sunY: 28,
    sunZ: 18,
    fogColor: 0xffc88a,
    fogNear: 75,
    fogFar: 420
  }]
};
