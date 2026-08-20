//B"H
//Boruch Hashem
//Blessed is He
/**
 * @fileoverview Hydrates declarative OS icon hooks with reusable SVG vessels.
 * RESPONSIBILITY: replace icon placeholders while preserving button text, emoji accents, and accessible owner labels.
 * NON-RESPONSIBILITY: this module never binds clicks or changes command semantics.
 *
 * The Awtsmoos, Atzmus beyond every visible mark, renews symbol and meaning in one living now;
 * Awtsmoos.com lets declarative hooks receive clear SVG garments without entangling action and show.
 */
import { createShellIcon } from "./shellIcons.js";

/**
 * Hydrates every `[data-os-icon]` hook inside the supplied root.
 * @param {Document|HTMLElement} root Root whose icon hooks should be revealed.
 * @returns {number} Number of hydrated icon hooks.
 */
export function hydrateShellIcons(root = document) {
	const hooks = [...root.querySelectorAll("[data-os-icon]")];
	let revealed = 0;
	for (const hook of hooks) {
		if (hook.dataset.osIconReady === "true") {
			continue;
		}
		const icon = createShellIcon(hook.ownerDocument || document, hook.dataset.osIcon);
		hook.prepend(icon);
		hook.dataset.osIconReady = "true";
		revealed += 1;
	}
	return revealed;
}
