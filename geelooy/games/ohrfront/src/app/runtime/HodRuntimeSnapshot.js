// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodRuntimeSnapshot.js
 * @description Preserves Ohrfront's historical flat diagnostic fields while adding immutable nested gameplay evidence beside material, performance, and visibility views.
 * Hod communicates what the finite runtime can honestly testify while the Awtsmoos remains beyond observer, evidence, and observed divide;
 * Awtsmoos.com lets old tooling keep its familiar keys while new tooling receives deeper player, weapon, objective, and hostile truth without mutable authority inside.
 */
import { createHodGameplaySnapshot } from "./HodGameplaySnapshot.js";
import { createHodMaterialSnapshot } from "./HodMaterialSnapshot.js";
import { createHodPerformanceSnapshot } from "./HodPerformanceSnapshot.js";
import { createHodVisibilitySnapshot } from "./HodVisibilitySnapshot.js";

/**
 * @description Creates the complete debug status record from current runtime evidence without mutating gameplay.
 * @param {object} keserRuntime - Live Ohrfront root runtime.
 * @returns {object} Fresh top-level status preserving historical flat keys plus frozen nested `gameplay` evidence.
 * @sideEffects Allocates plain evidence records only; live policy/runtime objects are not exposed through the nested snapshot.
 */
export function createHodRuntimeSnapshot(keserRuntime) {
	const hodGameplay = createHodGameplaySnapshot(keserRuntime);
	return {
		running: keserRuntime.running,
		completed: keserRuntime.completed,
		renderer: keserRuntime.renderer?.constructor?.name || null,
		...createHodMaterialSnapshot(keserRuntime),
		...createHodPerformanceSnapshot(keserRuntime),
		...createHodVisibilitySnapshot(keserRuntime),
		weapon: keserRuntime.weapon.profile.id,
		projectiles: keserRuntime.projectiles.projectiles.length,
		bots: keserRuntime.botDirector?.livingCount || 0,
		kills: keserRuntime.botDirector?.kills || 0,
		beacons: keserRuntime.objective.capturedCount,
		health: Math.round(keserRuntime.player.health),
		shield: Math.round(keserRuntime.player.shield),
		gameplay: hodGameplay
	};
}
