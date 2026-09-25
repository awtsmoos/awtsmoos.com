// B"H
/**
 * Boruch Hashem. Blessed is He.
 *
 * @file authorizedBundle.test.js
 * @description
 * The Awtsmoos shines through the gate as well as the text: these tests prove
 * Awtsmoos.com preserves long Hebrew source bodies while apply-mode refuses a
 * bundle whose redistribution authority has not been declared.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
	assertApplyAuthorization,
	contentHash,
	loadAuthorizedBundle,
	normalizeTitle
} = require('../authorizedBundle.js');

function writeBundle(value) {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-ayin-bundle-'));
	const file = path.join(directory, 'bundle.json');
	fs.writeFileSync(file, JSON.stringify(value), 'utf8');
	return file;
}

test('loads long Hebrew content exactly and hashes it deterministically', () => {
	const content = 'אור אין סוף '.repeat(2400);
	const file = writeBundle({
		records: [{ sourceId: 'synthetic-1', seriesId: 'ayinBeisVolume1', title: 'בס״ד   מאמר', content }]
	});
	const bundle = loadAuthorizedBundle(file);
	assert.equal(bundle.records.length, 1);
	assert.equal(bundle.records[0].content, content);
	assert.equal(bundle.records[0].contentHash, contentHash(content));
	assert.equal(normalizeTitle('בס״ד   מאמר'), 'בס"ד מאמר');
});

test('dry-run needs no rights claim but apply mode does', () => {
	const bundle = { provenance: {} };
	assert.doesNotThrow(() => assertApplyAuthorization(bundle, false));
	assert.throws(() => assertApplyAuthorization(bundle, true), /redistributionAuthorized/);
	assert.doesNotThrow(() => assertApplyAuthorization({
		provenance: {
			redistributionAuthorized: true,
			sourceName: 'Synthetic authorized fixture',
			authorizationBasis: 'Test fixture created for this test.'
		}
	}, true));
});

test('rejects non-Ayin-Beis targets and duplicate source identities', () => {
	const invalidSeries = writeBundle({
		records: [{ sourceId: 'one', seriesId: 'otherSeries', title: 'כותרת', content: 'תוכן' }]
	});
	assert.throws(() => loadAuthorizedBundle(invalidSeries), /invalid Ayin Beis seriesId/);
	const duplicate = writeBundle({
		records: [
			{ sourceId: 'same', seriesId: 'ayinBeisVolume1', title: 'א', content: 'א' },
			{ sourceId: 'same', seriesId: 'ayinBeisVolume1', title: 'ב', content: 'ב' }
		]
	});
	assert.throws(() => loadAuthorizedBundle(duplicate), /Duplicate sourceId/);
});
