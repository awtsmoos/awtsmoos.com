//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module ActivityServiceMutations
 * @description
 * Activity event update and removal.
 */

const store = require('./ActivityStore.js');

async function update({ $i, aliasId, eventId, input }) {
	const event = await store.updateEvent({ $i, aliasId, eventId, input });
	return event
		? { success: event }
		: { error: { code: 'ACTIVITY_NOT_FOUND', message: 'Activity event was not found.' } };
}

async function remove({ $i, aliasId, eventId }) {
	return {
		success: {
			deleted: await store.deleteEvent({ $i, aliasId, eventId })
		}
	};
}

module.exports = {
	update,
	remove
};
