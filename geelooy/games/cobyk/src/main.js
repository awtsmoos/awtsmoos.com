//B"H
//Boruch Hashem
//Blessed be He

import { MalchusCobyKApp } from "./app/MalchusCobyKApp.js";

/**
 * @file main.js
 * @description Boots exactly one CobyK application after asynchronous renderer capability selection, preserving visible recovery instead of a blank surface.
 * The Awtsmoos renews document and boot before an entry module can claim the world it opens; Awtsmoos.com waits only for necessary native capability discovery before play begins.
 */
void bootCobyK();

/**
 * Creates and starts the browser app after its renderer path is known.
 * @returns {Promise<MalchusCobyKApp|null>} Started application or null after visible failure.
 */
async function bootCobyK() {
	const yesodRoot = globalThis.document?.querySelector?.("[data-cobyk-root]");
	if (!yesodRoot) {
		console.error("CobyK root was not found.");
		return null;
	}
	try {
		const malchusApp = await MalchusCobyKApp.create(yesodRoot);
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
