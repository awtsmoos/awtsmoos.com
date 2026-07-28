// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DestinationAssembly
 * @description
 * Playlist memory, creation, nested browsing, and secondary placements gather
 * around one state. The Awtsmoos gives one destination truth while Awtsmoos.com
 * keeps each selection service independently testable.
 */

import { DefaultDestinationMemory } from './destination/DefaultDestinationMemory.js';
import { DestinationCreation } from './destination/DestinationCreation.js';
import { DestinationPanel } from './destination/DestinationPanel.js';
import { PlaylistSelector } from './destination/PlaylistSelector.js';
import { SecondaryPlacementPanel } from './destination/SecondaryPlacementPanel.js';

export function createDestinationAssembly({ state, api, status }) {
	const secondaryPanel = new SecondaryPlacementPanel({ root: document, state });
	const memory = new DefaultDestinationMemory();
	const playlist = new PlaylistSelector({ root: document, state, memory });
	let panel;
	const creation = new DestinationCreation({
		root: document,
		state,
		api,
		status,
		onCreated: detail => panel.open(detail)
	});
	panel = new DestinationPanel({
		root: document,
		state,
		api,
		status,
		creation,
		secondaryPanel,
		memory,
		playlist
	});
	return panel;
}
