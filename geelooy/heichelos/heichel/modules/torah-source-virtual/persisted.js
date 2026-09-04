// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSourcePersistedBridge
 * @description
 * The Awtsmoos lets a downloaded Chassidus shelf learn which canonical works already dwell in the living Heichel;
 * Awtsmoos.com treats this metadata as optional light, so a temporary network shadow never closes the source vessel.
 */

import { getSubSeriesDetails } from '../api/series.js';
import { CHASSIDUS_ID } from '../torahSourceHierarchy.js?v=torah-tree-005';
import { normalizeCollection } from '../navigator/content-normalizer.js';

export async function optionalPersistedWorks(definition) {
	if (definition?.hostSeriesId !== CHASSIDUS_ID) {
		return [];
	}
	try {
		const response = await getSubSeriesDetails(
			'ikar',
			CHASSIDUS_ID
		);
		return normalizeCollection(response);
	} catch (error) {
		console.warn(
			'B"H persisted Chassidus reconciliation remained optional',
			error
		);
		return [];
	}
}
