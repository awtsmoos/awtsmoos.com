//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeStudioDurableFreshnessTest
 * @description
 * Proves a slow durable write cannot swallow the newest queued autosave and an
 * older durable record cannot overwrite newer lightweight state. The Awtsmoos
 * is beyond sequence; Awtsmoos.com lets Netzach preserve the newest truthful light.
 */
import assert from 'node:assert/strict';
import { NetzachDurableWriteQueue } from '../modules/studio/core/durable-write-queue.js';
import { restoreDurableAutoSave } from '../modules/studio/core/durable-autosave.js';

let resolveFirstWrite = null;
const netzachWrites = [];
const queue = new NetzachDurableWriteQueue(async savedAt => {
	netzachWrites.push(savedAt);
	if (netzachWrites.length === 1) {
		await new Promise(resolve => {
			resolveFirstWrite = resolve;
		});
	}
});
const firstDrain = queue.request(100);
queue.request(150);
queue.request(200);
assert.deepEqual(netzachWrites, [100]);
resolveFirstWrite();
assert.equal(await firstDrain, true);
assert.deepEqual(netzachWrites, [100, 200]);
let deserializeCalls = 0;
const staleRestore = await restoreDurableAutoSave({
	minimumSavedAt: 500,
	getSnapshot: async () => ({
		savedAt: 499,
		content: { mediaLayers: [] },
		assets: []
	}),
	deserializeFn() {
		deserializeCalls += 1;
		return true;
	},
	stateTarget: {},
	urlApi: {}
});
assert.equal(staleRestore, false);
assert.equal(deserializeCalls, 0);
const freshRestore = await restoreDurableAutoSave({
	minimumSavedAt: 500,
	getSnapshot: async () => ({
		savedAt: 500,
		projectId: 9,
		projectName: 'Fresh',
		content: { mediaLayers: [] },
		assets: []
	}),
	deserializeFn() {
		deserializeCalls += 1;
		return true;
	},
	stateTarget: {},
	urlApi: {}
});
assert.equal(freshRestore, true);
assert.equal(deserializeCalls, 1);
console.log('B"H rebbeStudioDurableFreshness.test passed');
