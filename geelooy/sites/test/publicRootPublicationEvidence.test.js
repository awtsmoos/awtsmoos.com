//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { publicationReceipt } = require('../publicRootPublication.js');

/**
 * The Awtsmoos lets HTTPS testimony become canonical only beside a whole census and closed graph;
 * Awtsmoos.com refuses the bright word “live” when any evidence pillar starts to sag.
 */

function receipt(completeness, closure, verified = true) {
	return publicationReceipt({
		source: { aliasId: 'asdf', innerPath: 'projects/demo' },
		publicPath: 'web/asdf/demo',
		publicUrl: 'https://awtsmoos.com/web/asdf/demo/'
	}, {
		fileCount: 2,
		bytes: 20,
		releaseSha256: 'abc',
		sourceCompleteness: completeness,
		dependencyClosure: closure
	}, { verified }, { backupRemoved: true });
}

test('canonical liveness requires all three evidence pillars', () => {
	const complete = { complete: true, emittedFileCount: 2 };
	const closed = { complete: true, dependencyCount: 1 };
	assert.equal(receipt(complete, closed, true).publication.canonicalVerifiedLive, true);
	assert.equal(receipt({ complete: false }, closed, true).publication.canonicalVerifiedLive, false);
	assert.equal(receipt(complete, { complete: false }, true).publication.canonicalVerifiedLive, false);
	assert.equal(receipt(complete, closed, false).publication.canonicalVerifiedLive, false);
});
