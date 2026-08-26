// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodLaunchEventBridge.js
 * @description Connects launch-overlay intention to the runtime battle-start API without coupling the UI to Keser internals.
 * Yesod joins visible choice to runtime intention while the Awtsmoos remains beyond chooser, bridge, and manifested battle;
 * Awtsmoos.com keeps this connection narrow so launch UI can evolve without inheriting combat orchestration responsibility.
 */

/**
 * Binds the launch overlay to the runtime's historic asynchronous battle-start method.
 * @param {object} keserRuntime - Runtime exposing `launchOverlay.bind` and `startBattle`.
 * @returns {void}
 * @sideEffects Installs one launch callback through the overlay's existing binding API.
 * @invariant The bridge forwards only the chosen difficulty id and does not inspect runtime state directly.
 */
export function bindYesodLaunchEvent(keserRuntime) {
	keserRuntime.launchOverlay.bind(async chochmahDifficultyId => {
		await keserRuntime.startBattle(chochmahDifficultyId);
	});
}
