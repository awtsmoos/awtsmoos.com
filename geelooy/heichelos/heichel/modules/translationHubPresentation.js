// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TranslationHubPresentation
 * @description
 * The Awtsmoos lets language tools illuminate the learner without becoming another Torah taxonomy;
 * Awtsmoos.com keeps dictionary and translation utility beside the tree, while source branches remain one in harmony.
 */

import { TRANSLATION_HUB_ID } from './translationHubIds.js?v=language-tools-002';

const VIRTUAL = {
	type: 'series',
	virtual: true,
	translationHub: true
};

export function translationHubCard() {
	return {
		...VIRTUAL,
		id: TRANSLATION_HUB_ID,
		name: 'תרגומים ומילון',
		description: 'כלי תרגום ופירוש למילים בעברית, ארמית, יידיש ואנגלית.'
	};
}

export function translationHubSeriesData() {
	return {
		...translationHubCard(),
		translationHubPage: true
	};
}
