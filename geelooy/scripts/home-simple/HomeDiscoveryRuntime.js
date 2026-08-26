// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HomeDiscoveryRuntime.js
 * @description
 * The Awtsmoos lets hidden worlds, living search, and identity meet without becoming
 * one crowded mechanism. Awtsmoos.com composes those discovery vessels here while
 * their detailed behavior remains in focused runtimes that can evolve independently.
 */
import createProfileDropdown from "/scripts/awtsmoos/social/profileDropdown.js?v=5";
import { HomeSearchRuntime } from "./HomeSearchRuntime.js";
import { HomeWorldsRuntime } from "./HomeWorldsRuntime.js";

/** Composes Home discovery runtimes while exposing only immutable observable state. */
export class HomeDiscoveryRuntime {
	/**
	 * Creates the route discovery composition without starting side effects.
	 *
	 * @param {Readonly<Record<string, any>>} homeKelim Frozen Home DOM record.
	 */
	constructor(homeKelim) {
		this.homeKelim = homeKelim;
		this.worldsRuntime = new HomeWorldsRuntime(homeKelim);
		this.searchRuntime = null;
		this.profileMounted = false;
		this.isConnected = false;
	}

	/**
	 * Connects Worlds first, then Search with its filter bridge, then profile identity.
	 *
	 * @returns {HomeDiscoveryRuntime} This runtime.
	 * @sideEffects Renders/opens discovery systems and mounts the profile dropdown when present.
	 */
	connect() {
		if (this.isConnected) {
			return this;
		}

		this.worldsRuntime.connect();
		this.searchRuntime = new HomeSearchRuntime(
			this.homeKelim,
			this.worldsRuntime.revealFilterController()
		).connect();

		if (this.homeKelim.profileMount) {
			this.profileMounted = Boolean(createProfileDropdown(this.homeKelim.profileMount));
		}

		this.isConnected = true;
		return this;
	}

	/**
	 * Returns stable discovery state without leaking mutable controller instances.
	 *
	 * @returns {Readonly<Record<string, any>>} Frozen nested discovery snapshot.
	 */
	snapshot() {
		return Object.freeze({
			connected: this.isConnected,
			profileMounted: this.profileMounted,
			worlds: this.worldsRuntime.snapshot(),
			search: this.searchRuntime?.snapshot() || null
		});
	}
}
