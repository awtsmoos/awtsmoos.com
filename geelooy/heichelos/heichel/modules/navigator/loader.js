// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ContentUnveiler
 * @description
 * The Awtsmoos creates breadcrumb, branch record, teachings, children, and
 * groupings together. Awtsmoos.com loads them with stale-response protection,
 * then manifests one selected view through the Living Path coordinator.
 */

import { appState } from '../state.js';
import * as api from '../api.js';
import * as ui from '../ui.js';
import * as DND from '../dragdrop.js';
import { normalizeCollection } from './content-normalizer.js';
import { annotateTranslationState } from '../living-path/translation-context.js';

let loadToken = 0;

export async function loadContent(navigator, seriesId) {
	const token = ++loadToken;
	ui.showLoading();
	if (appState.isSelectionMode) ui.toggleSelectionMode(false, navigator);
	appState.currentSeries = seriesId;
	try {
		const [breadcrumb, seriesData] = await loadIdentity(seriesId);
		if (token !== loadToken) return;
		appState.breadcrumb = seriesId === 'root' ? [] : (breadcrumb || []);
		appState.currentSeriesData = seriesData;
		const content = await loadCollections(seriesId);
		if (token !== loadToken) return;
		appState.currentContent = content;
		const view = chooseView(content);
		navigator.switchView(view, true, false);
		await renderAll(navigator, content, seriesData);
	} catch (error) {
		if (token === loadToken) {
			console.error('B"H — Living Path load rupture:', error);
			ui.notify(`Could not open this path: ${error.message}`, 'error');
		}
	} finally {
		if (token === loadToken) {
			ui.hideLoading();
			navigator.updateURL();
		}
	}
}

async function loadIdentity(seriesId) {
	const [breadcrumb, seriesData] = await Promise.all([
		api.getBreadcrumb(appState.heichelId, seriesId),
		api.getSeriesDetails(appState.heichelId, seriesId)
	]);
	if (!seriesData) throw new Error(`The series “${seriesId}” is unavailable.`);
	return [breadcrumb, seriesData];
}

function optionalTranslations(seriesId) {
	if (!api.isTranslationSeries(seriesId)) return Promise.resolve(null);
	return api.getSeriesTranslations(appState.heichelId, seriesId, 250).catch(error => {
		console.warn('B"H translation metadata remained optional', error);
		return null;
	});
}

async function loadCollections(seriesId) {
	const [postsRaw, subSeries, groupings, translations] = await Promise.all([
		api.getPostDetails(appState.heichelId, seriesId),
		api.getSubSeriesDetails(appState.heichelId, seriesId),
		api.getAlternateGroupDetails(appState.heichelId, seriesId),
		optionalTranslations(seriesId)
	]);
	const posts = annotateTranslationState(normalizeCollection(postsRaw), translations);
	return {
		posts,
		subSeries: normalizeCollection(subSeries),
		groupings: normalizeCollection(groupings),
		translationMeta: translations?.meta || null
	};
}

async function renderAll(navigator, content, seriesData) {
	ui.renderBreadcrumb(appState.breadcrumb, navigator);
	await ui.renderSeriesInfo(seriesData, appState.heichelData, appState.currentSeries);
	ui.renderOwnerControls(appState.breadcrumb, navigator);
	await navigator.afterContentLoaded(content);
	ui.renderHeichelWorldState({
		heichel: appState.heichelData,
		content,
		ownsIt: appState.ownsIt,
		currentSeries: appState.currentSeries
	});
	if (appState.ownsIt) DND.initialize();
}

function chooseView(content) {
	const explicit = new URLSearchParams(location.search).get('view');
	if (['posts', 'series', 'groupings'].includes(explicit)) return explicit;
	if (content.posts.length) return 'posts';
	if (content.subSeries.length) return 'series';
	if (content.groupings.length) return 'groupings';
	return 'posts';
}
