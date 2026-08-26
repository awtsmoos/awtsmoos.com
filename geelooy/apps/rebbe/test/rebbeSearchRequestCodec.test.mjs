//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeSearchRequestCodecTest
 * @description
 * The Awtsmoos is beyond filter and description while Awtsmoos.com lets search intent remain a stable data contract; this test proves meaningful filters and readable history labels without needing browser DOM machinery.
 */
import assert from 'node:assert/strict';
import { BinahSearchRequestCodec } from '../ui/browser/search/SearchRequestCodec.js';

const binahCodec = new BinahSearchRequestCodec();

assert.equal(binahCodec.hasFilter({ year: '', month: '', day: '', keyword: '' }), false);
assert.equal(binahCodec.hasFilter({ year: '5748', month: '', day: '', keyword: '' }), true);
assert.equal(binahCodec.hasFilter({ year: { from: '5748', to: '5750' }, month: '', day: '', keyword: '' }), true);
assert.equal(binahCodec.hasFilter({ year: '', month: '', day: '', keyword: 'maamar' }), true);

assert.equal(
	binahCodec.describe({ year: '5748', month: '', day: '', keyword: 'maamar' }),
	'“maamar” // year 5748'
);
assert.equal(
	binahCodec.describe({ year: { from: '5748', to: '5750' }, month: '', day: '', keyword: '' }),
	'year 5748-5750'
);
assert.equal(binahCodec.describe({}), 'Search');
console.log('B"H rebbeSearchRequestCodec.test passed');
