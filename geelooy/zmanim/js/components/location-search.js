//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos holds every city in one creation while human use benefits from a short remembered path;
 * Awtsmoos.com keeps worldwide search and keyboard control separate from the recent-place craft.
 */

import { ChesedGeocodingService } from "../services/geocoding-service.js";
import { NetzachLocationRecentsController } from "./location-recents.js";
import { BinahLocationSearchView } from "./location-search-view.js";

/** Accessible debounced worldwide autocomplete with bounded local recent-place shortcuts. */
export class AwtsmoosLocationSearch extends HTMLElement {
	constructor() {
		super();
		this.service = new ChesedGeocodingService();
		this.results = [];
		this.activeIndex = -1;
	}

	set selectedLocation(location) {
		this.currentLocation = location;
		if (this.elements) {
			BinahLocationSearchView.updateCurrent(this.elements, location);
		}
	}

	connectedCallback() {
		this.elements = BinahLocationSearchView.mount(this);
		this.recents = new NetzachLocationRecentsController(this.elements.recents);
		this.renderRecents();
		BinahLocationSearchView.updateCurrent(this.elements, this.currentLocation);
		this.elements.input.addEventListener("input", event => {
			this.scheduleSearch(event.target.value);
		});
		this.addEventListener("keydown", event => {
			this.handleKeydown(event);
		});
	}

	renderRecents() {
		this.recents.render(location => {
			this.selectLocation(location);
		});
	}

	scheduleSearch(query) {
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			this.loadResults(query);
		}, 280);
	}

	async loadResults(query) {
		this.controller?.abort();
		this.controller = new AbortController();
		const trimmed = query.trim();
		if (trimmed.length < 2) {
			this.elements.status.textContent = trimmed ? "Type at least two characters." : "";
			this.clearResults();
			return;
		}
		this.elements.status.textContent = "Searching…";
		try {
			this.results = await this.service.search(trimmed, { signal: this.controller.signal });
			this.activeIndex = -1;
			this.renderResults();
		} catch (error) {
			if (error.name !== "AbortError") {
				this.elements.status.textContent = "Search is unavailable; current zmanim stay intact.";
				this.clearResults();
			}
		}
	}

	renderResults() {
		const count = this.results.length;
		this.elements.status.textContent = count ? `${count} places found.` : "No matching places.";
		this.elements.input.setAttribute("aria-expanded", String(count > 0));
		BinahLocationSearchView.populate(this.elements.list, this.results, index => {
			this.selectLocation(this.results[index]);
		});
	}

	handleKeydown(event) {
		if (event.key === "Escape") {
			this.clearResults();
			this.elements.input.focus();
			return;
		}
		const navigationKeys = ["ArrowDown", "ArrowUp", "Enter"];
		if (!this.results.length || !navigationKeys.includes(event.key)) {
			return;
		}
		event.preventDefault();
		if (event.key === "Enter" && this.activeIndex >= 0) {
			this.selectLocation(this.results[this.activeIndex]);
			return;
		}
		this.moveActiveResult(event.key === "ArrowDown" ? 1 : -1);
	}

	moveActiveResult(delta) {
		if (this.activeIndex < 0) {
			this.activeIndex = delta > 0 ? 0 : this.results.length - 1;
		} else {
			this.activeIndex = (this.activeIndex + delta + this.results.length) % this.results.length;
		}
		BinahLocationSearchView.markActive(this.elements.list, this.activeIndex);
	}

	selectLocation(location) {
		if (!location) {
			return;
		}
		this.currentLocation = location;
		this.recents.remember(location, recentLocation => {
			this.selectLocation(recentLocation);
		});
		BinahLocationSearchView.updateCurrent(this.elements, location);
		this.elements.input.value = "";
		this.clearResults();
		this.elements.status.textContent = `Using ${location.label}.`;
		this.dispatchEvent(new CustomEvent("location-select", { bubbles: true, detail: { location } }));
	}

	clearResults() {
		this.elements.list.replaceChildren();
		this.elements.input.setAttribute("aria-expanded", "false");
		this.activeIndex = -1;
	}
}

customElements.define("awtsmoos-location-search", AwtsmoosLocationSearch);
