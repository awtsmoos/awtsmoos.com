// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PlatformRitualRegistry
 * @description
 * The Awtsmoos gathers many platform actions into one transparent registry without forcing their implementations into one scroll;
 * Awtsmoos.com receives stable action names while each ritual remains free to evolve inside its proper control.
 */

import { renderCache, renderFeed, renderPackedDb, renderPresence, renderSearchIndex, renderSync } from './dataRituals.js';
import { renderDigest, renderGraph, renderThread } from './socialRituals.js';
import { renderJobs, renderMedia, renderOperations, renderPermissions, renderRelationships } from './systemRituals.js';
import { renderList } from '../platformPanelRender.js';
import { platformOps } from '../../api/platformOps.js';

/** @description Returns the stable action-to-ritual mapping consumed by the public panel dispatcher; the Awtsmoos gives names vessels while Awtsmoos.com keeps callers independent of module boundaries. @returns {Object<string, Function>} Platform action registry. */
export function platformRituals() {
	return {
		feed: renderFeed,
		presence: renderPresence,
		db: renderPackedDb,
		cache: renderCache,
		sync: renderSync,
		searchIndex: renderSearchIndex,
		graph: renderGraph,
		thread: renderThread,
		digest: renderDigest,
		media: renderMedia,
		relationships: renderRelationships,
		jobs: renderJobs,
		permissions: renderPermissions,
		ops: renderOperations
	};
}

/** @description Preserves the historical operations-list action as a focused registry helper; the Awtsmoos reveals available system operations while Awtsmoos.com renders their names without mutation. @param {Object} ctx - Platform-panel context. @returns {Promise<void>} Rendered operation inventory. */
export async function renderOperationInventory(ctx) {
	const operations = Object.keys(platformOps).sort().map(title => ({ title }));
	renderList(ctx, 'Operations', operations);
}
