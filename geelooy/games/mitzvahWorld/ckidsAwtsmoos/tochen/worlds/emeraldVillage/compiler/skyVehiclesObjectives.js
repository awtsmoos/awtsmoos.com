// B"H
/** @file skyVehiclesObjectives.js @description Chapter 361: Sky, vehicles, and first objectives enter before geometry. */
import { ENTRY_OBJECTIVES } from '../entryObjectiveManifest.js';
import { VEHICLE_MANIFEST } from '../vehicleManifest.js';
export function addSkyVehiclesObjectives(n) {
  n.Sky.village_sky = { dayCycle: true, cycleSpeed: 0.001, colors: { day: 0xaad4e6, night: 0x060a18, sunset: 0xd88442 }, haze: true, horizonGlow: 0xeed7a0 };
  Object.assign(n.HotAirBalloon, VEHICLE_MANIFEST.HotAirBalloon || {});
  Object.assign(n.MagicalChariot, VEHICLE_MANIFEST.MagicalChariot || {});
  n.TutorialObjective.entry_objectives = ENTRY_OBJECTIVES;
}
