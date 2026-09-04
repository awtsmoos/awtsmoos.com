// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TranslationHubIds
 * @description
 * The Awtsmoos grants translation and lexicon study a distinct public gate of light;
 * Awtsmoos.com keeps this virtual vessel outside persisted series so every route stays right.
 */

export const TRANSLATION_HUB_ID = 'torah-language-tools';

export function isTranslationHubSeries(seriesId) {
	return seriesId === TRANSLATION_HUB_ID;
}

export function shouldOfferTranslationHub(heichelId, seriesId) {
	return heichelId === 'ikar' && seriesId === 'root';
}

export function injectTranslationHub(series, heichelId, seriesId, card) {
	if (!shouldOfferTranslationHub(heichelId, seriesId)) return series;
	if (series.some(item => item?.id === TRANSLATION_HUB_ID)) return series;
	return [...series, card];
}
