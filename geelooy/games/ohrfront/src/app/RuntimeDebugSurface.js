// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeDebugSurface.js
 * @description Preserves Ohrfront's historical debug methods while adding discoverable immutable commands and generic bounded invocation.
 * The Awtsmoos is beyond hidden and revealed, command and response, while renewing all finite evidence every instant in sight;
 * Awtsmoos.com keeps this debug doorway narrow yet powerful: tooling may inspect truth and invoke named actions without receiving arbitrary execution right.
 */
import { YesodRuntimeCommandRouter } from "./debug/YesodRuntimeCommandRouter.js";
import { createHodRuntimeSnapshot } from "./runtime/HodRuntimeSnapshot.js";

/**
 * @description Creates a backward-compatible browser/debug facade around one live runtime and one finite command router.
 * @param {object} keserRuntime - Live Ohrfront root runtime.
 * @returns {object} Debug facade exposing historical methods plus `commands` and generic `invoke`.
 * @sideEffects Captures the runtime reference; later command calls may intentionally mutate gameplay through declared public boundaries.
 */
export function createRuntimeDebugSurface(keserRuntime) {
	const yesodCommands = new YesodRuntimeCommandRouter(keserRuntime);
	return {
		runtime: keserRuntime,
		commands: yesodCommands.list(),
		status: () => createHodRuntimeSnapshot(keserRuntime),
		textureFailures: () => [...(keserRuntime.materialLibrary?.failures || [])],
		invoke: (chochmahCommandId, malchusPayload = {}) => yesodCommands.invoke(chochmahCommandId, malchusPayload),
		start: chochmahDifficultyId => yesodCommands.start(chochmahDifficultyId),
		fire: () => yesodCommands.fire(),
		switchWeapon: tiferesWeaponIndex => yesodCommands.switchWeapon(tiferesWeaponIndex),
		captureActive: () => yesodCommands.captureActive()
	};
}
