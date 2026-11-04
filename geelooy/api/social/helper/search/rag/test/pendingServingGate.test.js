// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file pendingServingGate.test.js
 * @description
 * SEARCH ITERATION 8 (2026-11-04) pins the pending-vector serving policy:
 * the pending store was embedded from the defective pre-correction English,
 * its rows carry no text, its drain was never wired, and corrected
 * re-imports were deduped away — yet its hits outranked every real
 * publication in visitor results (15 of the top 20 for "tzedakah charity",
 * all textless). Pending vectors are staging: vectorSource must not merge
 * them into served hits unless an operator explicitly opts in with
 * AWTSMOOS_SERVE_PENDING_VECTORS=true. When serving IS enabled, the merge
 * applies the per-post diversity cap (iteration 7's rule) so one post's
 * many comment vectors cannot fill a whole result window.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const Module = require('node:module');

const { mergePendingHits } = require('../pendingCommentVectorsMerge.js');

function hit(score, postId, pending = false) {
	return {
		score,
		row: pending
			? { postId, seriesId: 's1', pendingVector: true, vectorSource: 'pending-comment-vectors' }
			: { postId, seriesId: 's1' }
	};
}

test('mergePendingHits caps one post at two hits in the first pass', () => {
	const base = [hit(0.5, 'other')];
	const pending = [
		hit(0.95, 'p1', true), hit(0.94, 'p1', true), hit(0.93, 'p1', true),
		hit(0.92, 'p1', true), hit(0.91, 'p1', true), hit(0.6, 'p2', true)
	];
	const merged = mergePendingHits(base, pending, 5);
	// First-pass diversity: p1 contributes its top two, then p2 and the
	// publication hit outrank p1's third vector; overflow only fills.
	assert.deepEqual(
		merged.map(item => `${item.row.postId}:${item.score}`),
		['p1:0.95', 'p1:0.94', 'p2:0.6', 'other:0.5', 'p1:0.93']
	);
	assert.deepEqual(merged.map(item => item.rank), [1, 2, 3, 4, 5]);
});

test('mergePendingHits without same-post pileup keeps pure score order', () => {
	const merged = mergePendingHits(
		[hit(0.4, 'a'), hit(0.3, 'b')],
		[hit(0.9, 'c', true), hit(0.8, 'd', true)],
		10
	);
	assert.deepEqual(merged.map(item => item.score), [0.9, 0.8, 0.4, 0.3]);
});

/** Loads strategyVector.js with its heavy neighbours stubbed out. The
 * loader patch must stay installed while vectorSource runs, because the
 * module lazy-requires its embedder/search neighbours per call. */
function loadVectorSource(pendingStub) {
	const originalLoad = Module._load;
	const baseHits = [hit(0.4, 'pub1'), hit(0.3, 'pub2')];
	Module._load = function load(request, parent, isMain) {
		if (parent && parent.filename.endsWith('strategyVector.js')) {
			if (request === './queryLanguagePolicy.js') return { queryLanguage: () => 'en' };
			if (request === './semanticCorpusPolicy.js') return { assertEnglishSemanticCorpus: () => {} };
			if (request === './indexedSourceCache.js') {
				return {
					searchCachedSource: async () => ({
						hits: baseHits,
						sourceCacheHit: false,
						index: { persisted: true }
					})
				};
			}
			if (request === './timer.js') return { timed: async (_name, _timings, fn) => fn() };
			if (request === './strategyText.js') {
				return { codedError: (code, message) => Object.assign(new Error(message), { code }) };
			}
			if (request === './queryEmbedder.js') {
				return { embedForShard: async () => ({ vector: [1, 0, 0], embedder: 'stub' }) };
			}
			if (request === './sourceSearch.js') return { searchShard: async () => ({ hits: [] }) };
			if (request === './pendingCommentVectors.js') return pendingStub;
		}
		return originalLoad.call(this, request, parent, isMain);
	};
	delete require.cache[require.resolve('../strategyVector.js')];
	const loaded = require('../strategyVector.js');
	return {
		...loaded,
		restore() { Module._load = originalLoad; }
	};
}

test('vectorSource does not consult the pending store by default', async () => {
	const previous = process.env.AWTSMOOS_SERVE_PENDING_VECTORS;
	delete process.env.AWTSMOOS_SERVE_PENDING_VECTORS;
	let pendingCalls = 0;
	const loaded = loadVectorSource({
		searchPendingVectors: async () => {
			pendingCalls += 1;
			return [hit(0.99, 'p1', true)];
		},
		mergePendingHits: (base, pending) => [...base, ...pending]
	});
	try {
		const result = await loaded.vectorSource({
			$i: undefined,
			shard: { id: 'stub-lane' },
			query: 'tzedakah charity',
			limit: 5,
			timings: {}
		});
		assert.equal(pendingCalls, 0, 'pending search must not run while serving is off');
		assert.deepEqual(result.hits.map(item => item.row.postId), ['pub1', 'pub2']);
		assert.equal(result.hits.some(item => item.row.pendingVector), false);
	} finally {
		loaded.restore();
		if (previous === undefined) delete process.env.AWTSMOOS_SERVE_PENDING_VECTORS;
		else process.env.AWTSMOOS_SERVE_PENDING_VECTORS = previous;
	}
});

test('vectorSource merges pending hits only on explicit operator opt-in', async () => {
	const previous = process.env.AWTSMOOS_SERVE_PENDING_VECTORS;
	process.env.AWTSMOOS_SERVE_PENDING_VECTORS = 'true';
	let pendingCalls = 0;
	const loaded = loadVectorSource({
		searchPendingVectors: async () => {
			pendingCalls += 1;
			return [hit(0.99, 'p1', true)];
		},
		mergePendingHits: (base, pending, limit) => [...base, ...pending].slice(0, limit)
	});
	try {
		const result = await loaded.vectorSource({
			$i: undefined,
			shard: { id: 'stub-lane' },
			query: 'tzedakah charity',
			limit: 5,
			timings: {}
		});
		assert.equal(pendingCalls, 1);
		assert.equal(result.hits.some(item => item.row.pendingVector), true);
	} finally {
		loaded.restore();
		if (previous === undefined) delete process.env.AWTSMOOS_SERVE_PENDING_VECTORS;
		else process.env.AWTSMOOS_SERVE_PENDING_VECTORS = previous;
	}
});
