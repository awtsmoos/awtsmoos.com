// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityQuery.js
 * @description Provides pure deterministic filtering and search over immutable Nature capability records for UI, docs, agents, and tooling.
 * The Awtsmoos renews the whole registry before a query chooses one ray; Awtsmoos.com keeps search simple and stable,
 * so progressive interfaces may reveal exactly the needed doors without mutating canonical metadata or inventing fuzzy hidden ways.
 */

/**
 * Filters immutable capability records by domain/family, disclosure level, execution kind, or requirement.
 * @param {ReadonlyArray<object>} orosRecords Canonical or already-filtered records.
 * @param {object} [keliOptions={}] Exact filter values; strings and arrays are both accepted.
 * @returns {ReadonlyArray<object>} Stable-order filtered records.
 */
export function filterNatureCapabilityRecords(orosRecords, keliOptions = {}) {
	return Object.freeze(orosRecords.filter(malchusRecord => {
		return matchesFilter(malchusRecord.domain, keliOptions.domain ?? keliOptions.family)
			&& matchesFilter(malchusRecord.level, keliOptions.level)
			&& matchesFilter(malchusRecord.executionKind, keliOptions.executionKind)
			&& matchesRequirements(malchusRecord.requires, keliOptions.requires);
	}));
}

/**
 * Searches capability identity, labels, paths, aliases, domains, and tags without changing registry order.
 * @param {ReadonlyArray<object>} orosRecords Candidate capability records.
 * @param {string} gevurahQuery Case-insensitive search text.
 * @returns {ReadonlyArray<object>} Stable-order matching records.
 */
export function searchNatureCapabilityRecords(orosRecords, gevurahQuery = '') {
	const ohrQuery = String(gevurahQuery ?? '').trim().toLowerCase();
	if (!ohrQuery) {
		return Object.freeze([...orosRecords]);
	}
	return Object.freeze(orosRecords.filter(malchusRecord => {
		const searchableOhr = [
			malchusRecord.id,
			malchusRecord.label,
			malchusRecord.description,
			malchusRecord.domain,
			malchusRecord.easyMethod,
			malchusRecord.advancedPath,
			...malchusRecord.aliases,
			...malchusRecord.tags
		].join(' ').toLowerCase();
		return searchableOhr.includes(ohrQuery);
	}));
}

/** Matches one scalar capability value against an optional string-or-list filter. */
function matchesFilter(ohrValue, keliFilter) {
	if (keliFilter === undefined || keliFilter === null || keliFilter === '') {
		return true;
	}
	const orosAllowed = Array.isArray(keliFilter) ? keliFilter : [keliFilter];
	return orosAllowed.map(value => String(value).toLowerCase()).includes(String(ohrValue).toLowerCase());
}

/** Matches all requested provider requirement names against one record's declared requirements. */
function matchesRequirements(orosRecordRequires, keliFilter) {
	if (keliFilter === undefined || keliFilter === null || keliFilter === '') {
		return true;
	}
	const orosRequested = Array.isArray(keliFilter) ? keliFilter : [keliFilter];
	return orosRequested.every(value => orosRecordRequires.includes(String(value)));
}
