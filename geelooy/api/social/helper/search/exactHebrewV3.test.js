// B"H

/**
 * @file exactHebrewV3.test.js
 * @description
 * Proves section-bounded v3 lookup, cache reuse, exact hit shaping, and the
 * worker-only decompression boundary without opening production storage.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const {
	FORMAT,
	bucket,
	loadShard,
	searchShard
} = require('./exactHebrewV3.js');
const {
	buildResponse
} = require('./exactHebrewResponse.js');

function refForBucket(bucketName) {
	for (let index = 0; index < 100_000; index += 1) {
		const candidate = `ref-${index}`;
		if (bucket(candidate) === bucketName) return candidate;
	}
	throw new Error(`No reference found for ${bucketName}.`);
}

function fixture() {
	const wordBucketName = bucket('אמר');
	const referenceId = refForBucket(wordBucketName);
	const occurrence = [referenceId, 4, 12, 'אָמַר'];
	const shard = {
		kind: 'talmudBavli',
		counts: { tractates: 36, words: 1_849_460 },
		words: {
			[wordBucketName]: {
				אמר: { c: 1, o: [occurrence] }
			}
		},
		refs: {
			[wordBucketName]: {
				[referenceId]: {
					tractateId: 'berakhot',
					postId: 'berakhot-2a',
					daf: 2,
					amud: 'a',
					text: 'אָמַר רַב'
				}
			}
		}
	};
	const blob = zlib.gzipSync(Buffer.from(JSON.stringify(shard)));
	return {
		database: {
			DosDB: {
				get(recordPath) {
					if (recordPath === 'meta') {
						return { format: FORMAT, counts: shard.counts };
					}
					if (recordPath === 'indexBlob') return blob;
					return null;
				}
			}
		},
		referenceId
	};
}

test('finds colliding bucket names in their correct sections', () => {
	const value = fixture();
	const loaded = loadShard(value.database, 'talmudBavli');
	const request = { word: 'אָמַר', limit: 1, offset: 0 };
	const first = searchShard(loaded, 'talmudBavli', request);
	const second = searchShard(loaded, 'talmudBavli', request);
	const response = buildResponse(
		{ ...request, corpus: 'talmudBavli' },
		[first]
	);

	assert.equal(first.totalHits, 1);
	assert.equal(first.hits[0].ref.postId, 'berakhot-2a');
	assert.equal(first.hits[0].ref.wordIndex, 12);
	assert.equal(first.hits[0].occurrence[0], value.referenceId);
	assert.equal(second.hits[0].ref.postId, 'berakhot-2a');
	assert.equal(loaded.wordBuckets.size, 1);
	assert.equal(loaded.refBuckets.size, 1);
	assert.equal(response.storageMode, 'worker-cached-gzip-bucketed-v3');
});

test('keeps gzip and indexBlob logic outside HTTP-facing modules', () => {
	const folder = __dirname;
	const facade = fs.readFileSync(path.join(folder, 'exactHebrewIndex.js'), 'utf8');
	const route = fs.readFileSync(path.join(folder, 'routes', 'exact.js'), 'utf8');
	const workerSide = fs.readFileSync(path.join(folder, 'exactHebrewV3.js'), 'utf8');

	assert.equal(facade.includes('gunzipSync'), false);
	assert.equal(route.includes('indexBlob'), false);
	assert.equal(workerSide.includes('gunzipSync'), true);
	assert.equal(workerSide.includes('indexBlob'), true);
});
