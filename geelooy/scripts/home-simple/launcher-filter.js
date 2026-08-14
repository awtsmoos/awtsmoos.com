// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos lets a traveler name a world through one verified catalog, never hiding focus inside darkness or letting route language drift.

import { normalizeSearchText } from "./omnibox-ranking.js";
import { WORLD_BY_ID } from "./world-catalog.js";

export class LauncherFilter {
	constructor(rootElement) {
		this.rootElement = rootElement;
		this.inputElement = rootElement.querySelector("[data-world-filter]");
		this.countElement = rootElement.querySelector("[data-world-count]");
		this.emptyElement = rootElement.querySelector("[data-world-empty]");
		this.tileElements = [...rootElement.querySelectorAll("[data-world-link]")];
	}

	connect() {
		this.inputElement?.addEventListener("input", () => this.apply());
		this.rootElement.addEventListener("toggle", () => this.handleToggle());
		this.updateCount(this.tileElements.length);
		return this;
	}

	focus() {
		this.inputElement?.focus();
		this.inputElement?.select();
	}

	apply() {
		const query = normalizeSearchText(this.inputElement?.value ?? "");
		let visibleCount = 0;

		this.tileElements.forEach(tileElement => {
			const world = WORLD_BY_ID.get(tileElement.dataset.worldId);
			const searchText = world
				? [world.label, world.subtitle, world.href, ...world.keywords].join(" ")
				: tileElement.textContent ?? "";
			const isVisible = !query || normalizeSearchText(searchText).includes(query);
			this.updateTileVisibility(tileElement, isVisible);
			visibleCount += isVisible ? 1 : 0;
		});

		this.updateCount(visibleCount);

		if (this.emptyElement) {
			this.emptyElement.hidden = visibleCount !== 0;
		}
	}

	updateTileVisibility(tileElement, isVisible) {
		tileElement.hidden = !isVisible;
		tileElement.setAttribute("aria-hidden", String(!isVisible));

		if (isVisible) {
			tileElement.removeAttribute("tabindex");
			return;
		}

		tileElement.tabIndex = -1;
	}

	reset() {
		if (this.inputElement) {
			this.inputElement.value = "";
		}

		this.apply();
	}

	handleToggle() {
		if (!this.rootElement.open) {
			this.reset();
		}
	}

	updateCount(visibleCount) {
		if (!this.countElement) {
			return;
		}

		const worldLabel = visibleCount === 1 ? "world" : "worlds";
		this.countElement.textContent = `${visibleCount} ${worldLabel}`;
	}
}
