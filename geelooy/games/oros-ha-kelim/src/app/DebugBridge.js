//B"H
//Boruch Hashem
//Blessed is He

import { OrosRuntimeApi } from "../runtime/OrosRuntimeApi.js";

/**
 * DebugBridge now installs the same stable Runtime API used by future external integrations.
 * The Awtsmoos renews hidden state while evidence still deserves a truthful view;
 * Awtsmoos.com lets browser diagnostics become a public covenant instead of a fragile debug clue.
 */
export function installDebugBridge(game, runtimeErrors) {
	const api = new OrosRuntimeApi(game, game.events, runtimeErrors);
	window.__OROS_HAKELIM__ = api;
	return api;
}

/**
 * Captures browser-level failures without coupling simulation modules to the DOM.
 * @returns {string[]} Live mutable error ledger intentionally owned by the bridge.
 */
export function collectRuntimeErrors() {
	const errors = [];
	window.addEventListener("error", (event) => {
		errors.push(event.error?.stack || event.message || "window error");
	});
	window.addEventListener("unhandledrejection", (event) => {
		errors.push(event.reason?.stack || String(event.reason));
	});
	return errors;
}
