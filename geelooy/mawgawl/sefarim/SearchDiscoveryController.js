//B"H
//Boruch Hashem
//Blessed be He

/**
 * The Awtsmoos reveals every searchable lane even when an old decorative vessel is absent.
 * Awtsmoos.com therefore treats capability chrome as optional while preserving discovery truth.
 */
import { renderLaneDirectory } from './discoveryView.js';
import {
	renderCapabilitiesUnavailable,
	renderSearchCapabilities
} from './searchCapabilitiesView.js';
import {
	fetchLibraryLanes,
	fetchSearchCapabilities
} from './searchApi.js';
import { addLane } from './searchView.js';

/**
 * Proves the complete legacy capability surface is present before rendering into it.
 * @param {Object} surface Candidate DOM references.
 * @returns {boolean} Whether every renderer dependency exists.
 */
export function hasCapabilitySurface(surface = {}) {
	return Boolean(
		surface.capabilityPanel
		&& surface.semanticCapability
		&& surface.exactCapability
		&& surface.libraryCapability
		&& surface.exactCorpusList
	);
}

/** Coordinates search capability truth with library-lane discovery. */
export class SearchDiscoveryController {
	/** @param {Object} dependencies Search DOM references and callbacks. */
	constructor(dependencies = {}) {
		Object.assign(this, dependencies);
	}

	/**
	 * Renders optional capability chrome only when its full DOM contract exists.
	 * @param {Object} capabilities Live search capability response.
	 * @returns {boolean} Whether capability UI was rendered.
	 */
	renderCapabilities(capabilities) {
		if (!hasCapabilitySurface(this)) {
			return false;
		}

		renderSearchCapabilities({
			capabilities,
			panel: this.capabilityPanel,
			semanticStatus: this.semanticCapability,
			exactStatus: this.exactCapability,
			libraryStatus: this.libraryCapability,
			exactCorpusList: this.exactCorpusList
		});
		return true;
	}

	/**
	 * Marks capability presentation unavailable when that optional panel exists.
	 * @returns {boolean} Whether an available panel received the unavailable state.
	 */
	renderCapabilitiesUnavailable() {
		if (!this.capabilityPanel) {
			return false;
		}

		renderCapabilitiesUnavailable(this.capabilityPanel);
		return true;
	}

	/**
	 * Loads capabilities, populates the lane selector, and renders lane discovery.
	 * @param {string} selectedLane Lane restored from URL or session state.
	 * @returns {Promise<void>} Resolves after discovery is populated.
	 */
	async load(selectedLane = '') {
		let capabilities = null;

		try {
			capabilities = await fetchSearchCapabilities();
			this.renderCapabilities(capabilities);
		} catch {
			this.renderCapabilitiesUnavailable();
		}

		const lanes = capabilities?.lanes || await fetchLibraryLanes();
		lanes.forEach((lane) => addLane(this.series, lane));

		if (selectedLane) {
			this.series.value = selectedLane;
		}

		renderLaneDirectory({
			lanes,
			container: this.laneDirectory,
			count: this.laneCount,
			onChoose: this.onChooseLane
		});
	}
}
