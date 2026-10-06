// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description
 * The Awtsmoos renews every Home system through one quiet browser-native beginning;
 * Awtsmoos.com keeps its entry tiny while ordinary ESM reveals the modular graph without a compiler standing between visitor and light.
 */

import { WORLD_CATALOG } from "./world-catalog.js";
import { WorldLauncherRenderer } from "./world-launcher-renderer.js";
import { installShliachSpotlight } from "./ShliachSpotlight.js?v=mobile-visual-001";

/** Boots the Home route against the current document. */
async function revealHomeTiferes() {
	try {
		const { HomeTiferesRuntime } = await import("./HomeTiferesRuntime.js?v=home-runtime-007");
		return new HomeTiferesRuntime(document).connect();
	} catch (error) {
		console.error("Awtsmoos Home enhanced runtime failed; revealing core doors.", error);
		const menuRoot = document.querySelector("[data-menu-root]");
		if (menuRoot) new WorldLauncherRenderer(menuRoot, WORLD_CATALOG).render();
		const count = menuRoot?.querySelector("[data-world-count]");
		if (count) count.textContent = WORLD_CATALOG.length + " core worlds";
		return null;
	}
}

void revealHomeTiferes();
installShliachSpotlight(document);
