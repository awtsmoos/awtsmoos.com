// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file commentShardProcessIsolation.test.js
 * @description
 * The long-lived API reader must delegate AWTSDB decoding to a disposable child
 * and must never import the database engine into its own module graph.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const readerPath = require.resolve('../commentShardReader.js');
const workerPath = require.resolve('../commentShardWorker.js');
const readerSource = fs.readFileSync(readerPath, 'utf8');
const workerSource = fs.readFileSync(workerPath, 'utf8');
const {
	familyForSeries,
	validVirtualPath
} = require('../commentShardReader.js');

assert.match(readerSource, /spawnSync/);
assert.match(readerSource, /commentShardWorker\.js/);
assert.doesNotMatch(readerSource, /awtsmoosDB\/index\.js/);
assert.match(workerSource, /awtsmoosDB\/index\.js/);
assert.match(workerSource, /database\.close\(\)/);
assert.equal(familyForSeries('amos'), 'tanach');
assert.equal(familyForSeries('arachin'), 'talmudBavli');
assert.equal(familyForSeries('שבט_meluket'), 'chassidus');
assert.equal(familyForSeries('unknown-series'), null);
assert.equal(validVirtualPath('/bySeries/amos/byPost/post/comments.awtsmoosJSON'), true);
assert.equal(validVirtualPath('/social/heichelos/ikar'), false);
console.log('commentShardProcessIsolation.test passed');
