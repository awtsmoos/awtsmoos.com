//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ActivityService
 * @description
 * Capture preferences, retention, owner reads, shared reads, updates, deletion, and
 * export gather without exposing storage directly. The Awtsmoos remembers without
 * limit while Awtsmoos.com records only the finite fields its user currently chose.
 */

const store = require('./ActivityStore.js');
const { categoryEnabled } = require('./ActivityPreferences.js');
const { filterVisibleEvents } = require('./ActivityPrivacy.js');

function retentionCutoff(preferences) {
	return Date.now() - preferences.retentionDays * 24 * 60 * 60 * 1000;
}

function stripQuery(pathValue) {
	return String(pathValue || '/').split('?')[0].split('#')[0] || '/';
}

function applyCapturePreferences(input, preferences) {
	const event = { ...input };
	if (!preferences.captureTitle) {
		event.title = event.action || 'Activity';
	}
	if (!preferences.captureDuration) {
		event.durationMs = 0;
	}
	if (!preferences.captureQuery) {
		event.path = stripQuery(event.path || event.url || '/');
	}
	return event;
}

async function pruneExpired({ $i, aliasId, preferences }) {
	const cutoff = retentionCutoff(preferences);
	const events = await store.listEvents({ $i, aliasId, limit: 2000 });
	let deleted = 0;
	for (const event of events) {
		if (Number(event.createdAt || 0) >= cutoff) continue;
		if (await store.deleteEvent({ $i, aliasId, eventId: event.id })) deleted += 1;
	}
	return deleted;
}

async function record({ $i, aliasId, input }) {
	const preferences = await store.getPreferences({ $i, aliasId });
	if (!categoryEnabled(preferences, input.category || 'navigation')) {
		return {
			success: {
				recorded: false,
				reason: preferences.enabled ? 'category-disabled' : 'ledger-paused'
			}
		};
	}
	await pruneExpired({ $i, aliasId, preferences });
	const captured = applyCapturePreferences(input, preferences);
	const result = await store.createEvent({
		$i,
		aliasId,
		input: {
			...captured,
			visibility: captured.visibility || {
				mode: preferences.defaultVisibility
			}
		}
	});
	return { success: { recorded: true, ...result } };
}

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
	retentionCutoff,
	stripQuery,
	applyCapturePreferences,
	pruneExpired,
	record,
	ownerTimeline,
	sharedTimeline,
	exportLedger,
	update,
	remove
};
