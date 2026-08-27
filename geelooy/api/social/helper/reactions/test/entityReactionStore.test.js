//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module EntityReactionStoreTest
 * @description
 * The Awtsmoos lets one alias change a tiny sign while truth remains singular beneath the display;
 * Awtsmoos.com proves ownership, replacement, removal, and public summary counts from persisted records all the way.
 */

const assert = require('assert');
const store = require('../entityReactionStore.js');
const {
	createReactionVessel,
	reactionTarget
} = require('./ReactionTestVessel.js');

async function set($i, aliasId, emoji) {
	return store.setReaction({
		$i,
		userid: 'u1',
		target: reactionTarget(),
		aliasId,
		emoji
	});
}

async function testLifecycle() {
	const $i = createReactionVessel();
	let result = await set($i, 'alpha', '👍');
	assert.equal(result.success.total, 1);
	assert.equal(result.success.counts['👍'], 1);
	assert.equal(result.success.viewerEmoji, '👍');

	result = await set($i, 'alpha', '🔥');
	assert.equal(result.success.total, 1);
	assert.equal(result.success.counts['🔥'], 1);
	assert.equal(result.success.counts['👍'], undefined);

	result = await set($i, 'beta', '❤️');
	assert.equal(result.success.total, 2);
	assert.equal(result.success.counts['🔥'], 1);
	assert.equal(result.success.counts['❤️'], 1);

	result = await store.removeReaction({
		$i,
		userid: 'u1',
		target: reactionTarget(),
		aliasId: 'alpha'
	});
	assert.equal(result.success.total, 1);
	assert.equal(result.success.viewerEmoji, '');
}

async function testOwnershipAndValidation() {
	const $i = createReactionVessel();
	const denied = await set($i, 'stranger', '🙏');
	assert.equal(denied.error.code, 'NOT_AUTHORIZED');
	const invalid = await store.setReaction({
		$i,
		userid: 'u1',
		target: {
			type: 'comment',
			id: 'c1',
			heichelId: 'study'
		},
		aliasId: 'alpha',
		emoji: '🙏'
	});
	assert.equal(invalid.error.code, 'BAD_REACTION_TARGET');
}

async function run() {
	await testLifecycle();
	await testOwnershipAndValidation();
	console.log('B"H entityReactionStore.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
