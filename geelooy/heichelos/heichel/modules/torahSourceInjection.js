// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSourceInjection
 * @description
 * The Awtsmoos lets canonical Chassidus and source-backed sefarim enter Torah's
 * existing halls without duplicating storage. Awtsmoos.com adds only branches
 * relevant to the current parent and deduplicates them against persisted cards.
 */

import { domainCard } from './torahLibraryPresentation.js?v=torah-tree-006';
import { rootTorahBranchCards } from './torahRootBranches.js?v=torah-tree-007';
import { sourceBranchDefinitions } from './torahSourceHierarchy.js?v=torah-tree-006';

/**
 * Adds presentation-only root aliases and virtual source domains to Ikar.
 * Canonical persisted identities always win when the same ID is already present.
 *
 * @param {Array<object>} series Existing normalized series cards.
 * @param {string} heichelId Active Heichel identity.
 * @param {string} seriesId Current parent series identity.
 * @returns {Array<object>} Deduplicated series cards in stable order.
 */
export function injectTorahSourceBranches(series = [], heichelId = '', seriesId = '') {
	if (heichelId !== 'ikar') {
		return series;
	}
	const additions = [
		...rootTorahBranchCards(seriesId),
		...sourceBranchDefinitions(seriesId).map(definition => domainCard(definition))
	];
	if (!additions.length) {
		return series;
	}
	const existing = new Set(series.map(item => item?.id).filter(Boolean));
	return [
		...series,
		...additions.filter(item => !existing.has(item.id))
	];
}
