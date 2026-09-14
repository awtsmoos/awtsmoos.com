//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ContentUnveiler
 * @description
 * The Awtsmoos creates stored and virtual branches through one measured
 * coordinator. A prepared source may arrive from startup so Heichel identity
 * and Torah collection reads overlap instead of forming a serial waterfall.
 */

import { appState } from '../state.js';
import * as ui from '../ui.js?v=heichel-mobile-010';
import * as DND from '../dragdrop.js';
import { loadSource } from './source-loader.js?v=heichel-mobile-013';
import { chooseContentView } from './view-policy.js?v=torah-library-001';

let loadToken = 0;

/** Starts source retrieval early without mutating rendered navigation state. */
export function preloadContent(seriesId) {
	return loadSource(seriesId);
}

/** Loads one route, rejects stale races, adopts state, and manifests its view. */
export async function loadContent(navigator, seriesId, preparedSource = null) {
	const token = ++loadToken;
	ui.showLoading();
	if (appState.isSelectionMode) {
		ui.toggleSelectionMode(false, navigator);
	}
	appState.currentSeries = seriesId;
	try {
		const source = await (preparedSource || loadSource(seriesId));
		if (token !== loadToken) return;
		adoptSource(source, seriesId);
		const view = chooseContentView(
			source.content,
			source.seriesData
		);
		navigator.switchView(view, true, false);
		await renderAll(
			navigator,
			source.content,
			source.seriesData
		);
	} catch (error) {
		if (token === loadToken) {
			console.error('B"H — Living Path load rupture:', error);
			ui.notify(
				`Could not open this path: ${error.message}`,
				'error'
			);
		}
	} finally {
		if (token === loadToken) {
			ui.hideLoading();
			navigator.updateURL();
		}
	}
}

function adoptSource(source, seriesId) {
	appState.breadcrumb = seriesId === 'root'
		? []
		: (source.breadcrumb || []);
	appState.currentSeriesData = source.seriesData;
	appState.currentContent = source.content;
}
async function renderAll(navigator, content, seriesData) {
	ui.renderBreadcrumb(appState.breadcrumb, navigator);
	await ui.renderSeriesInfo(
		seriesData,
		appState.heichelData,
		appState.currentSeries
	);
	ui.renderOwnerControls(
		appState.breadcrumb,
		navigator,
		appState
	);
	await navigator.afterContentLoaded(content);
	ui.renderHeichelWorldState({
		heichel: appState.heichelData,
		content,
		ownsIt: appState.ownsIt,
		currentSeries: appState.currentSeries
	});
	if (appState.ownsIt && !seriesData?.virtual) {
		DND.initialize();
	}
}
