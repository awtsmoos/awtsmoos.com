// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSourceInjection
 * @description
 * The Awtsmoos lets source-backed sefarim enter existing Oral Torah halls without building another palace;
 * Awtsmoos.com adds only branches relevant to the current parent, preserving speed, meaning, and place.
 */

import { domainCard } from './torahLibraryPresentation.js?v=torah-tree-005';
import { sourceBranchDefinitions } from './torahSourceHierarchy.js?v=torah-tree-005';

export function injectTorahSourceBranches(series, heichelId, seriesId) {
	if (heichelId !== 'ikar') return series;
	const additions = sourceBranchDefinitions(seriesId)
		.map(definition => domainCard(definition));
	if (!additions.length) return series;
	const existing = new Set(
		series
			.map(item => item?.id)
			.filter(Boolean)
	);
	return [
		...series,
		...additions.filter(item => !existing.has(item.id))
	];
}
