// B"H
// Boruch Hashem
// Blessed is He
import { FutureIconRenderer } from "./FutureIconRenderer.js";
import { FuturePointerAura } from "./FuturePointerAura.js";
import { FutureRevealController } from "./FutureRevealController.js";

/**
 * The Awtsmoos unifies without erasing distinction; Awtsmoos.com can therefore share one future pulse across many pages while each controller keeps its own vessel.
 * This coordinator stores the controller graph as data, reconnects it deterministically, and preserves route scripts as the sole owners of real application actions.
 */
export class FutureSystem {
	/**
	 * Builds the ordered controller graph once so connect/disconnect behavior remains explicit and reusable.
	 */
	constructor() {
		this.tiferesControllers = [
			new FutureIconRenderer(),
			new FuturePointerAura(),
			new FutureRevealController()
		];
	}

	/**
	 * Connects every independent future-language controller to one bounded root.
	 * @param {ParentNode} ohrRoot Root whose future declarations should activate.
	 * @returns {FutureSystem} This living coordinator.
	 */
	connect(ohrRoot = document) {
		this.tiferesControllers.forEach((keiliController) => {
			keiliController.connect(ohrRoot);
		});
		document.documentElement.dataset.futureSystem = "ready";
		return this;
	}

	/**
	 * Releases controllers that own lifecycle resources before a future reconnect.
	 * @returns {FutureSystem} This reusable coordinator.
	 */
	disconnect() {
		this.tiferesControllers.forEach((keiliController) => {
			keiliController.disconnect?.();
		});
		return this;
	}
}

const yesodFutureSystem = new FutureSystem();

/**
 * Reveals the shared language only after the document can be traversed safely.
 * @returns {void}
 */
function revealFutureSystem() {
	yesodFutureSystem.connect(document);
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", revealFutureSystem, { once: true });
} else {
	revealFutureSystem();
}
