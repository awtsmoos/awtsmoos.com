//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ActivityEventStore
 * @description
 * Event bodies and their bounded chronological index remain one focused storage
 * vessel. The Awtsmoos remembers all moments at once; Awtsmoos.com deduplicates and
 * updates them without mixing deletion or preference behavior into the same file.
 */

const crypto = require('crypto');
const paths = require('./ActivityPaths.js');
const { normalizeEvent } = require('./ActivitySchema.js');
const { read } = require('./ActivityPreferenceStore.js');

function eventId() {
	return `BH_activity_${Date.now().toString(36)}_${crypto.randomBytes(5).toString('hex')}`;
}

async function readIndex({ $i, aliasId }) {
	const value = await read($i, paths.index(aliasId), []);
	return Array.isArray(value) ? value.map(String) : [];
}

async function listEvents({ $i, aliasId, limit = 200 }) {
	const index = await readIndex({ $i, aliasId });
	const output = [];
	for (const id of index.slice(0, Math.min(Number(limit || 200), 2000))) {
		const event = await read($i, paths.event(aliasId, id), null);
		if (event && !event.deleted) output.push(event);
	}
	return output;
}

function sameNavigation(left, right) {
	return left?.category === 'navigation'
		&& right?.category === 'navigation'
		&& left.path === right.path
		&& Number(right.createdAt || 0) - Number(left.createdAt || 0) < 15_000;
}

async function updateLatest({ $i, aliasId, latest, normalized, now }) {
	const updated = {
		...latest,
		title: normalized.title || latest.title,
		durationMs: Math.max(latest.durationMs || 0, normalized.durationMs || 0),
		updatedAt: now
	};
	await $i.db.write(paths.event(aliasId, latest.id), updated);
	return { event: updated, deduplicated: true };
}

async function createEvent({ $i, aliasId, input }) {
	const normalized = normalizeEvent(input);
	const index = await readIndex({ $i, aliasId });
	const latest = index[0]
		? await read($i, paths.event(aliasId, index[0]), null)
		: null;
	const now = Date.now();
	if (sameNavigation(latest, { ...normalized, createdAt: now })) {
		return updateLatest({ $i, aliasId, latest, normalized, now });
	}
	const id = eventId();
	const event = {
		id,
		aliasId,
		...normalized,
		createdAt: now,
		updatedAt: now,
		deleted: false
	};
	await $i.db.write(paths.event(aliasId, id), event);
	await $i.db.write(
		paths.index(aliasId),
		[id, ...index.filter(item => item !== id)].slice(0, 2000)
	);
	return { event, deduplicated: false };
}

async function updateEvent({ $i, aliasId, eventId: id, input }) {
	const current = await read($i, paths.event(aliasId, id), null);
	if (!current) return null;
	const updated = {
		...current,
		...normalizeEvent({ ...current, ...input }),
		updatedAt: Date.now()
	};
	await $i.db.write(paths.event(aliasId, id), updated);
	return updated;
}

module.exports = {
	eventId,
	readIndex,
	listEvents,
	sameNavigation,
	updateLatest,
	createEvent,
	updateEvent
};
