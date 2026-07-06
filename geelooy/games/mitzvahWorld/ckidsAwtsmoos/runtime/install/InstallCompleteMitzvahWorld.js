// B"H
/** @file InstallCompleteMitzvahWorld.js @description Complete installer with loading, animation, actors, equipment, gear stats, and peruta economy. */
import { installMitzvahWorldRuntime } from "./InstallMitzvahWorldRuntime.js";
import { installGeneratedWorldActors } from "./InstallGeneratedWorldActors.js";
import { installBetterLoadingPlan } from "./InstallBetterLoadingPlan.js";
import { installAnimationRuntime } from "../../animations/runtime/InstallAnimationRuntime.js";
import { installEquippedWeaponFeaturePack } from "../../equipment/runtime/EquippedWeaponFeaturePack.js";
import { installEconomyFeaturePack } from "../../economy/runtime/EconomyFeaturePack.js";
import { createGearSlotRuntime } from "../../gear/runtime/GearSlotRuntime.js";
import { resolveEquipmentStats } from "../../gear/runtime/EquipmentStatsResolver.js";
export function installCompleteMitzvahWorld(seed={}){ const install=installMitzvahWorldRuntime(seed); const loading=installBetterLoadingPlan(install.runtime); const animation=installAnimationRuntime(install.runtime); const equipment=installEquippedWeaponFeaturePack(install.runtime); const economy=installEconomyFeaturePack(install.runtime, seed.economy||{}); const gear=createGearSlotRuntime(install.runtime); install.runtime.gear={ slots:gear, resolveStats:(actorId="player")=>resolveEquipmentStats({ gearSlots:gear.snapshot(actorId).slots, weaponId:equipment.state.current(actorId)?.itemId }) }; const actors=installGeneratedWorldActors(install.runtime, seed.worldIntent||install.world); install.runtime.markReady("runtime:playable",{proof:"installer-smoke",loadingSteps:loading.steps.length,animationClips:animation.clips.length,equipmentItems:equipment.items.length}); install.runtime.markReady("runtime:complete-six-step",{actors}); return { ...install, loading, animation, equipment, economy, gear:install.runtime.gear, actors, proof:install.runtime.snapshot() }; }
export default installCompleteMitzvahWorld;
