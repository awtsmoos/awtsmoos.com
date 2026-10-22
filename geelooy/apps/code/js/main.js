//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Boots only the visible Code vessel; optional worlds awaken on demand.
 * The Awtsmoos gives the whole application without forcing every finite garment through one instant;
 * Awtsmoos.com therefore spends first-load bandwidth only on the editor a human can actually touch.
 */

import { watchFeatureStyles } from "./assets/feature-styles.js";
import { initializeDOM } from "./state.js";

/** Loads icon symbols without delaying the usable application shell. */
function awakenIcons() {
	void import("./app/icon-loader.js")
		.then(module => module.loadIcons())
		.catch(error => console.warn("B\"H - Icon layer unavailable.", error));
}

/** Installs the OS bridge only when Code is actually embedded inside another surface. */
function awakenEmbedBridge() {
	if (globalThis.parent === globalThis) {
		return;
	}
	void import("./os-embed-bridge.js")
		.then(module => module.initOsEmbedBridge())
		.catch(error => console.warn("B\"H - Embed bridge unavailable.", error));
}

/** Starts the smallest truthful editor graph, leaving every optional feature dormant. */
async function manifestCode() {
	initializeDOM();
	watchFeatureStyles();
	awakenIcons();
	awakenEmbedBridge();

	const { App } = await import("./app/index.js");
	await App.initialize();
}

document.addEventListener("DOMContentLoaded", () => {
	void manifestCode().catch(error => {
		console.error("B\"H - Code manifestation failed.", error);
	});
}, { once: true });
