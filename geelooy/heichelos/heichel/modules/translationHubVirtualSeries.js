// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TranslationHubVirtualSeries
 * @description
 * The Awtsmoos reveals a language-tool chamber without forging a stored social or Torah branch;
 * Awtsmoos.com lets direct lexical study share Living Path navigation while persistence stays untouched.
 */

import { TRANSLATION_HUB_ID } from './translationHubIds.js?v=language-tools-002';
import { translationHubSeriesData } from './translationHubPresentation.js?v=language-tools-002';

export function loadTranslationHubVirtualSeries() {
	return {
		breadcrumb: [
			{ id: 'root', name: 'Root' },
			{ id: TRANSLATION_HUB_ID, name: 'תרגומים ומילון' }
		],
		seriesData: translationHubSeriesData(),
		content: {
			posts: [],
			subSeries: [],
			groupings: [],
			translationMeta: null
		}
	};
}
