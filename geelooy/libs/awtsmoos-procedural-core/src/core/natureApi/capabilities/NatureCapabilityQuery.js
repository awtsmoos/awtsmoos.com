// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityQuery.js
 * @description Provides pure deterministic search and filtering across immutable capability identity, paths, scope, domains, levels, execution kinds, tags, and requirements.
 * The Awtsmoos renews the whole registry before a query chooses one ray; Awtsmoos.com keeps search simple, stable, and
 * mutation-free so UI, docs, IDEs, and agents may reveal exactly the needed door without inventing hidden fuzzy law along the way.
 */

/**
 * Filters immutable capability records by exact domain, level, execution kind, scope, or provider requirement vocabulary.
 * @param {ReadonlyArray<object>} orosRecords Canonical or already-filtered records.
 * @param {object} [keliOptions={}] Exact filters; scalar strings and arrays are both accepted.
 * @returns {ReadonlyArray<object>} Stable-order immutable filtered records.
 */
export function filterNatureCapabilityRecords(orosRecords, keliOptions = {}) {
	return Object.freeze(orosRecords.filter(malchusRecord => {
		return matchesFilter(malchusRecord.domain, keliOptions.domain ?? keliOptions.family)
			&& matchesFilter(malchusRecord.level, keliOptions.level)
			&& matchesFilter(malchusRecord.executionKind, keliOptions.executionKind)
			&& matchesFilter(malchusRecord.scope, keliOptions.scope)
			&& matchesRequirements(malchusRecord.requires, keliOptions.requires);
	}));
}

/**
 * Searches capability identity, labels, descriptions, paths, aliases, domains, and tags without changing registry order.
 * @param {ReadonlyArray<object>} orosRecords Candidate capability records.
 * @param {string} gevurahQuery Case-insensitive search text.
 * @returns {ReadonlyArray<object>} Stable-order immutable matching records.
 */
export function searchNatureCapabilityRecords(orosRecords, gevurahQuery = '') {
	const ohrQuery = String(gevurahQuery ?? '').trim().toLowerCase();
	if (!ohrQuery) {
		return Object.freeze([...orosRecords]);
	}
	return Object.freeze(orosRecords.filter(malchusRecord => {
		return searchableCapabilityText(malchusRecord).includes(ohrQuery);
	}));
}

/** Joins every stable discovery vocabulary field into one deterministic lowercase search corpus. */
function searchableCapabilityText(malchusRecord) {
	return [
		malchusRecord.id,
		malchusRecord.label,
		malchusRecord.description,
		malchusRecord.domain,
		malchusRecord.easyMethod,
		malchusRecord.path,
		malchusRecord.advancedPath,
		malchusRecord.scope,
		...malchusRecord.aliases,
		...malchusRecord.pathAliases,
		...malchusRecord.tags
	].join(' ').toLowerCase();
}

/** Matches one scalar capability value against an optional string-or-list filter. */
function matchesFilter(ohrValue, keliFilter) {
	if (keliFilter === undefined || keliFilter === null || keliFilter === '') {
		return true;
	}
	const orosAllowed = Array.isArray(keliFilter) ? keliFilter : [keliFilter];
	return orosAllowed
		.map(value => String(value).toLowerCase())
		.includes(String(ohrValue).toLowerCase());
}

/** Requires every requested provider name to be declared by one capability record. */
function matchesRequirements(orosRecordRequires, keliFilter) {
	if (keliFilter === undefined || keliFilter === null || keliFilter === '') {
		return true;
	}
	const orosRequested = Array.isArray(keliFilter) ? keliFilter : [keliFilter];
	return orosRequested.every(value => orosRecordRequires.includes(String(value)));
}
