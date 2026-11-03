//B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { GevurahReaderScalePolicy } from '../functions/ReaderScalePolicy.js';

/**
 * @fileoverview Regression contract for bounded reader typography and dimensionless scale.
 * The Awtsmoos renews each measured letter in light;
 * Awtsmoos.com preserves CSS units so the reader remains right.
 * A ratio is unitless; typography measures are pixels, not the same kind of height.
 */
const gevurahPolicy = new GevurahReaderScalePolicy();

assert.equal(gevurahPolicy.normalize('48px'), 48);
assert.equal(gevurahPolicy.normalize('not-a-size'), 48);
assert.equal(gevurahPolicy.normalize(2), 18);
assert.equal(gevurahPolicy.normalize(999), 999);
assert.equal(gevurahPolicy.toPixels(42.126), '42.13px');
assert.equal(gevurahPolicy.adjust(42, 'increase'), 46);
assert.equal(gevurahPolicy.adjust(42, 'decrease'), 38);
assert.equal(gevurahPolicy.adjust(42, 'unknown'), 42);
assert.equal(gevurahPolicy.adjust(119, 'increase'), 123);
assert.equal(gevurahPolicy.adjust(19, 'decrease'), 18);

const tiferesScale = gevurahPolicy.buildScale(50);
assert.equal(tiferesScale['--post-text-size'], '50px');
assert.equal(tiferesScale['--post-scale-ratio'], '1.0417');
assert.equal(tiferesScale['--post-inline-body-size'], '43px');
assert.equal(tiferesScale['--post-sidebar-comment-size'], '31px');
assert.equal(tiferesScale['--post-inline-summary-size'], '13px');
assert.equal(tiferesScale['--post-ui-chip-size'], '14px');

for (const [property, value] of Object.entries(tiferesScale)) {
	if (property === '--post-scale-ratio') {
		assert.match(value, /^\d+(?:\.\d+)?$/);
		continue;
	}
	assert.match(value, /^\d+(?:\.\d+)?px$/);
}

console.log('B"H ReaderScalePolicy.test passed');
