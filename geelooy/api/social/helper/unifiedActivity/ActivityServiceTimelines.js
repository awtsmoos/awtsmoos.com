//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module ActivityServiceTimelines
 * @description
 * Owner timeline, shared timeline and ledger export reads.
 */

const store = require('./ActivityStore.js');
const { categoryEnabled } = require('./ActivityPreferences.js');
const { filterVisibleEvents } = require('./ActivityPrivacy.js');

const { pruneExpired } = require('./ActivityServiceCapture.js');

async function ownerTimeline({ $i, aliasId, limit }) {
	const preferences = await store.getPreferences({ $i, aliasId });
	await pruneExpired({ $i, aliasId, preferences });
	return {
		success: {
			preferences,
			events: await store.listEvents({ $i, aliasId, limit })
		}
	};
}

async function sharedTimeline({ $i, ownerAliasId, viewerAliasId, limit }) {
	const events = await store.listEvents({
		$i,
		aliasId: ownerAliasId,
		limit: Math.min(Number(limit || 100), 200)
	});
	return {
		success: await filterVisibleEvents({
			$i,
			events,
			ownerAliasId,
			viewerAliasId
		})
	};
}

async function exportLedger({ $i, aliasId }) {
	return {
		success: {
			version: 1,
			aliasId,
			exportedAt: Date.now(),
			preferences: await store.getPreferences({ $i, aliasId }),
			events: await store.listEvents({ $i, aliasId, limit: 2000 })
		}
	};
}

module.exports = {
	ownerTimeline,
	sharedTimeline,
	exportLedger
};
