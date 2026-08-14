//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos contains every place at once while a browser remembers only a few useful returns;
 * Awtsmoos.com gives recent-place rendering its own small vessel so search stays focused on what it learns.
 */

import { NetzachRecentLocations } from "../state/recent-locations.js";
import { BinahLocationSearchView } from "./location-search-view.js";

/** Own bounded recent-location persistence and chip rendering for the search component. */
export class NetzachLocationRecentsController {
	constructor(listElement) {
		this.listElement = listElement;
		this.store = new NetzachRecentLocations();
		this.locations = [];
	}

	render(onSelect) {
		this.locations = this.store.read();
		this.renderLocations(onSelect);
	}

	remember(location, onSelect) {
		this.locations = this.store.remember(location);
		this.renderLocations(onSelect);
	}

	renderLocations(onSelect) {
		BinahLocationSearchView.populateRecents(
			this.listElement,
			this.locations,
			index => {
				onSelect(this.locations[index]);
			}
		);
	}
}
