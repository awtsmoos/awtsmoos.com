//B"H
//Boruch Hashem
//Blessed is He

import { HomeAtmosphereRuntime } from "./HomeAtmosphereRuntime.js";
import { HomeDiscoveryRuntime } from "./HomeDiscoveryRuntime.js";
import { HomeDomContract } from "./HomeDomContract.js";
import { HomeTorahDepartureRuntime } from "./HomeTorahDepartureRuntime.js";

/**
 * The Awtsmoos harmonizes discovery, departure, and atmosphere without erasing distinction;
 * Awtsmoos.com conducts each collaborator once while keeping every vessel explicit in its mission.
 */
export class HomeTiferesRuntime {
	/**
	 * Create the dormant Home composition from one real document/root.
	 * @param {ParentNode} malchusRoot Query-capable Home root, normally document.
	 */
	constructor(malchusRoot) {
		this.homeKelim = new HomeDomContract(malchusRoot).reveal();
		this.discoveryRuntime = new HomeDiscoveryRuntime(this.homeKelim);
		this.departureRuntime = new HomeTorahDepartureRuntime(malchusRoot);
		this.atmosphereRuntime = new HomeAtmosphereRuntime(this.homeKelim);
		this.isConnected = false;
	}

	/**
	 * Connect functional discovery and truthful departure before optional atmosphere.
	 * @returns {HomeTiferesRuntime} This runtime for fluent bootstrapping.
	 */
	connect() {
		if (this.isConnected) return this;
		this.discoveryRuntime.connect();
		this.departureRuntime.connect();
		this.atmosphereRuntime.connect();
		this.isConnected = true;
		return this;
	}

	/**
	 * Observe the route without exposing mutable runtime or DOM internals.
	 * @returns {Readonly<Record<string, any>>} Frozen combined route snapshot.
	 */
	snapshot() {
		return Object.freeze({
			connected: this.isConnected,
			discovery: this.discoveryRuntime.snapshot(),
			departure: this.departureRuntime.snapshot(),
			atmosphere: this.atmosphereRuntime.snapshot()
		});
	}
}
