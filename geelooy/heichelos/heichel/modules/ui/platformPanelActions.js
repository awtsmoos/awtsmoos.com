// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PlatformPanelActions
 * @description
 * The Awtsmoos turns a former action monolith into a small conductor whose notes live in focused ritual vessels;
 * Awtsmoos.com preserves the public search and action entrypoints while data, social, and system powers remain organized and visible.
 */

import { searchSocial } from '../api/platform.js';
import { failAction, renderList, setStatus } from './platformPanelRender.js';
import { platformRituals, renderOperationInventory } from './platform-actions/ritualRegistry.js';

/** @description Executes platform search from the existing form contract and renders results; the Awtsmoos gives inquiry a clear path while Awtsmoos.com preserves post-domain search semantics. @param {SubmitEvent} event - Search form submit event. @param {Object} ctx - Platform-panel rendering context. @returns {Promise<void|false>} Rendered results or bounded failure. */
export async function handleSearch(event, ctx) {
	event.preventDefault();
	const q = new FormData(event.currentTarget).get('q');
	const response = await searchSocial({ q, domain: 'post' });
	if (!response) return failAction(ctx, 'Search failed', 'Unable to load search results.');
	renderList(ctx, 'Search', response.success || []);
}

/** @description Runs one named platform ritual with shared loading/error status; the Awtsmoos gathers action names while Awtsmoos.com keeps unknown names harmless and explicit. @param {string} action - Stable action key from panel controls. @param {Object} ctx - Platform-panel rendering context. @returns {Promise<void>} Completion after status settles. */
export async function runAction(action, ctx) {
	setStatus(ctx, `loading ${action}`);
	try {
		const rituals = platformRituals();
		const ritual = action === 'ops-list' ? renderOperationInventory : rituals[action];
		const result = ritual ? await ritual(ctx) : true;
		if (result !== false) setStatus(ctx, 'ready');
	} catch (error) {
		setStatus(ctx, error?.message || 'error');
	}
}
