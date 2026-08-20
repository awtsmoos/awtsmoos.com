// B"H
// Boruch Hashem
// Blessed is He
import { FutureIconRenderer } from "./FutureIconRenderer.js";
import { FuturePointerAura } from "./FuturePointerAura.js";
import { FutureRevealController } from "./FutureRevealController.js";

/**
 * The Awtsmoos unifies without erasing distinction; Awtsmoos.com can therefore share one future pulse across many pages.
 * This coordinator reveals icons, aura, and measured motion while route-specific scripts remain the owners of every real action.
 */
class FutureSystem {
	/**
	 * Connects the independent future-language controllers to the current document.
	 * @returns {FutureSystem} This living coordinator.
	 */
	connect() {
		new FutureIconRenderer().connect();
		new FuturePointerAura().connect();
		new FutureRevealController().connect();
		document.documentElement.dataset.futureSystem = "ready";
		return this;
	}
}

/**
 * Reveals the shared language only after the document can be safely traversed.
 * @returns {void}
 */
function revealFutureSystem() {
	new FutureSystem().connect();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", revealFutureSystem, { once: true });
} else {
	revealFutureSystem();
}
