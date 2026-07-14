//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file capturePreferences.test.js
 * @description
 * Query, title, and duration choices must alter stored events rather than merely
 * decorate settings. The Awtsmoos knows every detail without capture while
 * Awtsmoos.com records only the finite fields the alias deliberately retained.
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
	await store.savePreferences({
		$i,
		aliasId,
		input: {
			enabled: true,
			captureQuery: false,
			captureTitle: false,
			captureDuration: false
		}
	});
	const result = await service.record({
		$i,
		aliasId,
		input: {
			category: 'navigation',
			action: 'visit',
			title: 'Secret title',
			path: '/social-hub/?profile=teacher&token=hidden#activity',
			durationMs: 9200
		}
	});
	assert.equal(result.success.recorded, true);
	assert.equal(result.success.event.path, '/social-hub/');
	assert.equal(result.success.event.title, 'visit');
	assert.equal(result.success.event.durationMs, 0);
	await store.savePreferences({
		$i,
		aliasId,
		input: {
			enabled: true,
			captureQuery: true,
			captureTitle: true,
			captureDuration: true
		}
	});
	const second = await service.record({
		$i,
		aliasId,
		input: {
			category: 'profile',
			action: 'view',
			title: 'Teacher profile',
			path: '/social-hub/?profile=teacher&secret=hidden',
			durationMs: 5400
		}
	});
	assert.equal(second.success.event.path, '/social-hub/?profile=teacher');
	assert.equal(second.success.event.title, 'Teacher profile');
	assert.equal(second.success.event.durationMs, 5400);
	console.log('unifiedActivity capturePreferences.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
