// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NavigatorSourceLoader
 * @description
 * The Awtsmoos lets persisted Torah, Chitas, source-backed leaves, and language tools share one navigation breath;
 * Awtsmoos.com keeps source works inside Torah's real parents while translation tools remain a separate utility path.
 */

import { appState } from '../state.js';
import * as api from '../api.js';
import { isChitasSeries } from '../chitas/constants.js?v=native-chitas-003';
import {
	injectChitasGrouping,
	loadChitasVirtualSeries
} from '../chitas/virtual-series.js?v=native-chitas-003';
import { annotateTranslationState } from '../living-path/translation-context.js';
import { isTorahLibrarySeries } from '../torahLibraryIds.js?v=torah-tree-005';
import { injectTorahSourceBranches } from '../torahSourceInjection.js?v=torah-tree-005';
import { loadTorahLibraryVirtualSeries } from '../torahLibraryVirtualSeries.js?v=torah-tree-005';
import {
	injectTranslationHub,
	isTranslationHubSeries
} from '../translationHubIds.js?v=language-tools-002';
import { translationHubCard } from '../translationHubPresentation.js?v=language-tools-002';
import { loadTranslationHubVirtualSeries } from '../translationHubVirtualSeries.js?v=language-tools-002';
import { normalizeCollection } from './content-normalizer.js';

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
	const sourceIntegrated = injectTorahSourceBranches(
		series,
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
		optionalTranslations(seriesId)
	]);
	return {
		posts: annotateTranslationState(
			normalizeCollection(postsRaw),
			translations
		),
		subSeries: augmentSubSeries(
			normalizeCollection(subSeriesRaw),
			seriesId
		),
		groupings: injectChitasGrouping(
			normalizeCollection(groupingsRaw),
			appState.heichelId,
			seriesId
		),
		translationMeta: translations?.meta || null
	};
}

function optionalTranslations(seriesId) {
	if (!api.isTranslationSeries(seriesId)) {
		return Promise.resolve(null);
	}
	return api.getSeriesTranslations(
		appState.heichelId,
		seriesId,
		250
	).catch(error => {
		console.warn(
			'B"H translation metadata remained optional',
			error
		);
		return null;
	});
}
