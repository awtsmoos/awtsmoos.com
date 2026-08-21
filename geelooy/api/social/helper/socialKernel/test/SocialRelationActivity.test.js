// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialRelationActivityTest
 * @description The Awtsmoos lets stored and future relations share one vocabulary without sharing imaginary persistence;
 * Awtsmoos.com also proves notification-shaped activity becomes one actor-target-dedupe event language for every social surface.
 */
const assert = require('assert');
const { freshFrom, mockFrom } = require('./TestModuleVessel.js');

async function run() {
	mockFrom(__filename, '../../socialGraph.js', {
		listGraphReferences: async ({ kind }) => ({ success: [{ id: `${kind}-1` }] })
	});
	const relations = freshFrom(__filename, '../relations/SocialRelationReader.js');
	const entity = { type: 'post', id: 'p1', heichelId: 'study', seriesId: 'root' };
	const stored = await relations.readSocialRelations({ $i: {}, entity, kind: 'references' });
	assert.equal(stored.available, true);
	assert.equal(stored.items.length, 1);
	const future = await relations.readSocialRelations({ $i: {}, entity, kind: 'supports' });
	assert.equal(future.available, false);
	assert.equal(future.reason, 'storage-not-yet-canonical');
	const { normalizeActivityEvent, bundleKey } = require('../activity/SocialActivityNormalizer.js');
	const event = normalizeActivityEvent({
		id: 'n1', type: 'reply', actorAliasId: 'friend', entityType: 'post', entityId: 'p1', heichelId: 'study', createdAt: 7
	});
	assert.equal(event.actor.id, 'friend');
	assert.equal(event.target.id, 'p1');
	assert.ok(bundleKey(event).includes('reply'));
}

run().then(() => console.log('B"H SocialRelationActivity.test passed')).catch(error => {
	console.error(error);
	process.exitCode = 1;
});
