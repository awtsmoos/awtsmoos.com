//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeSearchProgressContractTest
 * @description
 * Proves that simultaneous identical scans share one shard request while each
 * caller receives truthful completion progress. The Awtsmoos is one beyond
 * multiplicity; Awtsmoos.com must not amplify impatient taps into duplicate IO.
 */

import assert from 'node:assert/strict';

const originalFetch = globalThis.fetch;
const originalDocument = globalThis.document;
const originalCustomEvent = globalThis.CustomEvent;
const eventTarget = new EventTarget();
const progress = [];
let fetchCount = 0;

class TestCustomEvent extends Event {
	constructor(type, init = {}) {
		super(type);
		this.detail = init.detail;
	}
}

globalThis.CustomEvent = TestCustomEvent;
globalThis.document = eventTarget;
eventTarget.addEventListener('rebbe-search-progress', event => progress.push(event.detail));
globalThis.fetch = async () => {
	fetchCount += 1;
	await new Promise(resolve => setTimeout(resolve, 20));
	return {
		ok: true,
		status: 200,
		statusText: 'OK',
		json: async () => ({
			events: [{ year: 5737, month_id: 1, day: 6, folder: 'BH_001', bucket: 'x', title: 'Farbrengen' }]
		})
	};
};

try {
	const { searchArchive } = await import('../modules/network/search-live.js');
	const request = { month: 1 };
	const [left, right] = await Promise.all([
		searchArchive(request),
		searchArchive(request)
	]);

	assert.equal(fetchCount, 1, 'identical concurrent shard loads must be coalesced');
	assert.equal(left.length, 1);
	assert.deepEqual(left, right);
	assert.equal(progress.length, 2, 'each active search should publish its own completion');
	assert.ok(progress.every(item => item.done === 1 && item.total === 1));
	assert.ok(progress.every(item => item.filename === '1.json'));
	assert.ok(progress.every(item => item.found === 1), 'live progress must expose matching count');
	assert.ok(progress.every(item => item.added?.length === 1), 'live progress must carry matching events');
} finally {
	globalThis.fetch = originalFetch;
	globalThis.document = originalDocument;
	globalThis.CustomEvent = originalCustomEvent;
}

console.log('B"H rebbeSearchProgressContract.test passed');
