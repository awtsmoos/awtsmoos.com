// B"H
// Boruch Hashem
// Blessed is He
/** @module VectorAdapter @description Bridges pinned nearest search and detached corpus loading. */
import { createSearchLaneReceipt } from '../search/searchLaneReceipt.mjs';
import { createVectorGeneration } from '../search/vectorGeneration.mjs';

/** Creates a dependency-injected vector-system adapter. */
export function createVectorAdapter(nativeApi) {
	return Object.freeze({
		nearest(input) {
			const search = selectSearch(nativeApi, input?.strict !== false);
			const results = search(input.manager, input.handle, input.queryVector, input.count || 5);
			return Object.freeze(results.map((result, index) => Object.freeze({
				result,
				receipt: createSearchLaneReceipt({
					lane: 'vector',
					objectId: result.id || result.key || String(index),
					rawScore: result.score ?? result.distance ?? 0,
					corpusGeneration: input.generation || null,
					reasons: ['nearest-neighbor']
				})
			})));
		},
		async loadDetached(input) {
			if (typeof nativeApi?.DetachedBulkLoader !== 'function') {
				throw new TypeError('DetachedBulkLoader is unavailable.');
			}
			const loader = new nativeApi.DetachedBulkLoader(input.manager, input.options || {});
			const report = await loader.load(input.path, input.source, input.options || {});
			return Object.freeze({
				report,
				generation: createVectorGeneration({
					corpusId: input.corpusId,
					generation: input.generation,
					rowCount: report.loaded ?? report.count ?? 0,
					graphCount: report.loaded ?? report.count ?? 0,
					dimensions: report.dimensions ?? input.dimensions,
					payloadHash: input.payloadHash,
					graphHash: input.graphHash
				})
			});
		}
	});
}

function selectSearch(nativeApi, strict) {
	const search = strict ? nativeApi?.nearestIndexed : nativeApi?.nearest;
	if (typeof search !== 'function') {
		throw new TypeError(`Vector adapter requires ${strict ? 'nearestIndexed' : 'nearest'}.`);
	}
	return search;
}
