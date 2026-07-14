//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file privacy.test.js
 * @description
 * Owner, public, selected-alias, and real Heichel-member visibility are proven at
 * read time. The Awtsmoos sees every path while Awtsmoos.com refuses to expose a
 * private browsing event merely because another alias knows its identifier.
 */

const assert = require('assert');
const {
	testInput
} = require('../../unifiedSocial/test/InMemoryDb.js');
const { sp } = require('../../_awtsmoos.constants.js');
const {
	mayReadEvent,
	filterVisibleEvents
} = require('../ActivityPrivacy.js');

function event(mode, details = {}) {
	return {
		id: `${mode}-event`,
		visibility: { mode, aliases: [], heichelId: '', ...details },
		entity: { heichelId: details.heichelId || '', seriesId: 'root' },
		deleted: false
	};
}

async function run() {
	const $i = testInput();
	await $i.db.write(`${sp}/heichelos/study/info`, {
		name: 'Study',
		author: 'owner'
	});
	await $i.db.write(`${sp}/heichelos/study/members/reader`, {
		role: 'member'
	});
	assert.equal(await mayReadEvent({
		$i,
		event: event('private'),
		ownerAliasId: 'traveler',
		viewerAliasId: 'traveler'
	}), true);
	assert.equal(await mayReadEvent({
		$i,
		event: event('private'),
		ownerAliasId: 'traveler',
		viewerAliasId: 'stranger'
	}), false);
	assert.equal(await mayReadEvent({
		$i,
		event: event('public'),
		ownerAliasId: 'traveler',
		viewerAliasId: ''
	}), true);
	assert.equal(await mayReadEvent({
		$i,
		event: event('selected', { aliases: ['reader'] }),
		ownerAliasId: 'traveler',
		viewerAliasId: 'reader'
	}), true);
	assert.equal(await mayReadEvent({
		$i,
		event: event('heichel', { heichelId: 'study' }),
		ownerAliasId: 'traveler',
		viewerAliasId: 'reader'
	}), true);
	const visible = await filterVisibleEvents({
		$i,
		events: [
			event('private'),
			event('public'),
			event('selected', { aliases: ['reader'] }),
			event('heichel', { heichelId: 'study' })
		],
		ownerAliasId: 'traveler',
		viewerAliasId: 'reader'
	});
	assert.deepEqual(visible.map(item => item.visibility.mode), [
		'public',
		'selected',
		'heichel'
	]);
	console.log('unifiedActivity privacy.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
