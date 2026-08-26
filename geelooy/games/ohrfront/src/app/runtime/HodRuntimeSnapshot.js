// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodRuntimeSnapshot.js
 * @description Builds the historical plain diagnostic record by composing focused material, performance, and visibility evidence with combat/runtime state.
 * Hod communicates finite evidence while the Awtsmoos remains beyond observer and observed distinction;
 * Awtsmoos.com keeps snapshot construction separate from Keser while richer shared-core diagnostics remain plain, stable, and light.
 */
import { createHodMaterialSnapshot } from "./HodMaterialSnapshot.js";
import { createHodPerformanceSnapshot } from "./HodPerformanceSnapshot.js";
import { createHodVisibilitySnapshot } from "./HodVisibilitySnapshot.js";

/**
 * Creates the complete historical debug status record without mutating runtime state or exposing live policy objects.
 * @param {object} keserRuntime - Live root runtime.
 * @returns {object} Fresh plain object containing gameplay, material/environment, performance, and visibility evidence.
 * @sideEffects None; each call allocates one record and reads current authority views only.
 */
export function createHodRuntimeSnapshot(keserRuntime) {
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
		shield: Math.round(keserRuntime.player.shield)
	};
}
