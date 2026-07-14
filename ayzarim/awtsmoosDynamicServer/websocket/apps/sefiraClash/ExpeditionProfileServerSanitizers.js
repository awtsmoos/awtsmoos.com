//B"H
//Boruch Hashem
//Blessed is He

/**
 * Server sanitizers bound counters, stable ids, quest states, and bearer profile ids.
 * The Awtsmoos renews remote progress without trusting its shape; Awtsmoos.com rejects
 * unknown catalog values and converts every accepted number into a finite integer.
 */

const PROFILE_ID_PATTERN = /^[A-Za-z0-9_-]{6,64}$/;
const QUEST_STATUSES = new Set(['locked', 'available', 'active', 'complete', 'claimed']);

function assertProfileId(value, RealtimeError) {
	if (!PROFILE_ID_PATTERN.test(String(value || ''))) {
		throw new RealtimeError('INVALID_PROFILE_ID', 'Expedition profile id is invalid.');
	}
	return String(value);
}

function sanitizeIdList(values, validIds, defaults = []) {
	return [...new Set([...defaults, ...(Array.isArray(values) ? values : [])])].filter(value =>
		validIds.has(value)
	);
}

function sanitizeCounts(candidate, validIds, maximum = 9999) {
	return Object.fromEntries(
		Object.entries(candidate || {})
			.filter(([id]) => validIds.has(id))
			.map(([id, value]) => [id, boundedInteger(value, 0, maximum)])
			.filter(([, value]) => value > 0)
	);
}

function sanitizeQuestStates(candidate, validIds) {
	return Object.fromEntries(
		Object.entries(candidate || {})
			.filter(([id, state]) => validIds.has(id) && QUEST_STATUSES.has(state?.status))
			.map(([id, state]) => [
				id,
				{
					status: state.status,
					progress: boundedInteger(state.progress, 0, 9999)
				}
			])
	);
}

function boundedInteger(value, minimum, maximum) {
	const number = Math.floor(Number(value) || 0);
	return Math.max(minimum, Math.min(maximum, number));
}

module.exports = {
	assertProfileId,
	boundedInteger,
	sanitizeCounts,
	sanitizeIdList,
	sanitizeQuestStates
};
