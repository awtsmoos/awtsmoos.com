// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SovereignNavigator
 * @description
 * The Awtsmoos creates route, content, and reader intention in one present;
 * Awtsmoos.com changes a view only when cards, context, and the eighth mobile generation arrive together and pleasant.
 */

import { appState } from './state.js';
import * as api from '../api.js';
import * as ui from './ui.js?v=heichel-mobile-008';
import { loadContent } from './navigator/loader.js?v=heichel-mobile-008';
import { handleDelete, handleShare } from './navigator/actions.js';
import { LivingPathController } from './living-path/controller.js?v=heichel-mobile-008';
import {
	normalizeBrowserRoute,
	normalizeView,
	readInitialRoute,
	routeFor
} from './navigator/route-policy.js';

export class HeichelNavigator {
	constructor(heichelId) {
		appState.heichelId = heichelId;
		this.currentView = 'posts';
		this.ownershipPromise = null;
		this.livingPath = new LivingPathController(this);
		this.livingPath.prepare();
	}

	async initialize() {
		window.curAlias = window.curAlias || 'seeker';
		setBootStage('heichel-details');
		appState.heichelData = await api.getHeichelDetails(appState.heichelId);
		if (!appState.heichelData) throw new Error('This Heichel is unavailable or could not be read.');
		appState.heichelData.id = appState.heichelId;
		this.beginOwnershipCheck();
		ui.updateHeichelHeader(appState.heichelData);
		this.livingPath.connect();
		const route = readInitialRoute();
		this.currentView = route.view;
		appState.currentView = route.view;
		if (route.needsNormalization) normalizeBrowserRoute(route.seriesId, route.view);
		setBootStage('content');
		await this.loadContent(route.seriesId);
		setBootStage('ready');
	}

	beginOwnershipCheck() {
		this.ownershipPromise = api.checkOwnership(window.curAlias, appState.heichelId)
			.then(async ownsIt => {
				if (!ownsIt || appState.ownsIt) return false;
				appState.ownsIt = true;
				await this.loadContent(appState.currentSeries || 'root');
				return true;
			})
			.catch(error => {
				console.warn('B"H — Ownership remains safely in visitor mode.', error);
				return false;
			});
	}

	loadContent(seriesId) { return loadContent(this, seriesId); }

	async navigateTo(seriesId) {
		const url = routeFor(seriesId, this.currentView);
		history.pushState({ path: url }, '', url);
		await this.loadContent(seriesId);
	}

	switchView(newView, force = false, render = true) {
		const next = normalizeView(newView);
		if (!force && this.currentView === next) return;
		this.currentView = next;
		appState.currentView = next;
		ui.updateActiveTab(next);
		if (render) {
			this.livingPath.filters.renderCommitted();
			this.livingPath.afterViewChange();
		}
		this.updateURL();
	}

	updateURL() {
		const url = routeFor(appState.currentSeries, this.currentView);
		history.replaceState({ path: url }, '', url);
	}

	deleteSingleItem(item) { return handleDelete(this, item); }
	clearSingleItem(item) { return handleDelete(this, item, true); }
	handleShareClick(item) { return handleShare(item); }
	afterContentLoaded(content) { return this.livingPath.afterLoad(content); }
	filterContent(query) { this.livingPath.queryChanged(query); }
	clearSearch() { this.livingPath.clearSearch(); }
	changeSearchScope(value) { this.livingPath.scopeChanged(value); }
	openFilterSheet() { this.livingPath.openFilters(); }
	closeFilterSheet() { this.livingPath.closeFilters(); }
	previewFilters() { this.livingPath.previewFilters(); }
	applyFilters() { this.livingPath.applyFilters(); }
	resetFilters() { this.livingPath.resetFilters(); }
	goParent() { this.livingPath.goParent(); }
	togglePathDetails() { this.livingPath.togglePathDetails(); }
	profileDisclosureChanged(event) { this.livingPath.profileDisclosureChanged(event); }
	toggleHeichelFollow() { return this.livingPath.toggleHeichelFollow(); }
	toggleCurrentSeriesFollow() { return this.livingPath.toggleCurrentSeriesFollow(); }
	openHeichelMenu() { this.livingPath.openHeichelMenu(); }
}

function setBootStage(stage) {
	if (window.__awtsmoosHeichelBoot) window.__awtsmoosHeichelBoot.stage = stage;
}
