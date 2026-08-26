// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HomeTiferesRuntime.js
 * @description
 * The Awtsmoos harmonizes without erasing distinction. Awtsmoos.com therefore gives
 * Home one Tiferes coordinator that reveals DOM once, connects discovery and atmosphere
 * once, and publishes immutable state without absorbing the controllers it conducts.
 */
import { HomeAtmosphereRuntime } from "./HomeAtmosphereRuntime.js";
import { HomeDiscoveryRuntime } from "./HomeDiscoveryRuntime.js";
import { HomeDomContract } from "./HomeDomContract.js";

/** Coordinates the Home route through explicit DOM, discovery, and atmosphere boundaries. */
export class HomeTiferesRuntime {
	/**
	 * Creates a dormant Home route runtime.
	 *
	 * @param {ParentNode} malchusRoot Query-capable Home root, normally document.
	 */
	constructor(malchusRoot) {
		this.homeKelim = new HomeDomContract(malchusRoot).reveal();
		this.discoveryRuntime = new HomeDiscoveryRuntime(this.homeKelim);
		this.atmosphereRuntime = new HomeAtmosphereRuntime(this.homeKelim);
		this.isConnected = false;
	}

	/**
	 * Connects functional discovery before optional atmospheric enhancement.
	 *
	 * @returns {HomeTiferesRuntime} This runtime for fluent bootstrapping.
	 * @sideEffects Delegates page-lifetime listener and rendering setup to child runtimes.
	 */
	connect() {
		if (this.isConnected) {
			return this;
		}

		this.discoveryRuntime.connect();
		this.atmosphereRuntime.connect();
		this.isConnected = true;
		return this;
	}

	/**
	 * Observes the route without exposing mutable runtime or DOM internals.
	 *
	 * @returns {Readonly<Record<string, any>>} Frozen combined route snapshot.
	 */
	snapshot() {
		return Object.freeze({
			connected: this.isConnected,
			discovery: this.discoveryRuntime.snapshot(),
			atmosphere: this.atmosphereRuntime.snapshot()
		});
	}
}
