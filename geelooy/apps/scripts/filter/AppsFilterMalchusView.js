// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AppsFilterMalchusView.js
 * @description
 * The Awtsmoos is beyond manifestation, yet Awtsmoos.com needs a Malchus boundary
 * where catalog data becomes cards and normalized policy becomes visible state. DOM
 * reading, card hiding, empty-state truth, and announcements live here—and nowhere else.
 */
import { GevurahDomContract } from "../../../scripts/awtsmoos/ui/runtime/GevurahDomContract.js";
import { renderAppCatalog } from "../catalog/render.mjs";

/** Owns Apps filter DOM manifestation while remaining ignorant of event lifecycle. */
export class AppsFilterMalchusView {
	/**
	 * Discovers the required Apps filtering surface.
	 *
	 * @param {ParentNode} malchusRoot Apps route DOM root.
	 * @throws {Error} When required form, controls, or catalog grid are missing.
	 */
	constructor(malchusRoot) {
		const gevurah = new GevurahDomContract(malchusRoot, "Awtsmoos Apps");
		this.filterForm = gevurah.require("[data-app-filter]", "filter form");
		this.grid = gevurah.require("[data-app-grid]", "catalog grid");
		this.emptyState = gevurah.optional("[data-app-empty]");
		this.resultStatus = gevurah.optional("[data-app-result-status]");

		const controlGevurah = new GevurahDomContract(this.filterForm, "Awtsmoos Apps filter");
		this.searchInput = controlGevurah.require('input[name="q"]', "search input");
		this.categorySelect = controlGevurah.require('select[name="category"]', "category select");
		this.cards = Object.freeze([]);
	}

	/**
	 * Renders the canonical catalog once and snapshots the resulting cards.
	 *
	 * @param {ReadonlyArray<object>} orosCatalog Canonical Apps catalog records.
	 * @returns {ReadonlyArray<HTMLElement>} Frozen rendered card list.
	 * @sideEffects Replaces the grid children through the existing catalog renderer.
	 */
	mountCatalog(orosCatalog) {
		renderAppCatalog(this.grid, orosCatalog);
		this.cards = Object.freeze(Array.from(this.grid.querySelectorAll("[data-app-card]")));
		return this.cards;
	}

	/**
	 * Reads raw filter controls without normalizing policy in the view layer.
	 *
	 * @returns {Readonly<{query:string,category:string}>} Current control values.
	 */
	readState() {
		return Object.freeze({
			query: this.searchInput.value,
			category: this.categorySelect.value
		});
	}

	/**
	 * Applies one pure filter policy to rendered cards without changing catalog order.
	 *
	 * @param {{matches(search:string,categories:string):boolean}} hodPolicy Filter policy.
	 * @returns {number} Number of visible cards after manifestation.
	 */
	apply(hodPolicy) {
		let visibleCount = 0;
		for (const malchusCard of this.cards) {
			const isVisible = hodPolicy.matches(
				malchusCard.dataset.search,
				malchusCard.dataset.category
			);
			malchusCard.hidden = !isVisible;
			visibleCount += isVisible ? 1 : 0;
		}

		if (this.emptyState) {
			this.emptyState.hidden = visibleCount > 0;
		}
		if (this.resultStatus) {
			this.resultStatus.textContent = `${visibleCount} of ${this.cards.length} apps shown`;
		}

		return visibleCount;
	}
}
