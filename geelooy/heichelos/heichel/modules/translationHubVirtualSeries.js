// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TranslationHubVirtualSeries
 * @description
 * The Awtsmoos reveals one language-tool chamber whose Hebrew and English names travel together along the path;
 * Awtsmoos.com keeps this page virtual and useful, never inventing a stored empty series beneath its lexical light.
 */

import { TRANSLATION_HUB_ID } from './translationHubIds.js?v=language-tools-003';
import { translationHubSeriesData } from './translationHubPresentation.js?v=language-tools-003';
import { torahTitleFields } from './torahTitlePresentation.js?v=torah-bilingual-003';

export function loadTranslationHubVirtualSeries() {
	const root = {
		id: 'root',
		...torahTitleFields({
			titleKey: 'root',
			name: 'Root'
		})
	};
	const hub = {
		id: TRANSLATION_HUB_ID,
		...torahTitleFields({
			titleKey: TRANSLATION_HUB_ID,
			name: 'תרגומים ומילון'
		})
	};
	return {
		breadcrumb: [
			root,
			hub
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
