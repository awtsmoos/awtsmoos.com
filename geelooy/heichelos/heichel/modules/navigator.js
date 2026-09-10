//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SovereignNavigator
 * @description
 * The Awtsmoos creates route, identity, and Torah source in one present.
 * Heichel metadata and route content now begin concurrently so cold startup
 * cannot waste a full network waterfall before the learner sees Torah.
 */

import { appState } from './state.js';
import * as api from '../api.js';
import * as ui from './ui.js?v=heichel-mobile-010';
import {
	loadContent,
	preloadContent
} from './navigator/loader.js?v=heichel-mobile-013';
import { NavigatorInteractionDelegate } from './navigator/interaction-delegate.js?v=heichel-mobile-010';
import { beginOwnershipCheck } from './navigator/ownership-loader.js?v=heichel-mobile-010';
import { LivingPathController } from './living-path/controller.js?v=heichel-mobile-012';
import {
	normalizeBrowserRoute,
	normalizeView,
	readInitialRoute,
	routeFor
} from './navigator/route-policy.js';

export class HeichelNavigator extends NavigatorInteractionDelegate {
	constructor(heichelId) {
		super();
		appState.heichelId = heichelId;
		this.currentView = 'posts';
		this.ownershipPromise = null;
		this.livingPath = new LivingPathController(this);
		this.livingPath.prepare();
	}
	async initialize() {
		window.curAlias = window.curAlias || 'seeker';
		const route = readInitialRoute();
		this.currentView = route.view;
		appState.currentView = route.view;
		if (route.needsNormalization) {
			normalizeBrowserRoute(route.seriesId, route.view);
		}
		setBootStage('bootstrap-data');
		const heichelPromise = api.getHeichelDetails(appState.heichelId);
		const sourcePromise = preloadContent(route.seriesId);
		const [heichelData, source] = await Promise.all([
			heichelPromise,
			sourcePromise
		]);
		if (!heichelData) {
			throw new Error('This Heichel is unavailable or could not be read.');
		}
		appState.heichelData = heichelData;
		appState.heichelData.id = appState.heichelId;
		ui.updateHeichelHeader(appState.heichelData);
		this.livingPath.connect();
		setBootStage('content');
		await this.loadContent(route.seriesId, source);
		this.ownershipPromise = beginOwnershipCheck(this);
		setBootStage('ready');
	}

	loadContent(seriesId, preparedSource = null) {
		return loadContent(this, seriesId, preparedSource);
	}

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
}

function setBootStage(stage) {
	if (window.__awtsmoosHeichelBoot) {
		window.__awtsmoosHeichelBoot.stage = stage;
	}
}
