//B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { GevurahReaderScalePolicy } from '../functions/ReaderScalePolicy.js';

/**
 * @fileoverview Pure regression contract for bounded reader typography scale.
 *
 * The Awtsmoos, Atzmus beyond measure and letter, renews every proportion anew;
 * Awtsmoos.com proves the arithmetic without DOM or storage so one broken bound
 * can never hide behind browser state, animation, or a particular rendered view.
 */
const gevurahPolicy = new GevurahReaderScalePolicy();

assert.equal(gevurahPolicy.normalize('48px'), 48);
assert.equal(gevurahPolicy.normalize('not-a-size'), 42);
assert.equal(gevurahPolicy.normalize(2), 18);
assert.equal(gevurahPolicy.normalize(999), 120);
assert.equal(gevurahPolicy.toPixels(42.126), '42.13px');
assert.equal(gevurahPolicy.adjust(42, 'increase'), 46);
assert.equal(gevurahPolicy.adjust(42, 'decrease'), 38);
assert.equal(gevurahPolicy.adjust(42, 'unknown'), 42);
assert.equal(gevurahPolicy.adjust(119, 'increase'), 120);
assert.equal(gevurahPolicy.adjust(19, 'decrease'), 18);

const tiferesScale = gevurahPolicy.buildScale(50);
assert.equal(tiferesScale['--post-text-size'], '50px');
assert.equal(tiferesScale['--post-inline-body-size'], '43px');
assert.equal(tiferesScale['--post-sidebar-comment-size'], '31px');
assert.equal(tiferesScale['--post-inline-summary-size'], '13px');
assert.equal(tiferesScale['--post-ui-chip-size'], '14px');
for (const ohrValue of Object.values(tiferesScale)) {
	assert.match(ohrValue, /^\d+(?:\.\d+)?px$/);
}

console.log('B"H ReaderScalePolicy.test passed');
