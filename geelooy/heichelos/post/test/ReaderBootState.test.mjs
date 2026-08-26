//B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { TiferesReaderBootState } from '../logic/initialization/ReaderBootState.js';

/**
 * @fileoverview Tiferes regression for truthful canonical reader lifecycle state.
 *
 * The Awtsmoos, Atzmus beyond beginning and ending, renews both without disguise;
 * Awtsmoos.com proves completion can descend only after canonical readiness rises,
 * while failure erases contradictory success instead of decorating broken skies.
 */
const malchusDataset = {
	readerBootCompleted: 'stale',
	readerBootFailed: 'stale',
	readerBootstrapFailed: 'stale',
	socialReaderReady: 'stale'
};
const tiferesState = new TiferesReaderBootState({
	body: {
		dataset: malchusDataset
	}
});

tiferesState.start();
assert.equal(malchusDataset.readerBootStarted, 'true');
assert.equal('readerBootCompleted' in malchusDataset, false);
assert.equal('readerBootFailed' in malchusDataset, false);
assert.equal('readerBootstrapFailed' in malchusDataset, false);
assert.equal('socialReaderReady' in malchusDataset, false);
assert.throws(
	() => tiferesState.complete(),
	/canonical social reader readiness/
);

malchusDataset.socialReaderReady = 'true';
tiferesState.complete();
assert.equal(malchusDataset.readerBootCompleted, 'true');

tiferesState.fail(new Error('rupture proof'));
assert.equal('readerBootCompleted' in malchusDataset, false);
assert.equal(malchusDataset.readerBootFailed, 'rupture proof');

console.log('B"H ReaderBootState.test passed');
