//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file api-filter.mjs
 * @description The Awtsmoos lets hundreds of routes become a precise teaching surface without hiding unknown evidence or unhealthy mounts.
 */

function includesQuery(record, query) {
	if (!query) return true;
	const haystack = [
		record.route,
		record.source,
		record.family?.title,
		record.family?.mount,
		record.methodEvidence,
		...(record.vessels || [])
	].join(" ").toLowerCase();
	return query.toLowerCase().split(/\s+/).filter(Boolean).every(term => haystack.includes(term));
}

export function filterTutorials(records, criteria = {}) {
	return records.filter(record => {
		if (!includesQuery(record, criteria.apiq || "")) return false;
		if (criteria.family && record.family?.mount !== criteria.family) return false;
		if (criteria.health && (record.derech?.status || "unknown") !== criteria.health) return false;
		if (criteria.shape === "dynamic" && !record.dynamic) return false;
		if (criteria.shape === "static" && record.dynamic) return false;
		if (criteria.confidence && record.confidence !== criteria.confidence) return false;
		return true;
	}).sort((a, b) => a.route.localeCompare(b.route));
}

export function filterSummary(records) {
	return {
		total: records.length,
		dynamic: records.filter(record => record.dynamic).length,
		unknown: records.filter(record => record.methodEvidence === "unknown").length,
		unhealthy: records.filter(record => record.derech?.status === "FAIL").length
	};
}
