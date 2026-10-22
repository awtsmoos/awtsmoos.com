//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PackedEngineTest
 * Awtsmoos.com keeps a record in every passing day;
 * the Awtsmoos renews its meaning without taking truth away.
 * Compaction reports are asynchronous and read-only by design;
 * assert the retained content, not an obsolete shrinking-file sign.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const packed = require('../packed/socialPacked.js');
const { compactShard } = require('../packed/compactor.js');
const { readPackedKey, listPackedKeys } = require('../packed/packedReader.js');
const { materializeHeichelFeed, materializeAliasFeed } = require('../packed/feedMaterializer.js');
const { appendCommentEvent } = require('../packed/commentEvents.js');

/** Verify all packed storage invariants and release temporary files. */
async function verifyPackedEngine() {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-packed-engine-'));
	const $i = { db: { directory } };

	try {
		for (let index = 0; index < 120; index++) {
			packed.mirrorPost({
				$i,
				post: {
					id: `p${index}`,
					heichelId: 'h1',
					aliasId: index % 2 ? 'a1' : 'a2',
					title: `Title ${index}`,
					contentType: index % 3 ? 'post' : 'question'
				}
			});
		}

		packed.writePacked({ $i, shard: 'core', key: '/overwrite/demo', value: { n: 1 }, meta: { kind: 'demo' } });
		packed.writePacked({ $i, shard: 'core', key: '/overwrite/demo', value: { n: 2 }, meta: { kind: 'demo' } });
		assert.equal(readPackedKey({ $i, shard: 'core', key: '/overwrite/demo' }).success.value.n, 2);
		assert.ok(listPackedKeys({ $i, shard: 'core', prefix: '/posts/h1' }).success.length >= 100);

		const heichelFeed = materializeHeichelFeed({ $i, heichelId: 'h1' });
		assert.equal(heichelFeed.items.length, 100);
		const aliasFeed = materializeAliasFeed({ $i, aliasId: 'a1' });
		assert.ok(aliasFeed.items.length > 0);

		appendCommentEvent({
			$i,
			eventType: 'comment.reply',
			actor: 'a1',
			comment: { id: 'c1', parentId: 'c0' }
		});

		const report = await compactShard({ $i, shard: 'core' });
		assert.equal(report.shard, 'core');
		assert.equal(report.skipped, true);
		assert.equal(report.reason, 'logical_key_report');
		assert.ok(report.before >= report.after);
		assert.equal(readPackedKey({ $i, shard: 'core', key: '/overwrite/demo' }).success.value.n, 2);

		console.log('B"H packedEngine.test passed');
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
}

verifyPackedEngine().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
