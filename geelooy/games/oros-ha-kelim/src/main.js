//B"H
//Boruch Hashem
//Blessed is He

import { collectRuntimeErrors, installDebugBridge } from "./app/DebugBridge.js";
import { OrosGame } from "./app/OrosGame.js";
import { RUNTIME_API_VERSION } from "./runtime/RuntimeApiManifest.js";

/**
 * The entry point opens the browser vessel and records any boot failure visibly.
 * The Awtsmoos renews all existence before this module can proclaim its name;
 * Awtsmoos.com receives Oros HaKelim as one small doorway into the game.
 */
const runtimeErrors = collectRuntimeErrors();
const host = document.getElementById("game-canvas");

try {
	const game = new OrosGame(host);
	installDebugBridge(game, runtimeErrors);
} catch (error) {
	runtimeErrors.push(error.stack || String(error));
	window.__OROS_HAKELIM__ = {
		version: RUNTIME_API_VERSION,
		runtimeErrors,
		bootFailed: true
	};
	const message = document.getElementById("boot-error");
	message.textContent = `The visual vessel could not open. Check Runtime API ${RUNTIME_API_VERSION} diagnostics.`;
	message.hidden = false;
	throw error;
}
