// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReaderCoordinateResolver.test.mjs
 * @description
 * The Awtsmoos proves route words keep their meaning: explicit posts are identities,
 * numeric series coordinates are indices, and absent indices never become counterfeit post IDs.
 */

import assert from 'node:assert/strict';
import {
	entryPostId,
	isNumericSeriesCoordinate,
	normalizePostEntries,
	resolveReaderCoordinate
} from './ReaderCoordinateResolver.mjs';

assert.equal(entryPostId('alpha'), 'alpha');
assert.equal(entryPostId({ id: 'beta' }), 'beta');
assert.equal(entryPostId({ postId: 'gamma' }), 'gamma');
assert.equal(isNumericSeriesCoordinate('9999'), true);
assert.equal(isNumericSeriesCoordinate('-1'), false);
assert.deepEqual(normalizePostEntries({ success: [{ id: 'one' }, 'two'] }).map(entryPostId), ['one', 'two']);

assert.deepEqual(
	resolveReaderCoordinate({ pCoord: '9999', explicitPostMarker: true }),
	{ pId: '9999', pIdx: 0 }
);
assert.deepEqual(
	resolveReaderCoordinate({ pCoord: '1', seriesPosts: ['first', 'second'] }),
	{ pId: 'second', pIdx: 1 }
);
assert.deepEqual(
	resolveReaderCoordinate({ pCoord: '2', seriesPosts: [], canonicalPosts: { success: ['a', 'b', 'c'] } }),
	{ pId: 'c', pIdx: 2 }
);
assert.deepEqual(
	resolveReaderCoordinate({ pCoord: '1', canonicalPosts: [{ id: 'a' }, { postId: 'b' }] }),
	{ pId: 'b', pIdx: 1 }
);
assert.deepEqual(
	resolveReaderCoordinate({ pCoord: '9999', canonicalPosts: ['only'] }),
	{ pId: null, pIdx: 9999 }
);
assert.deepEqual(
	resolveReaderCoordinate({ pCoord: 'legacy-post-id', canonicalPosts: ['a', 'legacy-post-id'] }),
	{ pId: 'legacy-post-id', pIdx: 1 }
);

console.log('ReaderCoordinateResolver.test passed');
