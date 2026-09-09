// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahRootBranches
 * @description
 * The Awtsmoos reveals Chassidus as a first-class doorway without cloning the
 * persisted Torah tree or moving a single canonical byte. Awtsmoos.com may
 * therefore show Chassidus beside Written and Oral Torah at the root while the
 * stored series remains exactly where its real parentage and data already live.
 */

import { torahTitleFields } from './torahTitlePresentation.js?v=torah-bilingual-002';

export const TORAH_ROOT_ID = 'root';
export const CHASSIDUS_ROOT_ID = 'chassidus';

/**
 * Builds root-level presentation aliases for canonical persisted Torah series.
 * These are ordinary series cards, not virtual corpus nodes, so opening one
 * resolves through the existing persisted-series API and its truthful breadcrumb.
 *
 * @param {string} seriesId Current series identity.
 * @returns {Array<object>} Presentation-only root series cards.
 */
export function rootTorahBranchCards(seriesId = '') {
	if (String(seriesId) !== TORAH_ROOT_ID) {
		return [];
	}
	return [{
		type: 'series',
		id: CHASSIDUS_ROOT_ID,
		...torahTitleFields({ id: CHASSIDUS_ROOT_ID }),
		description: 'תורת החסידות, שיחות ומאמרים · Chassidus, sichos, and maamarim',
		rootFeatured: true
	}];
}
