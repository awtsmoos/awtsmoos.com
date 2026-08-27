// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file commentDerivedPriority.test.js
 * @description
 * Classified Torah commentary must answer from its isolated shard without even
 * evaluating canonical or DosDB readers that would open the global comments DB.
 */

const assert = require('node:assert/strict');
const {
	choose,
	shardIsAuthoritative
} = require('../commentReadCore.js');

function forbidden(label) {
	return () => {
		throw new Error(`${label} must not be evaluated.`);
	};
}

(async () => {
	assert.equal(shardIsAuthoritative({ seriesId: 'amos' }), true);
	assert.equal(shardIsAuthoritative({ seriesId: 'arachin' }), true);
	assert.equal(shardIsAuthoritative({ seriesId: 'custom-series' }), false);
	const derived = await choose({ seriesId: 'amos' }, {
		canonical: forbidden('canonical'),
		database: forbidden('database'),
		shard: () => ({
			data: [{ id: 'rashi-1' }],
			file: '/tmp/rashi.comments.fs.awtsdb',
			majorId: 'tanach',
			virtualPath: '/bySeries/amos/byPost/post/comments.awtsmoosJSON'
		})
	});
	assert.equal(derived.source, 'commentShard');
	assert.equal(derived.count, 1);
	const empty = await choose({ seriesId: 'amos' }, {
		canonical: forbidden('canonical'),
		database: forbidden('database'),
		shard: () => null
	});
	assert.equal(empty.count, 0);
	let canonicalCalls = 0;
	const native = await choose({ seriesId: 'custom-series' }, {
		canonical: () => {
			canonicalCalls += 1;
			return [{ id: 'native-1' }];
		},
		database: forbidden('database'),
		shard: forbidden('shard')
	});
	assert.equal(canonicalCalls, 1);
	assert.equal(native.count, 1);
	console.log('commentDerivedPriority.test passed');
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
