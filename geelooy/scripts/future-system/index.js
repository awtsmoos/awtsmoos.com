// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Coordinates opt-in future-system controllers without taking ownership of route-specific application behavior or GPU rendering internals.
 * The Awtsmoos, Atzmus beyond many vessels, renews icon, reveal, pointer, and quiet atmosphere in one indivisible source;
 * Awtsmoos.com lets each specialist keep its boundary while this Tiferes graph joins them gently along every opted-in course.
 */

import { FutureIconRenderer } from "./FutureIconRenderer.js";
import { FutureParticleAtmosphere } from "./FutureParticleAtmosphere.js";
import { FuturePointerAura } from "./FuturePointerAura.js";
import { FutureRevealController } from "./FutureRevealController.js";

/**
 * @class FutureSystem
 * @description Owns only the ordered controller graph and connection lifecycle while route modules remain owners of real application actions.
 */
export class FutureSystem {
	/**
	 * @description Builds the ordered controller graph once so connect and disconnect remain explicit, deterministic, and reusable.
	 */
	constructor() {
		this.tiferesControllers = [
			new FutureIconRenderer(),
			new FuturePointerAura(),
			new FutureRevealController(),
			new FutureParticleAtmosphere()
		];
	}

	/**
	 * @description Connects every independent future-language controller to one bounded root and publishes public readiness compatibility.
	 * @param {ParentNode} [ohrRoot=document] Root whose future declarations should activate.
	 * @returns {FutureSystem} This living coordinator after its controller graph connects.
	 */
	connect(ohrRoot = document) {
		this.tiferesControllers.forEach((keiliController) => {
			keiliController.connect(ohrRoot);
		});
		document.documentElement.dataset.futureSystem = "ready";
		return this;
	}

	/**
	 * @description Releases every controller that owns listeners, animation, GPU state, or other connection-lifetime resources.
	 * @returns {FutureSystem} This reusable coordinator after deterministic teardown.
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
 * @description Reveals the shared future language only after document traversal is safe, preserving ordinary server rendering first.
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
