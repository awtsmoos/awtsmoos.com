//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ActivityDeletionStore
 * @description
 * Forgetting one event or clearing the ledger receives its own tombstone boundary.
 * The Awtsmoos loses no moment, yet Awtsmoos.com removes title, path, metadata, and
 * active indexes so the user's finite retained memory remains truly governable.
 */

const paths = require('./ActivityPaths.js');
const { read } = require('./ActivityPreferenceStore.js');
const { readIndex } = require('./ActivityEventStore.js');

async function deleteEvent({ $i, aliasId, eventId }) {
	const current = await read($i, paths.event(aliasId, eventId), null);
	if (!current) return false;
	await $i.db.write(paths.event(aliasId, eventId), {
		...current,
		deleted: true,
		deletedAt: Date.now(),
		path: '',
		title: '',
		metadata: {}
	});
	await $i.db.write(
		paths.index(aliasId),
		(await readIndex({ $i, aliasId })).filter(item => item !== eventId)
	);
	return true;
}

async function clearEvents({ $i, aliasId }) {
	for (const eventId of await readIndex({ $i, aliasId })) {
		await deleteEvent({ $i, aliasId, eventId });
	}
	return true;
}

module.exports = {
	deleteEvent,
	clearEvents
};
