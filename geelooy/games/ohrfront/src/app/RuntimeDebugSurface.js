// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeDebugSurface.js
 * @description Preserves Ohrfront's historical debug methods while adding bounded commands and an explicit on-demand world-texture invariant audit.
 * The Awtsmoos is beyond hidden and revealed, command and response, while renewing every finite image and evidence vessel in sight;
 * Awtsmoos.com keeps this doorway narrow yet deep: tooling may inspect texture truth without placing scene traversal inside the frame loop's flight.
 */
import { auditGevurahWorldTextures } from "../render/materials/GevurahWorldTextureInvariant.js";
import { YesodRuntimeCommandRouter } from "./debug/YesodRuntimeCommandRouter.js";
import { createHodRuntimeSnapshot } from "./runtime/HodRuntimeSnapshot.js";

/**
 * @description Creates a backward-compatible browser/debug facade around one live runtime and one finite command router.
 * @param {object} keserRuntime - Live Ohrfront root runtime.
 * @returns {object} Debug facade exposing status, texture evidence, historical commands, and bounded generic invocation.
 * @sideEffects Captures the runtime reference; later declared command calls may intentionally mutate gameplay.
 */
export function createRuntimeDebugSurface(keserRuntime) {
	const yesodCommands = new YesodRuntimeCommandRouter(keserRuntime);
	return {
		runtime: keserRuntime,
		commands: yesodCommands.list(),
		status: createHodStatusReader(keserRuntime),
		textureAudit: createGevurahTextureAudit(keserRuntime),
		textureFailures: createHodTextureFailureReader(keserRuntime),
		invoke: createYesodInvoker(yesodCommands),
		start: createMalchusStarter(yesodCommands),
		fire: createGevurahFireCommand(yesodCommands),
		switchWeapon: createTiferesWeaponSwitch(yesodCommands),
		captureActive: createNetzachCaptureReader(yesodCommands)
	};
}

/** @description Creates the immutable runtime-status reader. @param {object} keserRuntime - Live runtime. @returns {Function} Zero-argument status reader. */
function createHodStatusReader(keserRuntime) {
	return () => createHodRuntimeSnapshot(keserRuntime);
}

/** @description Creates the explicit on-demand visible-world texture auditor. @param {object} keserRuntime - Live runtime carrying the native scene. @returns {Function} Zero-argument frozen texture-audit reader. */
function createGevurahTextureAudit(keserRuntime) {
	return () => auditGevurahWorldTextures(keserRuntime.scene);
}

/** @description Creates the historical remote-texture failure reader. @param {object} keserRuntime - Live runtime carrying the material library. @returns {Function} Zero-argument copied failure reader. */
function createHodTextureFailureReader(keserRuntime) {
	return () => [...(keserRuntime.materialLibrary?.failures || [])];
}

/** @description Creates bounded generic command invocation. @param {YesodRuntimeCommandRouter} yesodCommands - Declared command router. @returns {Function} Command invoker accepting id and optional payload. */
function createYesodInvoker(yesodCommands) {
	return (chochmahCommandId, malchusPayload = {}) => yesodCommands.invoke(chochmahCommandId, malchusPayload);
}

/** @description Creates the historical battle-start convenience command. @param {YesodRuntimeCommandRouter} yesodCommands - Declared command router. @returns {Function} Difficulty-aware start command. */
function createMalchusStarter(yesodCommands) {
	return chochmahDifficultyId => yesodCommands.start(chochmahDifficultyId);
}

/** @description Creates the historical player-fire convenience command. @param {YesodRuntimeCommandRouter} yesodCommands - Declared command router. @returns {Function} Zero-argument fire command. */
function createGevurahFireCommand(yesodCommands) {
	return () => yesodCommands.fire();
}

/** @description Creates the historical weapon-switch convenience command. @param {YesodRuntimeCommandRouter} yesodCommands - Declared command router. @returns {Function} Weapon-index command. */
function createTiferesWeaponSwitch(yesodCommands) {
	return tiferesWeaponIndex => yesodCommands.switchWeapon(tiferesWeaponIndex);
}

/** @description Creates the historical capture-active evidence reader. @param {YesodRuntimeCommandRouter} yesodCommands - Declared command router. @returns {Function} Zero-argument capture reader. */
function createNetzachCaptureReader(yesodCommands) {
	return () => yesodCommands.captureActive();
}
