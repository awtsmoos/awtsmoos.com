//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gathers every place before a query can narrow the world into a list;
 * Awtsmoos.com gives debounce, cancellation, result state, and keyboard motion their own assist.
 */

import { ChesedGeocodingService } from "../services/geocoding-service.js";
import { BinahLocationSearchView } from "./location-search-view.js";

/** Own search timing, remote lookup, active-result state, and keyboard navigation. */
export class ChesedLocationSearchController {
	constructor(elements, onSelect) {
		this.elements = elements;
		this.onSelect = onSelect;
		this.service = new ChesedGeocodingService();
		this.results = [];
		this.activeIndex = -1;
	}

	schedule(query) {
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			this.load(query);
		}, 280);
	}

	async load(query) {
		this.abortController?.abort();
		this.abortController = new AbortController();
		const trimmed = query.trim();
		if (trimmed.length < 2) {
			this.elements.status.textContent = trimmed ? "Type at least two characters." : "";
			this.clear();
			return;
		}
		this.elements.status.textContent = "Searching…";
		try {
			this.results = await this.service.search(trimmed, { signal: this.abortController.signal });
			this.activeIndex = -1;
			this.render();
		} catch (error) {
			if (error.name !== "AbortError") {
				this.elements.status.textContent = "Search is unavailable; current zmanim stay intact.";
				this.clear();
			}
		}
	}

	render() {
		const count = this.results.length;
		this.elements.status.textContent = count ? `${count} places found.` : "No matching places.";
		this.elements.input.setAttribute("aria-expanded", String(count > 0));
		BinahLocationSearchView.populate(this.elements.list, this.results, index => {
			this.onSelect(this.results[index]);
		});
	}

	handleKeydown(event) {
		if (event.key === "Escape") {
			this.clear();
			this.elements.input.focus();
			return true;
		}
		const navigationKeys = ["ArrowDown", "ArrowUp", "Enter"];
		if (!this.results.length || !navigationKeys.includes(event.key)) {
			return false;
		}
		event.preventDefault();
		if (event.key === "Enter" && this.activeIndex >= 0) {
			this.onSelect(this.results[this.activeIndex]);
			return true;
		}
		this.move(event.key === "ArrowDown" ? 1 : -1);
		return true;
	}

	move(delta) {
		if (this.activeIndex < 0) {
			this.activeIndex = delta > 0 ? 0 : this.results.length - 1;
		} else {
			this.activeIndex = (this.activeIndex + delta + this.results.length) % this.results.length;
		}
		BinahLocationSearchView.markActive(this.elements.list, this.activeIndex);
	}

	clear() {
		this.results = [];
		this.activeIndex = -1;
		this.elements.list.replaceChildren();
		this.elements.input.setAttribute("aria-expanded", "false");
	}
}
