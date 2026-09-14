//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file searchGroupingModel.test.mjs
 * @description
 * Proves category presentation reorders only inside authoritative backend
 * groups and keeps the selected view shareable without another search request.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	groupedHits,
	rememberPresentationMode,
	selectedPresentationMode,
	supportedPresentationModes
} from '../searchGroupingModel.js';

/** Builds one response whose global and category relevance orders differ. */
function response() {
	return {
		presentation: {
			modes: ['relevance', 'category'],
			defaultMode: 'relevance',
			categories: [
				{ id: 'tanach', title: 'Tanach', order: 20, count: 1 },
				{ id: 'sichos', title: 'Sichos', order: 50, count: 2 }
			]
		}
	};
}

/** Proves backend category order and category-local relevance ranks win. */
test('grouped hits use backend category order and local ranks', () => {
	const hits = [
		{ id: 's-low', category: { id: 'sichos', rank: 2 } },
		{ id: 'tanach', category: { id: 'tanach', rank: 1 } },
		{ id: 's-high', category: { id: 'sichos', rank: 1 } }
	];
	const groups = groupedHits(response(), hits);
	assert.deepEqual(groups.map(group => group.category.id), ['tanach', 'sichos']);
	assert.deepEqual(groups[1].hits.map(hit => hit.id), ['s-high', 's-low']);
	assert.deepEqual(hits.map(hit => hit.id), ['s-low', 'tanach', 's-high']);
});

/** Proves older responses fall back to relevance and never invent capability. */
test('legacy response remains relevance-only', () => {
	globalThis.location = new URL('https://awtsmoos.com/sefarim/?view=category');
	assert.deepEqual(supportedPresentationModes({}), ['relevance']);
	assert.equal(selectedPresentationMode({}), 'relevance');
});

/** Proves selected category mode survives URL sharing without pushing history. */
test('category mode persists through replaceState', () => {
	let current = new URL('https://awtsmoos.com/sefarim/?q=אור');
	globalThis.location = current;
	globalThis.history = {
		state: { preserved: true },
		replaceState(state, _title, url) {
			assert.deepEqual(state, { preserved: true });
			current = new URL(String(url));
			globalThis.location = current;
		}
	};
	rememberPresentationMode('category');
	assert.equal(current.searchParams.get('view'), 'category');
	assert.equal(selectedPresentationMode(response()), 'category');
	rememberPresentationMode('relevance');
	assert.equal(current.searchParams.has('view'), false);
});
