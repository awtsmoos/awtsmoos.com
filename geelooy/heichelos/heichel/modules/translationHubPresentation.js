// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TranslationHubPresentation
 * @description
 * The Awtsmoos lets language tools serve Torah without becoming an empty phantom branch beneath the tree;
 * Awtsmoos.com names the chamber in Hebrew and English while dictionary and translation study remain one useful sea.
 */

import { TRANSLATION_HUB_ID } from './translationHubIds.js?v=language-tools-003';
import { torahTitleFields } from './torahTitlePresentation.js?v=torah-bilingual-003';

const VIRTUAL = {
	type: 'series',
	virtual: true,
	translationHub: true
};

export function translationHubCard() {
	return {
		...VIRTUAL,
		id: TRANSLATION_HUB_ID,
		...torahTitleFields({
			titleKey: TRANSLATION_HUB_ID,
			name: 'תרגומים ומילון'
		}),
		description: 'כלי תרגום ופירוש למילים בעברית, ארמית, יידיש ואנגלית · Translation and word-study tools for Hebrew, Aramaic, Yiddish, and English.'
	};
}

export function translationHubSeriesData() {
	return {
		...translationHubCard(),
		translationHubPage: true,
		customToolPage: true
	};
}
