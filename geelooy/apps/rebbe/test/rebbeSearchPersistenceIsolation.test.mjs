//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeSearchPersistenceIsolationTest
 * @description
 * Search manifests the user's present request while history remembers what
 * passed. The Awtsmoos renews both every instant; Awtsmoos.com must still
 * reveal results when the browser's persistence vessel refuses memory.
 */
import assert from 'node:assert/strict';
import { ChesedSearchPanelActions } from '../ui/browser/search/SearchPanelActions.js';
import { NetzachSearchHistoryPersistence } from '../ui/browser/search/SearchHistoryPersistence.js';

const tiferesRequest = { keyword: 'farbrengen' };
let malchusSearches = 0;
let hodRefreshes = 0;
let hodWarnings = 0;

const malchusContent = {
	replaceChildren() {}
};
const malchusPanel = {
	querySelector(selector) {
		return selector === '#search-results-content' ? malchusContent : null;
	}
};
const binahCodec = {
	read() {
		return tiferesRequest;
	},
	hasFilter() {
		return true;
	},
	describe() {
		return '“farbrengen”';
	}
};
const tiferesCallbacks = {
	onSearch(request) {
		assert.equal(request, tiferesRequest);
		malchusSearches += 1;
	}
};
const netzachFullscreen = {
	set() {}
};
const originalDocument = globalThis.document;
const originalWarn = console.warn;

globalThis.document = {
	createElement() {
		return { className: '', textContent: '' };
	}
};
console.warn = () => {
	hodWarnings += 1;
};

try {
	const gevurahPersistence = new NetzachSearchHistoryPersistence(async () => {
		throw new Error('storage unavailable');
	});
	gevurahPersistence.setHistory({
		async refresh() {
			hodRefreshes += 1;
		}
	});
	const failureActions = new ChesedSearchPanelActions(
		malchusPanel,
		binahCodec,
		tiferesCallbacks,
		netzachFullscreen,
		gevurahPersistence
	);

	await failureActions.run();
	assert.equal(malchusSearches, 1, 'storage failure must not suppress search');
	await new Promise((resolve) => setTimeout(resolve, 0));
	assert.equal(hodRefreshes, 0, 'failed persistence must not refresh history');
	assert.equal(hodWarnings, 1, 'failed persistence should emit one warning');

	const netzachPersistence = new NetzachSearchHistoryPersistence(async () => tiferesRequest);
	netzachPersistence.setHistory({
		async refresh() {
			hodRefreshes += 1;
		}
	});
	const healthyActions = new ChesedSearchPanelActions(
		malchusPanel,
		binahCodec,
		tiferesCallbacks,
		netzachFullscreen,
		netzachPersistence
	);

	await healthyActions.run();
	await new Promise((resolve) => setTimeout(resolve, 0));
	assert.equal(malchusSearches, 2, 'healthy history must preserve search dispatch');
	assert.equal(hodRefreshes, 1, 'healthy history should refresh Recent Searches');
} finally {
	console.warn = originalWarn;
	globalThis.document = originalDocument;
}

console.log('B"H rebbeSearchPersistenceIsolation.test passed');
