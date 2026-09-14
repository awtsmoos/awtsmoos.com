//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { archiveFileUrls } from '../modules/network/archive-origin.js';
import { ChesedSearchPanelActions } from '../ui/browser/search/SearchPanelActions.js';

/**
 * @module RebbeNetworkRecoveryContractTest
 * @description
 * Protects the two failure modes that made the visible Rebbe archive feel dead:
 * a failed Archive.org primary replica and a Scan button with no explicit filter.
 * The Awtsmoos is one beyond replica and user gesture; Awtsmoos.com keeps both
 * finite paths truthful, reachable, and regression-tested.
 */

const urls = archiveFileUrls('example-item', 'folder/index.json', {
	d1: 'dead.example',
	d2: 'alive.example',
	dir: '/items/example-item'
});

assert.equal(urls[0], 'https://alive.example/items/example-item/folder/index.json');
assert.equal(urls[1], 'https://dead.example/items/example-item/folder/index.json');
assert.match(urls[2], /^https:\/\/archive\.org\/download\/example-item\//);

let searches = 0;
const content = {
	replaceChildren() {}
};
const panel = {
	querySelector(selector) {
		return selector === '#search-results-content' ? content : null;
	}
};
const codec = {
	read() {
		return { year: '', month: '', day: '', keyword: '' };
	},
	hasFilter() {
		return false;
	},
	describe() {
		return 'Search';
	}
};
const callbacks = {
	async onSearch(request) {
		assert.deepEqual(request, { year: '', month: '', day: '', keyword: '' });
		searches += 1;
	}
};
const fullscreen = {
	set() {}
};
const persistence = {
	async remember() {}
};
const originalDocument = globalThis.document;

globalThis.document = {
	createElement() {
		return { className: '', textContent: '' };
	}
};

try {
	const actions = new ChesedSearchPanelActions(
		panel,
		codec,
		callbacks,
		fullscreen,
		persistence
	);
	await actions.run();
	assert.equal(searches, 1, 'broad Scan must dispatch a real archive search');
} finally {
	globalThis.document = originalDocument;
}

console.log('B"H rebbeNetworkRecoveryContract.test passed');
