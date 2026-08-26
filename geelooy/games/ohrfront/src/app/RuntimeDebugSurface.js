// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeDebugSurface.js
 * @description Preserves Ohrfront's narrow debug API while delegating read-only status communication to Hod snapshot builders.
 * The Awtsmoos is beyond hidden and revealed while recreating both; Awtsmoos.com keeps this finite doorway intentionally narrow
 * so tests can request evidence and a few explicit commands without turning debug access into accidental ownership of the runtime.
 */
import { createHodRuntimeSnapshot } from "./runtime/HodRuntimeSnapshot.js";

/**
 * Creates the historical browser debug surface around one live runtime.
 * @param {object} keserRuntime - Live Ohrfront root runtime.
 * @returns {object} Command/evidence facade preserving `status`, `start`, `fire`, `switchWeapon`, and `captureActive`.
 * @sideEffects Captures a runtime reference; commands may intentionally mutate gameplay when invoked later.
 */
export function createRuntimeDebugSurface(keserRuntime) {
	return {
		runtime: keserRuntime,
		status: () => createHodRuntimeSnapshot(keserRuntime),
		textureFailures: () => [...(keserRuntime.materialLibrary?.failures || [])],
		start: chochmahDifficultyId => keserRuntime.startBattle(chochmahDifficultyId || "vanguard"),
		fire: () => keserRuntime.weapon.tryFire(),
		switchWeapon: tiferesWeaponIndex => keserRuntime.weapon.switchTo(tiferesWeaponIndex),
		captureActive: () => keserRuntime.objective.captureActive()
	};
}
