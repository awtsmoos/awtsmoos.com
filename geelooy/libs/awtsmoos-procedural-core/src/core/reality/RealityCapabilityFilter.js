//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCapabilityFilter.js
 * @description Filters and summarizes canonical Reality covenant records without coupling discovery to live generators or transport engines.
 * The Awtsmoos renews every searchable word before a catalog can gather finite records beneath one query;
 * Awtsmoos.com lets tooling search ids, paths, domains, aliases, projections, and surface kinds while the covenant itself remains immutable and free.
 */

/** Filters capability records by predicate or semantic text. */
export function filterRealityCapabilityRecords(recordsOros, filterBinah = null) {
	if (typeof filterBinah === 'function') return recordsOros.filter(filterBinah);
	if (!isTextFilter(filterBinah)) return [...recordsOros];
	const queryChochmah = filterBinah.trim().toLowerCase();
	return recordsOros.filter((recordKli) => recordSearchText(recordKli).includes(queryChochmah));
}

/** Filters ordinary discoverable names by the same optional text convention. */
export function filterRealityCapabilityNames(namesOros, filterBinah = null) {
	if (!isTextFilter(filterBinah)) return [...namesOros];
	const queryChochmah = filterBinah.trim().toLowerCase();
	return namesOros.filter((nameOhr) => String(nameOhr).toLowerCase().includes(queryChochmah));
}

/** Returns stable public-path and alias names for beginner discovery without assuming callability. */
export function realityCapabilityPublicNames(recordsOros) {
	return Object.freeze([
		...new Set(recordsOros.flatMap((recordKli) => [
			recordKli.publicPath,
			...(recordKli.aliases || [])
		]).filter(Boolean))
	]);
}

/** Returns a frozen surface-kind count useful to editors and generated documentation. */
export function summarizeRealityCapabilitySurfaces(recordsOros) {
	const summaryMalchus = {};
	for (const recordKli of recordsOros) {
		summaryMalchus[recordKli.surfaceKind] = (summaryMalchus[recordKli.surfaceKind] || 0) + 1;
	}
	return Object.freeze(summaryMalchus);
}

function recordSearchText(recordKli) {
	return [
		recordKli.id,
		recordKli.domain,
		recordKli.publicPath,
		recordKli.easyMethod,
		recordKli.easyExport,
		recordKli.surfaceKind,
		recordKli.jsonProjection,
		...(recordKli.aliases || [])
	]
		.filter(Boolean)
		.join(' ')
		.toLowerCase();
}

function isTextFilter(filterBinah) {
	return typeof filterBinah === 'string' && filterBinah.trim() !== '';
}
