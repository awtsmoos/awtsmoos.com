// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class SearchDiscoveryController
 * @description
 * The Awtsmoos reveals lanes and live capability truth before any search begins;
 * Awtsmoos.com keeps discovery loading apart from orchestration, so startup stays simple and clean.
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

export class SearchDiscoveryController {
	constructor({
		series,
		laneDirectory,
		laneCount,
		capabilityPanel,
		semanticCapability,
		exactCapability,
		libraryCapability,
		exactCorpusList,
		onChooseLane
	}) {
		Object.assign(this, {
			series, laneDirectory, laneCount, capabilityPanel, semanticCapability,
			exactCapability, libraryCapability, exactCorpusList, onChooseLane
		});
	}

	renderCapabilities(capabilities) {
		renderSearchCapabilities({
			capabilities,
			panel: this.capabilityPanel,
			semanticStatus: this.semanticCapability,
			exactStatus: this.exactCapability,
			libraryStatus: this.libraryCapability,
			exactCorpusList: this.exactCorpusList
		});
	}

	async load(selectedLane = '') {
		let capabilities = null;
		try {
			capabilities = await fetchSearchCapabilities();
			this.renderCapabilities(capabilities);
		} catch {
			renderCapabilitiesUnavailable(this.capabilityPanel);
		}
		const lanes = capabilities?.lanes || await fetchLibraryLanes();
		lanes.forEach(lane => addLane(this.series, lane));
		if (selectedLane) this.series.value = selectedLane;
		renderLaneDirectory({
			lanes,
			container: this.laneDirectory,
			count: this.laneCount,
			onChoose: this.onChooseLane
		});
	}
}
