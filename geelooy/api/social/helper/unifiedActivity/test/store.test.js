//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file store.test.js
 * @description
 * Private event creation, navigation dedupe, sharing update, deletion, pause, and
 * clearing are proven in memory. The Awtsmoos remembers without index while
 * Awtsmoos.com makes every finite record inspectable and reversible.
 */

const assert = require('assert');
const {
	testInput
} = require('../../unifiedSocial/test/InMemoryDb.js');
const store = require('../ActivityStore.js');
const service = require('../ActivityService.js');

async function run() {
	const $i = testInput();
	const aliasId = 'traveler';
	const first = await service.record({
		$i,
		aliasId,
		input: {
			category: 'navigation',
			action: 'view',
			title: 'Social Hub',
			path: '/social-hub/?token=secret'
		}
	});
	assert.equal(first.success.recorded, true);
	assert.equal(first.success.event.visibility.mode, 'private');
	assert.equal(first.success.event.path, '/social-hub/');
	const duplicate = await service.record({
		$i,
		aliasId,
		input: {
			category: 'navigation',
			action: 'view',
			title: 'Social Hub Again',
			path: '/social-hub/',
			durationMs: 2400
		}
	});
	assert.equal(duplicate.success.deduplicated, true);
	assert.equal((await store.listEvents({ $i, aliasId })).length, 1);
	const eventId = duplicate.success.event.id;
	const updated = await service.update({
		$i,
		aliasId,
		eventId,
		input: {
			visibility: {
				mode: 'selected',
				aliases: ['reader']
			}
		}
	});
	assert.equal(updated.success.visibility.mode, 'selected');
	assert.deepEqual(updated.success.visibility.aliases, ['reader']);
	const paused = await store.savePreferences({
		$i,
		aliasId,
		input: { enabled: false }
	});
	assert.equal(paused.enabled, false);
	const skipped = await service.record({
		$i,
		aliasId,
		input: { category: 'comment', title: 'Skipped' }
	});
	assert.equal(skipped.success.recorded, false);
	assert.equal(skipped.success.reason, 'ledger-paused');
	assert.equal((await service.remove({ $i, aliasId, eventId })).success.deleted, true);
	assert.equal((await store.listEvents({ $i, aliasId })).length, 0);
	await store.savePreferences({ $i, aliasId, input: { enabled: true } });
	await service.record({
		$i,
		aliasId,
		input: { category: 'comment', title: 'Commented', path: '/post/one' }
	});
	assert.equal(await store.clearEvents({ $i, aliasId }), true);
	assert.equal((await store.listEvents({ $i, aliasId })).length, 0);
	console.log('unifiedActivity store.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
