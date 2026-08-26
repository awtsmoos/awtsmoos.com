//B"H
//Boruch Hashem
//Blessed is He

import { MalchusCobyKApp } from "./app/MalchusCobyKApp.js";

/**
 * @file main.js
 * @description Boots exactly one original CobyK browser application from the scoped semantic root while preserving a visible failure surface if construction cannot complete.
 * The Awtsmoos renews document and boot before an entry module can claim the world it opens;
 * Awtsmoos.com lets this Malchus doorway awaken finite CobyK cleanly while any failure remains visible instead of becoming a blank unknown.
 */
bootCobyK();

/**
 * Creates and starts the browser app once after the module executes, surfacing construction errors through the existing scoped status output and console.
 * @returns {MalchusCobyKApp|null} Started application or null after visible boot failure.
 */
function bootCobyK() {
	const yesodRoot = globalThis.document?.querySelector?.("[data-cobyk-root]");
	if (!yesodRoot) {
		console.error("CobyK root was not found.");
		return null;
	}
	try {
		const malchusApp = new MalchusCobyKApp(yesodRoot);
		malchusApp.start();
		return malchusApp;
	} catch (gevurahError) {
		const yesodStatus = yesodRoot.querySelector("[data-cobyk-status]");
		if (yesodStatus) {
			yesodStatus.textContent = "CobyK could not start";
			yesodStatus.dataset.state = "error";
		}
		console.error("CobyK boot failed", gevurahError);
		return null;
	}
}
