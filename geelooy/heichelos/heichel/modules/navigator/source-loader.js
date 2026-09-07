// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NavigatorSourceLoader
 * @description
 * The Awtsmoos lets persisted Torah, native Chitas, source-backed leaves, and language tools share one truthful navigation breath;
 * Awtsmoos.com reveals virtual children before presentation, while the eleventh browser-fix vessel carries optional translation light.
 */

import { appState } from '../state.js';
import * as api from '../api.js';
import { isChitasSeries } from '../chitas/constants.js?v=native-chitas-003';
import {
	injectChitasGrouping,
	loadChitasVirtualSeries
} from '../chitas/virtual-series.js?v=native-chitas-003';
import { annotateTranslationState } from '../living-path/translation-context.js';
import { annotateTorahHostSummaries } from '../torahHostSummary.js?v=torah-tree-006';
import { isTorahLibrarySeries } from '../torahLibraryIds.js?v=torah-tree-006';
import { injectTorahSourceBranches } from '../torahSourceInjection.js?v=torah-tree-006';
import { loadTorahLibraryVirtualSeries } from '../torahLibraryVirtualSeries.js?v=torah-tree-006';
import {
	injectTranslationHub,
	isTranslationHubSeries
} from '../translationHubIds.js?v=language-tools-003';
import { translationHubCard } from '../translationHubPresentation.js?v=language-tools-003';
import { loadTranslationHubVirtualSeries } from '../translationHubVirtualSeries.js?v=language-tools-003';
import { normalizeCollection } from './content-normalizer.js';
import { loadOptionalTranslations } from './translation-loader.js?v=heichel-mobile-011';

/**
 * Loads the exact source vessel for a persisted or virtual series identity.
 * @param {string} seriesId Stable series or virtual Torah identity.
 * @returns {Promise<object>} Breadcrumb, series data, and normalized content.
 */
export async function loadSource(seriesId) {
	if (isChitasSeries(seriesId)) {
		return loadChitasVirtualSeries();
	}
	if (isTorahLibrarySeries(seriesId)) {
		return loadTorahLibraryVirtualSeries(seriesId);
	}
	if (isTranslationHubSeries(seriesId)) {
		return loadTranslationHubVirtualSeries();
	}
	const [breadcrumb, seriesData] = await loadIdentity(seriesId);
	return {
		breadcrumb,
		seriesData,
		content: await loadCollections(seriesId)
	};
}

async function loadIdentity(seriesId) {
	const [breadcrumb, seriesData] = await Promise.all([
		api.getBreadcrumb(appState.heichelId, seriesId),
		api.getSeriesDetails(appState.heichelId, seriesId)
	]);
	if (!seriesData) {
		throw new Error(`The series “${seriesId}” is unavailable.`);
	}
	return [breadcrumb, seriesData];
}

function augmentSubSeries(series, seriesId) {
	const truthfulHosts = annotateTorahHostSummaries(
		series,
		appState.heichelId
	);
	const sourceIntegrated = injectTorahSourceBranches(
		truthfulHosts,
		appState.heichelId,
		seriesId
	);
	return injectTranslationHub(
		sourceIntegrated,
		appState.heichelId,
		seriesId,
		translationHubCard()
	);
}

async function loadCollections(seriesId) {
	const [postsRaw, subSeriesRaw, groupingsRaw, translations] = await Promise.all([
		api.getPostDetails(appState.heichelId, seriesId),
		api.getSubSeriesDetails(appState.heichelId, seriesId),
		api.getAlternateGroupDetails(appState.heichelId, seriesId),
		loadOptionalTranslations(appState.heichelId, seriesId)
	]);
	const posts = annotateTranslationState(
		normalizeCollection(postsRaw),
		translations
	);
	const subSeries = augmentSubSeries(
		normalizeCollection(subSeriesRaw),
		seriesId
	);
	const groupings = injectChitasGrouping(
		normalizeCollection(groupingsRaw),
		appState.heichelId,
		seriesId
	);
	return {
		posts,
		subSeries,
		groupings,
		translationMeta: translations?.meta || null
	};
}
