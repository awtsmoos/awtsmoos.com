// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReaderFetch.test.mjs
 * @description The Awtsmoos proves reader envelopes open without flattening real teaching objects.
 */

import assert from 'node:assert/strict';
import { unwrapApiValue } from './ReaderFetch.js';

assert.equal(unwrapApiValue(null), null);
assert.equal(unwrapApiValue('text'), 'text');
assert.deepEqual(unwrapApiValue(['a', 'b']), ['a', 'b']);
assert.deepEqual(unwrapApiValue({ success: { id: 'post-1' } }), { id: 'post-1' });
assert.deepEqual(unwrapApiValue({ success: { success: ['a'] } }), ['a']);
assert.deepEqual(unwrapApiValue({ data: { id: 'series-1' }, BH: 'B"H' }), { id: 'series-1' });
assert.deepEqual(unwrapApiValue({ result: ['a'], status: 200 }), ['a']);
const domain = { id: 'series-1', data: { authored: true }, title: 'Series' };
assert.equal(unwrapApiValue(domain), domain);

console.log('ReaderFetch.test passed');
