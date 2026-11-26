//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module NavigatorSourceLoader
 * @description
 * The Awtsmoos lets persisted Torah, native Chitas, source-backed leaves, and language tools share one truthful navigation breath;
 * Awtsmoos.com keeps public presentation clean while storage identity and parallel loading remain untouched beneath the tree.
 */

import { appState } from '../state.js';
import * as api from '../api.js';
import { isChitasSeries } from '../chitas/constants.js?v=native-chitas-003';
import { injectChitasGrouping, loadChitasVirtualSeries } from '../chitas/virtual-series.js?v=native-chitas-004';
import { annotateTranslationState } from '../living-path/translation-context.js';
import { annotateTorahHostSummaries } from '../torahHostSummary.js?v=torah-tree-006';
import { isTorahLibrarySeries } from '../torahLibraryIds.js?v=torah-tree-006';
import { injectTorahSourceBranches } from '../torahSourceInjection.js?v=torah-tree-006';
import { loadTorahLibraryVirtualSeries } from '../torahLibraryVirtualSeries.js?v=torah-tree-006';
import { publicTorahSeriesItems } from '../torahSeriesPresentationPolicy.js?v=torah-series-policy-001';
import { injectTranslationHub, isTranslationHubSeries } from '../translationHubIds.js?v=language-tools-003';
import { translationHubCard } from '../translationHubPresentation.js?v=language-tools-003';
import { loadTranslationHubVirtualSeries } from '../translationHubVirtualSeries.js?v=language-tools-003';
import { normalizeCollection } from './content-normalizer.js';
import { loadOptionalTranslations } from './translation-loader.js?v=heichel-mobile-011';

/** Loads the exact source vessel for a persisted or virtual series identity. */
export async function loadSource(seriesId) {
	if (isChitasSeries(seriesId)) return loadChitasVirtualSeries();
	if (isTorahLibrarySeries(seriesId)) return loadTorahLibraryVirtualSeries(seriesId);
	if (isTranslationHubSeries(seriesId)) return loadTranslationHubVirtualSeries();
	const [identity, content] = await Promise.all([
		loadIdentity(seriesId),
		loadCollections(seriesId)
	]);
	return { breadcrumb: identity.breadcrumb, seriesData: identity.seriesData, content };
}

async function loadIdentity(seriesId) {
	const [breadcrumb, seriesData] = await Promise.all([
		api.getBreadcrumb(appState.heichelId, seriesId),
		api.getSeriesDetails(appState.heichelId, seriesId)
	]);
	if (!seriesData) throw new Error(`The series “${seriesId}” is unavailable.`);
	return { breadcrumb, seriesData };
}

function augmentSubSeries(series, seriesId) {
	const publicSeries = publicTorahSeriesItems(series, seriesId);
	const truthfulHosts = annotateTorahHostSummaries(publicSeries, appState.heichelId);
	const sourceIntegrated = injectTorahSourceBranches(truthfulHosts, appState.heichelId, seriesId);
	return injectTranslationHub(
		sourceIntegrated,
		appState.heichelId,
		seriesId,
		translationHubCard()
	);
}

/** Loads independent persisted collections in one bounded parallel wave. */
async function loadCollections(seriesId) {
	const [postsRaw, subSeriesRaw, groupingsRaw, translations] = await Promise.all([
		api.getPostDetails(appState.heichelId, seriesId),
		api.getSubSeriesDetails(appState.heichelId, seriesId),
		api.getAlternateGroupDetails(appState.heichelId, seriesId),
		loadOptionalTranslations(appState.heichelId, seriesId)
	]);
	// B"H 2026-11-20 (ikar series load fix): the fetcher returns null on
	// transport failure (e.g. a shed 503). Treating that as an empty list
	// painted a silent void under the hero; a failed post list is a load
	// failure, so the loader's truthful error card + retry takes over.
	if (postsRaw === null || postsRaw === undefined) {
		throw new Error('The post list could not be loaded -- the server is busy. Please try again in a moment.');
	}
	// B"H 2026-11-26 (Revelation fix): a failed sub-series read is the same
	// load failure. Silently treating it as [] painted "0 series" in the
	// header and a false "Nothing has been published here yet" card over a
	// Heichel whose series visibly hold posts (Ohr HaNiggun on Hai's phone).
	if (subSeriesRaw === null || subSeriesRaw === undefined) {
		throw new Error('The series list could not be loaded -- the server is busy. Please try again in a moment.');
	}
	const posts = annotateTranslationState(normalizeCollection(postsRaw), translations);
	const subSeries = augmentSubSeries(normalizeCollection(subSeriesRaw), seriesId);
	const groupings = injectChitasGrouping(
		normalizeCollection(groupingsRaw),
		appState.heichelId,
		seriesId
	);
	return {
		posts,
		subSeries,
		groupings,
		translationMeta: translations?.meta || null,
		totals: heichelTotals(seriesId, posts, subSeries)
	};
}

/**
 * B"H 2026-11-25 (Project Revelation run 4): at the Heichel root the header
 * describes the whole Heichel, not only the root folder. A Heichel whose
 * posts live inside its series showed "0 teachings" in the hero while its
 * series visibly held published posts (proven live on Ohr HaNiggun: root
 * details [], its one series postsCount 1). Totals therefore add the root
 * posts to each top-level series' own post count (postsCount from the
 * series record, falling back to its loaded posts list). Non-root views
 * keep their own series counts, so totals stay null there.
 */
function heichelTotals(seriesId, posts, subSeries) {
	if (seriesId !== 'root') return null;
	const nested = subSeries.reduce((sum, entry) => {
		const counted = Number.isFinite(entry?.postsCount)
			? entry.postsCount
			: (entry?.posts?.length || 0);
		return sum + counted;
	}, 0);
	return { teachings: posts.length + nested, series: subSeries.length };
}
