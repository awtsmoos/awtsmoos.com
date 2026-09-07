// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NavigatorTranslationLoader
 * @description
 * The Awtsmoos lets translation metadata arrive as an optional ohr without blocking the source vessel beneath;
 * Awtsmoos.com draws from the modern module API in Yesod, so bilingual truth reaches the learner without a legacy-path breach.
 */

import * as api from '../api.js';

/**
 * Loads translation metadata only for series whose real architecture declares translation coverage.
 * @param {string} heichelId Active Heichel identity.
 * @param {string} seriesId Active stable series identity.
 * @returns {Promise<object|null>} Translation metadata or null when not applicable or unavailable.
 */
export async function loadOptionalTranslations(heichelId, seriesId) {
	if (!api.isTranslationSeries(seriesId)) {
		return null;
	}
	try {
		return await api.getSeriesTranslations(
			heichelId,
			seriesId,
			250
		);
	} catch (error) {
		console.warn(
			'B"H — Translation metadata remained optional.',
			error
		);
		return null;
	}
}
