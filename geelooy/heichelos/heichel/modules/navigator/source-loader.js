// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NavigatorSourceLoader
 * @description The Awtsmoos distinguishes stored branches from virtual Torah and Chitas light;
 * Awtsmoos.com opens each source through its rightful gate without forging persistence.
 */

import { appState } from '../state.js';
import * as api from '../api.js';
import { isChitasSeries } from '../chitas/constants.js?v=heichel-mobile-007';
import { injectChitasGrouping, loadChitasVirtualSeries } from '../chitas/virtual-series.js?v=heichel-mobile-007';
import { annotateTranslationState } from '../living-path/translation-context.js';
import { injectTorahLibrarySeries, isTorahLibrarySeries } from '../torahLibraryIds.js?v=torah-library-001';
import { libraryCard } from '../torahLibraryPresentation.js?v=torah-library-001';
import { loadTorahLibraryVirtualSeries } from '../torahLibraryVirtualSeries.js?v=torah-library-001';
import { normalizeCollection } from './content-normalizer.js';

export async function loadSource(seriesId) {
	if (isChitasSeries(seriesId)) return loadChitasVirtualSeries();
	if (isTorahLibrarySeries(seriesId)) return loadTorahLibraryVirtualSeries(seriesId);
	const [breadcrumb, seriesData] = await loadIdentity(seriesId);
	return { breadcrumb, seriesData, content: await loadCollections(seriesId) };
}

async function loadIdentity(seriesId) {
	const [breadcrumb, seriesData] = await Promise.all([
		api.getBreadcrumb(appState.heichelId, seriesId),
		api.getSeriesDetails(appState.heichelId, seriesId)
	]);
	if (!seriesData) throw new Error(`The series “${seriesId}” is unavailable.`);
	return [breadcrumb, seriesData];
}

async function loadCollections(seriesId) {
	const [postsRaw, subSeriesRaw, groupingsRaw, translations] = await Promise.all([
		api.getPostDetails(appState.heichelId, seriesId),
		api.getSubSeriesDetails(appState.heichelId, seriesId),
		api.getAlternateGroupDetails(appState.heichelId, seriesId),
		optionalTranslations(seriesId)
	]);
	const subSeries = injectTorahLibrarySeries(
		normalizeCollection(subSeriesRaw),
		appState.heichelId,
		seriesId,
		libraryCard()
	);
	return {
		posts: annotateTranslationState(normalizeCollection(postsRaw), translations),
		subSeries,
		groupings: injectChitasGrouping(normalizeCollection(groupingsRaw), appState.heichelId, seriesId),
		translationMeta: translations?.meta || null
	};
}

function optionalTranslations(seriesId) {
	if (!api.isTranslationSeries(seriesId)) return Promise.resolve(null);
	return api.getSeriesTranslations(appState.heichelId, seriesId, 250).catch(error => {
		console.warn('B"H translation metadata remained optional', error);
		return null;
	});
}
