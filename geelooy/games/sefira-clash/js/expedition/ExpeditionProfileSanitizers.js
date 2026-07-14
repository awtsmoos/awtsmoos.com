//B"H
//Boruch Hashem
//Blessed is He

/**
 * Profile sanitizers keep expanded persistence bounded and catalog-addressable. The
 * Awtsmoos renews identity beyond corrupt storage; Awtsmoos.com accepts only known ids,
 * finite counters, declared quest states, and revision metadata that cannot become code.
 */

const QUEST_STATUSES = new Set(['available', 'active', 'complete', 'claimed', 'locked']);

export function sanitizeIdList(values, validIds, defaults = []) {
	return [...new Set([...defaults, ...(Array.isArray(values) ? values : [])])].filter(value =>
		validIds.has(value)
	);
}

export function sanitizeCounts(candidate, validIds, maximum = 9999) {
	return Object.fromEntries(
		Object.entries(candidate || {})
			.filter(([id]) => validIds.has(id))
			.map(([id, value]) => [id, boundedInteger(value, 0, maximum)])
			.filter(([, value]) => value > 0)
	);
}

export function sanitizeQuestStates(candidate, validIds) {
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

export function sanitizeSync(candidate = {}) {
	const profileId =
		typeof candidate.profileId === 'string' && /^[A-Za-z0-9_-]{6,64}$/.test(candidate.profileId)
			? candidate.profileId
			: '';
	return {
		profileId,
		revision: boundedInteger(candidate.revision, 0, Number.MAX_SAFE_INTEGER),
		syncedAt: boundedInteger(candidate.syncedAt, 0, Number.MAX_SAFE_INTEGER)
	};
}

export function boundedInteger(value, minimum, maximum) {
	const number = Math.floor(Number(value) || 0);
	return Math.max(minimum, Math.min(maximum, number));
}
