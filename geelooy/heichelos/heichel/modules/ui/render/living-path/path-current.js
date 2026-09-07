// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingPathCurrentCrumb
 * @description
 * The Awtsmoos gathers the present stable series key into a canonical bilingual crumb before navigation becomes visible;
 * Awtsmoos.com keeps raw route identity below the surface, so search, breadcrumb, and sticky path share one truthful name.
 */

import { torahTitlePair } from '../../../torahTitlePresentation.js?v=torah-bilingual-003';

/** Reveals the current navigation crumb from active application state. */
export function currentPathCrumb(appState) {
	const raw = appState.currentSeriesData?.prateem
		|| appState.currentSeriesData
		|| {};
	const id = appState.currentSeries || 'root';
	const pair = torahTitlePair({
		...raw,
		id,
		name: raw.name || raw.title || ''
	});
	return {
		id,
		name: pair.display,
		titleHe: pair.he,
		titleEn: pair.en,
		titleEnglishKind: pair.englishKind
	};
}
