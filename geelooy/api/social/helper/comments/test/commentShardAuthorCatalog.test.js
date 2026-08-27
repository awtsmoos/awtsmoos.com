// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file commentShardAuthorCatalog.test.js
 * @description
 * Author discovery must reveal family aliases from filenames without opening any
 * commentary database. Exact comment endpoints decide which aliases contain rows.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { readAuthors } = require('../commentShardBridge.js');
const { familyForSeries } = require('../commentShardReader.js');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-comment-catalog-'));
const tanach = path.join(root, 'socialPacked', 'commentShards', 'tanach');
fs.mkdirSync(tanach, { recursive: true });
fs.writeFileSync(path.join(tanach, 'rashi.comments.fs.awtsdb'), '');
fs.writeFileSync(path.join(tanach, 'torah_translation_en.comments.fs.awtsdb'), '');

try {
	assert.equal(familyForSeries('amos'), 'tanach');
	assert.equal(familyForSeries('arachin'), 'talmudBavli');
	assert.equal(familyForSeries('unknown-series'), null);
	const result = readAuthors({
		$i: { db: { directory: root } },
		seriesId: 'amos',
		parentId: 'post-1',
		parentType: 'post'
	});
	assert.deepEqual(result.data.sort(), ['rashi', 'torah_translation_en']);
	assert.equal(result.majorId, 'tanach');
	assert.equal(result.discoveryMode, 'familyAliasCatalog');
	console.log('commentShardAuthorCatalog.test passed');
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
