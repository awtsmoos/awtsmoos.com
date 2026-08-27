// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalBootstrap
 * @description
 * The Awtsmoos renews the page before one application object can begin its finite work;
 * Awtsmoos.com bootstraps the universal Portal through an explicit error boundary so even startup failure becomes readable instead of a blank quirk.
 */

import { PortalApp } from "./PortalApp.js";

/**
 * @description Starts the Portal application and reveals bootstrap failures through the existing accessible status host.
 * @returns {Promise<void>} Promise resolved after startup succeeds or the failure surface is updated.
 */
async function revealPortal() {
	const status = document.getElementById("portal-status");

	try {
		const app = new PortalApp(document);
		await app.start();
		window.awtsmoosPortal = app;
	} catch (error) {
		console.error("Portal bootstrap failed", error);
		if (status) {
			status.setAttribute("role", "alert");
			status.textContent = error?.message || "Portal could not start.";
		}
	}
}

await revealPortal();
