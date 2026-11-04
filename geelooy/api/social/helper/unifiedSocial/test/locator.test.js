//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file locator.test.js
 * @description
 * A publication source may arrive without its canonical Heichel (a bare
 * reference link, a restored draft). The planner must resolve it when the
 * record provably lives under the plan's primary Heichel, and must keep
 * refusing — with the typed SOURCE_HEICHEL_REQUIRED error — when it does
 * not. Resolution is verified by existence, never assumed.
 */

const assert = require('assert');
const { testInput } = require('./InMemoryDb.js');
const { planPublication } = require('../publishing/PublicationPlanner.js');
const { locateCanonical } = require('../publishing/CanonicalLocator.js');
const { contentRecordPath } = require('../../socialContentPaths.js');

async function seed($i) {
	await $i.db.write(contentRecordPath({ heichelId: 'origin', postId: 'post-1' }), {
		postId: 'post-1',
		entityType: 'post',
		heichelId: 'origin',
		seriesId: 'root',
		aliasId: 'writer'
	});
}

async function run() {
	const $i = testInput();
	await seed($i);

	// Direct locator: scopeless source + primary-scope fallback hits the record.
	const located = await locateCanonical({
		$i,
		source: { type: 'post', id: 'post-1' },
		fallbackHeichelId: 'origin'
	});
	assert.equal(located.found, true);
	assert.equal(located.canonical.heichelId, 'origin');
	assert.equal(located.canonical.id, 'post-1');

	// Direct locator: the record does NOT live under the fallback scope.
	const missed = await locateCanonical({
		$i,
		source: { type: 'post', id: 'post-1' },
		fallbackHeichelId: 'archive'
	});
	assert.equal(missed.found, false);
	assert.equal(missed.error.code, 'SOURCE_HEICHEL_REQUIRED');

	// Direct locator: no fallback at all keeps the original refusal.
	const unscoped = await locateCanonical({ $i, source: { type: 'post', id: 'post-1' } });
	assert.equal(unscoped.error.code, 'SOURCE_HEICHEL_REQUIRED');

	// Planner end-to-end: a scopeless source that lives at the primary
	// destination now plans as a canonical reuse instead of deadlocking.
	const planned = await planPublication({
		$i,
		input: {
			idempotencyKey: 'publish-scopeless',
			aliasId: 'writer',
			contentKind: 'post',
			primary: { heichelId: 'origin', seriesId: 'root' },
			source: { type: 'post', id: 'post-1' }
		}
	});
	assert.equal(planned.error, undefined, 'scopeless-but-resolvable source must not error');
	assert.equal(planned.success.located.found, true);
	assert.equal(planned.success.canonical.heichelId, 'origin');
	assert.equal(planned.success.primary.type, 'reuseCanonical');

	// Planner end-to-end: a scopeless source that lives nowhere near the
	// primary destination still refuses with the typed error (not a plan
	// validation error, not a silent publish).
	const refused = await planPublication({
		$i,
		input: {
			idempotencyKey: 'publish-scopeless-miss',
			aliasId: 'writer',
			contentKind: 'post',
			primary: { heichelId: 'archive', seriesId: 'root' },
			source: { type: 'post', id: 'post-1' }
		}
	});
	assert.equal(refused.error.code, 'SOURCE_HEICHEL_REQUIRED');

	console.log('unifiedSocial locator.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
