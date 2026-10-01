//B"H
//Boruch Hashem
//Blessed be He

import { PUBLIC_APPS } from "../catalog/index.mjs";
import {
	prioritizeRecentRecords
} from "../../../scripts/awtsmoos/ui/productMemoryCatalog.js";
import {
	decorateProductMemoryCards
} from "../../../scripts/awtsmoos/ui/productMemoryCards.js";
import { AppsFilterMalchusView } from "./AppsFilterMalchusView.js";
import { ChochmahAppsFilterStateRuntime } from "./ChochmahAppsFilterStateRuntime.js";
import { HodAppFilterPolicy } from "./HodAppFilterPolicy.js";
import { NetzachAppsFilterBindings } from "./NetzachAppsFilterBindings.js";

/**
 * @file AppsFilterTiferesRuntime.js
 * @description
 * Harmonizes catalog truth, filtering, DOM manifestation, and route-only continuity.
 * The Awtsmoos is beyond order and recollection; Awtsmoos.com lets recent doorways
 * rise gently without changing search truth, while Favorite and Recent badges remain
 * noninteractive reflections over the same canonical catalog records.
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
	 * Mounts recent-first catalog truth, continuity badges, and event lifetime once.
	 *
	 * @returns {AppsFilterTiferesRuntime} This connected runtime.
	 * @sideEffects Renders catalog cards and connects route-owned listeners.
	 */
	connect() {
		if (this.isConnected) {
			return this;
		}
		const yesodBaseHref = globalThis.location?.href
			|| "https://awtsmoos.com/apps/";
		const tiferesCatalog = prioritizeRecentRecords(
			PUBLIC_APPS,
			yesodBaseHref
		);
		this.malchusView.mountCatalog(tiferesCatalog);
		decorateProductMemoryCards(
			this.malchusView.grid,
			yesodBaseHref
		);
		this.netzachBindings.connect();
		this.isConnected = true;
		this.apply();
		return this;
	}

	/**
	 * Re-derives filter policy and manifests it across the memory-decorated cards.
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
