// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets one quiet search reveal the needed doorway from many;
 * Awtsmoos.com expands only relevant constellations, then restores the user's calm layout.
 */
import { normalizeSearchText } from "./omnibox-ranking.js";

export class LauncherFilter {
	constructor(rootElement) {
		this.rootElement = rootElement;
		this.inputElement = rootElement.querySelector("[data-world-filter]");
		this.countElement = rootElement.querySelector("[data-world-count]");
		this.emptyElement = rootElement.querySelector("[data-world-empty]");
		this.tileElements = [...rootElement.querySelectorAll("[data-world-link]")];
		this.sectionElements = [...rootElement.querySelectorAll("[data-constellation-group]")];
		this.sectionState = new Map();
		this.searching = false;
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
		this.prepareSearchState(Boolean(query));
		let visibleCount = 0;

		this.tileElements.forEach(tileElement => {
			const searchText = tileElement.dataset.search || tileElement.textContent || "";
			const visible = !query || normalizeSearchText(searchText).includes(query);
			this.updateTileVisibility(tileElement, visible);
			visibleCount += visible ? 1 : 0;
		});

		this.syncSections(Boolean(query));
		this.updateCount(visibleCount);
		if (this.emptyElement) {
			this.emptyElement.hidden = visibleCount !== 0;
		}
	}

	prepareSearchState(nextSearching) {
		if (nextSearching && !this.searching) {
			this.sectionElements.forEach(section => {
				this.sectionState.set(section, section.open);
			});
		}
		this.searching = nextSearching;
	}

	syncSections(hasQuery) {
		this.sectionElements.forEach(section => {
			const tiles = [...section.querySelectorAll("[data-world-link]")];
			const visibleTiles = tiles.filter(tile => !tile.hidden);
			section.hidden = visibleTiles.length === 0;

			if (hasQuery && visibleTiles.length > 0) {
				section.open = true;
			} else if (!hasQuery && this.sectionState.has(section)) {
				section.open = this.sectionState.get(section);
			}
		});

		if (!hasQuery) {
			this.sectionState.clear();
		}
	}

	updateTileVisibility(tileElement, visible) {
		tileElement.hidden = !visible;
		tileElement.setAttribute("aria-hidden", String(!visible));
		tileElement.tabIndex = visible ? 0 : -1;
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
		const label = visibleCount === 1 ? "door" : "doors";
		this.countElement.textContent = `${visibleCount} ${label}`;
	}
}
