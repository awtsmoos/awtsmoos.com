// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCapabilitySearch.js
 * @description Searches professional Reality capability covenants across path, domain, label, description, identity, projection, surface kind, expert path, and aliases.
 * The Awtsmoos renews every finite word before a search can narrow what appears; Awtsmoos.com lets Binah filter the visible palace without changing one room,
 * so textual discovery grows richer while predicates remain exact and live intent or preset registries stay independent from static API metadata.
 */

/** Filters capability records by predicate or case-insensitive semantic text. */
export function filterRealityCapabilityRecords(keterRecords, chochmahFilter) {
	if (typeof chochmahFilter === 'function') {
		return keterRecords.filter((binahRecord) => chochmahFilter(binahRecord));
	}
	if (!isRealityTextFilter(chochmahFilter)) return [...keterRecords];
	const gevurahQuery = chochmahFilter.trim().toLowerCase();
	return keterRecords.filter((tiferesRecord) => {
		return searchableCapabilityText(tiferesRecord).includes(gevurahQuery);
	});
}

/** Filters a live name collection only when a text search is active. */
export function filterRealityCapabilityNames(keterNames, chochmahFilter) {
	const binahNames = [...keterNames];
	if (!isRealityTextFilter(chochmahFilter)) return binahNames;
	const gevurahQuery = chochmahFilter.trim().toLowerCase();
	return binahNames.filter((tiferesName) => {
		return String(tiferesName).toLowerCase().includes(gevurahQuery);
	});
}

/** Reports whether a non-empty textual search term is active. */
export function isRealityTextFilter(keterFilter) {
	return typeof keterFilter === 'string' && keterFilter.trim() !== '';
}

/** Builds the canonical searchable text for one portable capability covenant. */
function searchableCapabilityText(keterRecord) {
	return [
		keterRecord.id,
		keterRecord.domain,
		keterRecord.publicPath,
		keterRecord.label,
		keterRecord.description,
		keterRecord.easyMethod,
		keterRecord.easyExport,
		keterRecord.surfaceKind,
		keterRecord.jsonProjection,
		keterRecord.advancedPath,
		...(keterRecord.aliases || [])
	]
		.filter(Boolean)
		.join(' ')
		.toLowerCase();
}
