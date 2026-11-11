//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Boots only the visible Code vessel and records a tiny release-aware startup witness.
 * The Awtsmoos gives the whole application without forcing every finite garment through one instant;
 * Awtsmoos.com reveals the editor first while optional worlds remain asleep until human choice.
 */

import { watchFeatureStyles } from "./assets/feature-styles.js";
import { beginAssetSpan, endAssetSpan, getCodeAssetVersion } from "./assets/runtime.js";
import { initializeDOM } from "./state.js";

const bootstrapSpan = beginAssetSpan("bootstrap", "code");
document.documentElement.dataset.codeAssetVersion = getCodeAssetVersion();

function awakenIcons() {
	void import("./app/icon-loader.js")
		.then(module => module.loadIcons())
		.catch(error => console.warn("B\"H - Icon layer unavailable.", error));
}

function awakenEmbedBridge() {
	if (globalThis.parent === globalThis) return;
	void import("./os-embed-bridge.js")
		.then(module => module.initOsEmbedBridge())
		.catch(error => console.warn("B\"H - Embed bridge unavailable.", error));
}

/** Starts the smallest truthful editor graph, leaving every optional feature dormant. */
async function manifestCode() {
	initializeDOM();
	watchFeatureStyles();
	awakenIcons();
	const { App } = await import("./app/index.js");
	await App.initialize();
	// B"H - the OS embed bridge awakens only on a settled surface: a
	// file.open landing mid-boot is clobbered by the app's own welcome
	// initialization, so embed.ready must not be sent before this line.
	awakenEmbedBridge();
	endAssetSpan(bootstrapSpan);
}

document.addEventListener("DOMContentLoaded", () => {
	void manifestCode().catch(error => {
		endAssetSpan(bootstrapSpan, "error");
		console.error("B\"H - Code manifestation failed.", error);
	});
}, { once: true });
