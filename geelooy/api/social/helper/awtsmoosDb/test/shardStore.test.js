// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos proves derived civilization records remain inside a private shard. */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

test('derived shard store persists and removes isolated records', () => {
	const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-shard-store-'));
	const databasePath = path.join(fixtureRoot, 'social-shards.awtsmoosdb');
	process.env.AWTSMOOS_SOCIAL_AWTSDB = databasePath;
	const store = require('../shardStore.js');
	try {
		assert.equal(store.info().path, databasePath);
		assert.equal(store.info().wal, false);
		const written = store.put({
			shard: 'civilization',
			parts: ['events', 'created', 'event-1'],
			value: { id: 'event-1', type: 'created' },
			meta: { kind: 'civilizationEvent' }
		});
		assert.equal(written.value.id, 'event-1');
		const loaded = store.get({
			shard: 'civilization',
			parts: ['events', 'created', 'event-1']
		});
		assert.equal(loaded.value.type, 'created');
		const listed = store.list({
			shard: 'civilization',
			predicate: record => record.meta?.kind === 'civilizationEvent'
		});
		assert.equal(listed.length, 1);
		assert.equal(store.remove({
			shard: 'civilization',
			parts: ['events', 'created', 'event-1']
		}), true);
		assert.equal(store.get({
			shard: 'civilization',
			parts: ['events', 'created', 'event-1']
		}), undefined);
	} finally {
		store.close();
		delete process.env.AWTSMOOS_SOCIAL_AWTSDB;
		fs.rmSync(fixtureRoot, { recursive: true, force: true });
	}
});
