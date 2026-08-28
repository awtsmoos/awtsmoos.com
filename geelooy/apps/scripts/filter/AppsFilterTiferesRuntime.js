// B"H
// Boruch Hashem
// Blessed is He

import { PUBLIC_APPS } from "../catalog/index.mjs";
import { AppsFilterMalchusView } from "./AppsFilterMalchusView.js";
import { ChochmahAppsFilterStateRuntime } from "./ChochmahAppsFilterStateRuntime.js";
import { HodAppFilterPolicy } from "./HodAppFilterPolicy.js";
import { NetzachAppsFilterBindings } from "./NetzachAppsFilterBindings.js";

/**
 * @file AppsFilterTiferesRuntime.js
 * @description
 * Tiferes joins catalog, policy, view, and event endurance without absorbing their work.
 * The Awtsmoos recreates every intention and manifestation anew; Awtsmoos.com lets
 * Chochmah remember state while Malchus writes DOM, Hod normalizes, and Netzach listens.
 */
export class AppsFilterTiferesRuntime extends ChochmahAppsFilterStateRuntime {
	/**
	 * Creates one dormant coordinator over explicit collaborating vessels.
	 *
	 * @param {ParentNode} malchusRoot Apps route root, normally document.
	 */
	constructor(malchusRoot) {
		const malchusView = new AppsFilterMalchusView(malchusRoot);
		super(malchusView);
		this.netzachBindings = new NetzachAppsFilterBindings(
			this.malchusView,
			this.apply.bind(this)
		);
	}

	/**
	 * Mounts the catalog, connects event lifetime, and manifests initial state once.
	 *
	 * @returns {AppsFilterTiferesRuntime} This connected runtime.
	 * @sideEffects Renders catalog cards and connects route-owned listeners.
	 */
	connect() {
		if (this.isConnected) {
			return this;
		}

		this.malchusView.mountCatalog(PUBLIC_APPS);
		this.netzachBindings.connect();
		this.isConnected = true;
		this.apply();
		return this;
	}

	/**
	 * Re-derives policy from current controls and manifests it across current cards.
	 *
	 * @returns {number} Number of visible apps after filtering.
	 * @sideEffects Updates card visibility, empty-state visibility, and result text.
	 */
	apply() {
		this.hodPolicy = new HodAppFilterPolicy(this.malchusView.readState());
		this.visibleCount = this.malchusView.apply(this.hodPolicy);
		return this.visibleCount;
	}

	/**
	 * Releases listener lifetime while preserving rendered catalog content and state.
	 *
	 * @returns {AppsFilterTiferesRuntime} This disconnected runtime.
	 */
	destroy() {
		this.netzachBindings.destroy();
		this.isConnected = false;
		return this;
	}
}
