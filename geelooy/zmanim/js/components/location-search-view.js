//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gathers distant names into one searchable field and a small remembered trail;
 * Awtsmoos.com keeps remote text safe while current place, recents, and search results remain legible.
 */

/** Presentation helper for the worldwide location autocomplete component. */
export class BinahLocationSearchView {
	static mount(host) {
		host.innerHTML = `
			<div class="place-heading"><span class="field-label">Place</span><strong class="current-place">Choose a location</strong><span class="current-zone"></span></div>
			<div class="search-box">
				<input id="zmanim-place-search" type="search" autocomplete="off" placeholder="Search city or ZIP…" aria-label="Search city or postal code" aria-autocomplete="list" aria-controls="zmanim-place-results" aria-expanded="false">
				<span class="search-mark" aria-hidden="true">⌕</span>
			</div>
			<div class="recent-places" aria-label="Recent places"></div>
			<div class="search-status" aria-live="polite"></div>
			<div id="zmanim-place-results" class="search-results" role="listbox"></div>`;
		return {
			input: host.querySelector("input"),
			status: host.querySelector(".search-status"),
			list: host.querySelector(".search-results"),
			recents: host.querySelector(".recent-places"),
			place: host.querySelector(".current-place"),
			zone: host.querySelector(".current-zone")
		};
	}

	static updateCurrent(elements, location) {
		if (!location) {
			return;
		}
		elements.place.textContent = location.label || location.name;
		elements.zone.textContent = `${location.timezone} · ${Number(location.latitude).toFixed(3)}, ${Number(location.longitude).toFixed(3)}`;
	}

	static populateRecents(list, locations, onSelect) {
		list.replaceChildren();
		for (const [index, location] of locations.entries()) {
			const button = document.createElement("button");
			button.type = "button";
			button.className = "recent-place";
			button.textContent = location.name || location.label;
			button.addEventListener("click", () => {
				onSelect(index);
			});
			list.append(button);
		}
	}

	static populate(list, results, onSelect) {
		list.replaceChildren();
		results.forEach((location, index) => {
			const button = document.createElement("button");
			button.type = "button";
			button.className = "search-result";
			button.setAttribute("role", "option");
			button.setAttribute("aria-selected", "false");
			button.dataset.index = String(index);
			button.textContent = `${location.label} · ${location.timezone}`;
			button.addEventListener("click", () => {
				onSelect(index);
			});
			list.append(button);
		});
	}

	static markActive(list, activeIndex) {
		const buttons = list.querySelectorAll("button");
		buttons.forEach((button, index) => {
			button.setAttribute("aria-selected", String(index === activeIndex));
		});
		buttons[activeIndex]?.focus();
	}
}
