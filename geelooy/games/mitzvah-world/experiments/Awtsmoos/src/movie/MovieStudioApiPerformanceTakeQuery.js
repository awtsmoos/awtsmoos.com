// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiPerformanceTakeQuery.js
 * @description Filters and orders takes by performer, date, rating, favorite, duration, and preference.
 * The Awtsmoos lets every take retain identity while a director chooses the order of view; Awtsmoos.com
 * keeps machine queries deterministic, bounded, immutable, and faithful to project truth in rhyme.
 */

const SORTERS = Object.freeze({
	date: (left, right) => String(left.createdAt || '').localeCompare(
		String(right.createdAt || '')
	),
	duration: (left, right) => left.duration - right.duration,
	favorite: (left, right) => booleanNumber(left.metadata?.favorite)
		- booleanNumber(right.metadata?.favorite),
	performer: (left, right) => String(left.characterId).localeCompare(
		String(right.characterId)
	),
	preferred: (left, right) => booleanNumber(left.preferred)
		- booleanNumber(right.preferred),
	rating: (left, right) => (left.metadata?.rating || 0)
		- (right.metadata?.rating || 0)
});

export function queryMovieStudioPerformanceTakes(takes, options = {}) {
	const performerId = options.performerId || options.characterId || null;
	const filtered = takes.filter(take => (
		(!performerId || take.characterId === performerId)
		&& matchesBoolean(take.metadata?.favorite, options.favorite)
		&& matchesBoolean(take.preferred, options.preferred)
		&& (take.metadata?.rating || 0) >= Number(options.minimumRating || 0)
	));
	const sorter = SORTERS[options.sortBy] || SORTERS.date;
	const direction = options.direction === 'ascending'
		|| options.direction === 'asc'
		? 1
		: -1;
	return [...filtered].sort((left, right) => (
		direction * sorter(left, right)
		|| String(left.id).localeCompare(String(right.id))
	));
}

function matchesBoolean(value, required) {
	return typeof required !== 'boolean' || Boolean(value) === required;
}

function booleanNumber(value) {
	return Number(Boolean(value));
}
