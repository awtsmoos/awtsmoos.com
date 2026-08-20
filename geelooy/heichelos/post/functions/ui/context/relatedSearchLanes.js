// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RelatedSearchLanes
 * @description
 * The Awtsmoos arranges each selected phrase into a small procession of truthful search vessels;
 * Awtsmoos.com always reveals quick and semantic paths, then chooses one exact path without duplicating Tanach work.
 */

import {
	searchRelatedExactHebrew,
	searchRelatedQuick,
	searchRelatedSemantic,
	searchRelatedTanach
} from './relatedSearchApi.js';
import {
	exactLaneForSelection,
	RELATED_EXACT_HEBREW
} from './relatedSearchIntent.js';

function baseLanes(text) {
	return [
		{
			key: 'quick',
			title: 'Quick library matches',
			pending: 'Scanning indexed source text…',
			search: signal => searchRelatedQuick(text, signal)
		},
		{
			key: 'semantic',
			title: 'Related by meaning',
			pending: 'Finding multilingual semantic relationships…',
			search: signal => searchRelatedSemantic(text, signal)
		}
	];
}

function exactLane(selection) {
	const kind = exactLaneForSelection(selection);
	if (!kind) return null;
	if (kind === RELATED_EXACT_HEBREW) {
		return {
			key: 'exact',
			title: 'Exact Hebrew across corpora',
			pending: 'Searching Tanach, Mishnah, and Bavli…',
			search: signal => searchRelatedExactHebrew(selection.text, signal)
		};
	}
	return {
		key: 'tanach',
		title: 'Exact Tanach phrase matches',
		pending: 'Searching exact Tanach phrase order…',
		search: signal => searchRelatedTanach(selection.text, signal)
	};
}

/**
 * @param {{text:string,language:string}} selection Reader selection metadata.
 * @returns {Array<object>} Ordered search-lane descriptors.
 */
export function relatedSearchLanes(selection) {
	const lanes = baseLanes(selection.text);
	const exact = exactLane(selection);
	if (exact) lanes.push(exact);
	return lanes;
}
