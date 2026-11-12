// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AppsFilterMalchusView.js
 * @description
 * Malchus receives catalog light and gives it visible form without owning policy or events.
 * The Awtsmoos recreates control, card, and browser instant from nothing; Awtsmoos.com
 * keeps every DOM read and write inside this final manifestation boundary.
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
		this.letterRow = controlGevurah.optional("[data-app-letters]");
		this.letterButtons = this.letterRow ? Array.from(this.letterRow.querySelectorAll("[data-app-letter]")) : [];
		this.cards = Object.freeze([]);
	}

	/**
	 * Renders the canonical catalog once and snapshots the resulting cards.
	 *
	 * @param {ReadonlyArray<object>} orosCatalog Canonical Apps catalog records.
	 * @returns {ReadonlyArray<HTMLElement>} Frozen rendered card list.
	 * @sideEffects Replaces grid children through the existing catalog renderer.
	 */
	mountCatalog(orosCatalog) {
		renderAppCatalog(this.grid, orosCatalog);
		this.cards = Object.freeze(Array.from(this.grid.querySelectorAll("[data-app-card]")));
		return this.cards;
	}

	/**
	 * Reads raw filter controls without normalizing policy in the view layer.
	 *
	 * @returns {Readonly<{query:string,category:string,letter:string}>} Current control values.
	 */
	readState() {
		const pressed = this.letterButtons.find((button) => button.getAttribute("aria-pressed") === "true");
		return Object.freeze({
			query: this.searchInput.value,
			category: this.categorySelect.value,
			letter: pressed ? String(pressed.dataset.appLetter || "") : ""
		});
	}

	/** Presses one starting-letter button and releases the rest. */
	pressLetter(letter) {
		for (const button of this.letterButtons) {
			button.setAttribute("aria-pressed", String(button.dataset.appLetter === letter));
		}
		return this.readState().letter;
	}

	/**
	 * Writes normalized programmatic state through the single DOM mutation boundary.
	 *
	 * @param {Readonly<{query:string,category:string,letter:string}>} malchusState State to manifest.
	 * @returns {Readonly<{query:string,category:string,letter:string}>} Actual values after native control coercion.
	 * @sideEffects Mutates only the search input, category select, and letter buttons.
	 */
	writeState(malchusState) {
		this.searchInput.value = malchusState.query;
		this.categorySelect.value = malchusState.category;
		this.pressLetter(malchusState.letter || "");
		return this.readState();
	}

	/**
	 * Applies one pure filter policy to rendered cards without changing catalog order.
	 *
	 * @param {{matches(search:string,categories:string,letter:string):boolean}} hodPolicy Filter policy.
	 * @returns {number} Number of visible cards after manifestation.
	 * @sideEffects Updates card hidden states, empty-state visibility, and result text.
	 */
	apply(hodPolicy) {
		let visibleCount = 0;

		for (const malchusCard of this.cards) {
			const isVisible = hodPolicy.matches(
				malchusCard.dataset.search,
				malchusCard.dataset.category,
				malchusCard.dataset.letter
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
