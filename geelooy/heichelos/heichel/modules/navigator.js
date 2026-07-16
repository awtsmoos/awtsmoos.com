// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SovereignNavigator
 * @description The Awtsmoos lets content appear before a slow permission oracle returns, then reveals owner controls only when real ownership is confirmed.
 */
import { appState } from './state.js';
import * as api from '../api.js';
import * as ui from './ui.js';
import { loadContent } from './navigator/loader.js';
import { handleDelete, handleShare } from './navigator/actions.js';
import { filterLoadedContent } from './ui/searchFilter.js';

export class HeichelNavigator {
	constructor(heichelId) {
		appState.heichelId = heichelId;
		this.currentView = 'posts';
		this.ownershipPromise = null;
	}

	async initialize() {
		window.curAlias = window.curAlias || 'seeker';
		setBootStage('heichel-details');
		appState.heichelData = await api.getHeichelDetails(appState.heichelId);
		if (!appState.heichelData) {
			throw new Error('This Heichel is unavailable or could not be read.');
		}
		appState.heichelData.id = appState.heichelId;
		this.beginOwnershipCheck();
		setBootStage('header');
		ui.updateHeichelHeader(appState.heichelData);
		const route = readInitialRoute();
		this.currentView = route.view;
		if (route.needsNormalization) {
			normalizeBrowserRoute(route.seriesId, route.view);
		}
		setBootStage('content');
		await this.loadContent(route.seriesId);
		setBootStage('ready');
	}

	beginOwnershipCheck() {
		setBootStage('ownership-background');
		this.ownershipPromise = api.checkOwnership(window.curAlias, appState.heichelId)
			.then(async ownsIt => {
				if (!ownsIt || appState.ownsIt) return false;
				appState.ownsIt = true;
				await this.loadContent(appState.currentSeries || 'root');
				return true;
			})
			.catch(error => {
				console.warn('B"H — Ownership could not be confirmed; the Heichel remains safely in visitor mode.', error);
				return false;
			});
	}

	async loadContent(seriesId) {
		return loadContent(this, seriesId);
	}

	async navigateTo(seriesId) {
		const url = `${baseHeichelPath()}/series/${encodeURIComponent(seriesId)}?view=${encodeURIComponent(this.currentView)}`;
		window.history.pushState({ path: url }, '', url);
		await this.loadContent(seriesId);
	}

	switchView(newView, force = false) {
		if (!force && this.currentView === newView) return;
		this.currentView = normalizeView(newView);
		ui.updateActiveTab(this.currentView);
		this.updateURL();
	}

	updateURL() {
		const seriesPath = appState.currentSeries && appState.currentSeries !== 'root'
			? `/series/${encodeURIComponent(appState.currentSeries)}`
			: '';
		const url = `${baseHeichelPath()}${seriesPath}?view=${encodeURIComponent(this.currentView)}`;
		window.history.replaceState({ path: url }, '', url);
	}

	deleteSingleItem(item) {
		return handleDelete(this, item);
	}

	clearSingleItem(item) {
		return handleDelete(this, item, true);
	}

	handleShareClick(item) {
		return handleShare(item);
	}

	filterContent(query) {
		const content = appState.currentContent || { posts: [], subSeries: [], groupings: [] };
		ui.renderContentGrids(filterLoadedContent(content, query), this, appState);
	}
}

function setBootStage(stage) {
	if (window.__awtsmoosHeichelBoot) window.__awtsmoosHeichelBoot.stage = stage;
}

function readInitialRoute() {
	const params = new URLSearchParams(window.location.search);
	const path = seriesFromPath();
	return {
		view: normalizeView(params.get('view') || 'posts'),
		seriesId: params.get('series') || path.seriesId || 'root',
		needsNormalization: path.needsNormalization
	};
}

function normalizeView(view) {
	return ['series', 'groupings'].includes(view) ? view : 'posts';
}

function seriesFromPath() {
	const segments = window.location.pathname.split('/').filter(Boolean);
	const index = segments.indexOf('series');
	if (index === -1 || !segments[index + 1]) return { seriesId: null, needsNormalization: false };
	const seriesId = decodeURIComponent(segments[index + 1]);
	const invalidRootChild = seriesId === 'root' && segments.slice(index + 2).filter(Boolean).length > 0;
	return { seriesId: invalidRootChild ? 'root' : seriesId, needsNormalization: invalidRootChild };
}

function normalizeBrowserRoute(seriesId, view) {
	const path = seriesId === 'root' ? baseHeichelPath() : `${baseHeichelPath()}/series/${encodeURIComponent(seriesId)}`;
	window.history.replaceState({ path }, '', `${path}?view=${encodeURIComponent(view)}`);
}

function baseHeichelPath() {
	return `/heichelos/${encodeURIComponent(appState.heichelId)}`;
}
