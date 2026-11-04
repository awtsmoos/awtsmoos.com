// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file pendingCommentVectorsLoad.test.js
 * @description
 * Iteration 6 replaced the pending store's whole-file readFileSync load
 * (a 1.6 GB transient inside the first visitor search after a restart,
 * OOM-killing the production service) with a streaming background load.
 * These tests pin the equivalence contract: the streamed load must land
 * on exactly the record set and order the old load-then-cap produced —
 * first occurrence of each key wins, newest maxRows() records survive,
 * oldest are evicted first — and loadStore must hand back a promise
 * instead of blocking the caller while a large file parses.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
	getStore,
	loadStore
} = require('../pendingCommentVectorsStore.js');
const {
	searchPendingVectors
} = require('../pendingCommentVectorsApi.js');

function fabricatedStore(file) {
	return {
		file,
		records: new Map(),
		order: [],
		loaded: false,
		loading: null,
		persisted: Boolean(file),
		queue: [],
		queuedKeys: new Set(),
		draining: null
	};
}

function row(key, seed) {
	return {
		key,
		commentId: `c-${key}`,
		aliasId: 'tester',
		seriesId: 's',
		postId: 'p',
		verseSection: 1,
		subSection: 0,
		vector: [seed, seed + 0.5, 0],
		indexedAt: 1
	};
}

test('streaming load keeps first occurrences and evicts oldest beyond the cap', async () => {
	const previousCap = process.env.PENDING_VECTOR_MAX_ROWS;
	process.env.PENDING_VECTOR_MAX_ROWS = '3';
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pending-load-'));
	const file = path.join(dir, 'pending-comment-vectors.jsonl');
	try {
		const lines = [
			row('k1', 1),
			row('k2', 2),
			row('k1', 99), // duplicate key: the FIRST occurrence must win
			{ nope: true }, // malformed: no key/vector, skipped
			row('k3', 3),
			row('k4', 4),
			row('k5', 5)
		];
		fs.writeFileSync(file, lines.map(item => JSON.stringify(item)).join('\n') + '\n');
		const store = fabricatedStore(file);
		const promise = loadStore(store);
		assert.equal(typeof promise?.then, 'function', 'loadStore must return a promise');
		await promise;
		assert.equal(store.loaded, true);
		assert.deepEqual(store.order, ['k3', 'k4', 'k5']);
		assert.deepEqual([...store.records.keys()], ['k3', 'k4', 'k5']);
		assert.ok(store.records.get('k3').vector instanceof Float32Array);
		// A second call is a no-op that resolves immediately.
		await loadStore(store);
		assert.deepEqual(store.order, ['k3', 'k4', 'k5']);
	} finally {
		if (previousCap === undefined) delete process.env.PENDING_VECTOR_MAX_ROWS;
		else process.env.PENDING_VECTOR_MAX_ROWS = previousCap;
		fs.rmSync(dir, { recursive: true, force: true });
	}
});

test('missing store file loads as an empty store without throwing', async () => {
	const store = fabricatedStore(path.join(os.tmpdir(), 'pending-load-absent-xyz.jsonl'));
	await loadStore(store);
	assert.equal(store.loaded, true);
	assert.equal(store.records.size, 0);
});

test('pending search memoizes one computation per vector on a loaded store', async () => {
	// Isolate the store under a throwaway RAG root: the persisted file
	// starts absent (empty load) and test rows append only inside tmp.
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pending-memo-'));
	const previousRoot = process.env.AWTSMOOS_RAG_ROOT;
	process.env.AWTSMOOS_RAG_ROOT = dir;
	try {
		const store = getStore(undefined);
		assert.equal(store.file, path.join(dir, 'pending-comment-vectors.jsonl'));
		await loadStore(store);
		assert.equal(store.loaded, true);
		const { addRecord } = require('../pendingCommentVectorsStore.js');
		addRecord(store, { key: 'memo-a', commentId: 'memo-a', aliasId: 't', seriesId: 's', postId: 'p', verseSection: 1, subSection: 0, vector: Float32Array.from([1, 0, 0]), indexedAt: 1 });
		addRecord(store, { key: 'memo-b', commentId: 'memo-b', aliasId: 't', seriesId: 's', postId: 'p', verseSection: 2, subSection: 0, vector: Float32Array.from([0, 1, 0]), indexedAt: 1 });
		const first = await searchPendingVectors({ queryVector: [1, 0, 0], limit: 2 });
		const second = await searchPendingVectors({ queryVector: [1, 0, 0], limit: 2 });
		assert.deepEqual(second, first);
		assert.equal(first[0].row.commentId, 'memo-a');
		// Mutating a returned hit must not corrupt the memoized answer.
		first[0].row.commentId = 'corrupted';
		const third = await searchPendingVectors({ queryVector: [1, 0, 0], limit: 2 });
		assert.equal(third[0].row.commentId, 'memo-a');
	} finally {
		if (previousRoot === undefined) delete process.env.AWTSMOOS_RAG_ROOT;
		else process.env.AWTSMOOS_RAG_ROOT = previousRoot;
		fs.rmSync(dir, { recursive: true, force: true });
	}
});
