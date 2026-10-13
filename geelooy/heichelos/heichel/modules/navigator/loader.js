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
		if (token !== loadToken) return;
		console.error('B"H — Living Path load rupture:', error);
		// B"H — Yaakov 2026-10-13: never leave a blank page.
		// Render a truthful error card with retry, not just a toast.
		renderLoadError(navigator, seriesId, error);
		ui.notify(
			`Could not open this path: ${error.message}`,
			'error'
		);
	} finally {
		if (token === loadToken) {
			ui.hideLoading();
			navigator.updateURL();
		}
	}
}

/**
 * B"H — Renders a truthful error state when content fails to load.
 * The user sees what happened and gets a retry button — never a blank page.
 */
function renderLoadError(navigator, seriesId, error) {
	const container = document.querySelector('[data-heichel-render-root]')
		|| document.querySelector('.main')
		|| document.body;
	// Clear stale loading/content so the error is the only message.
	const lists = container.querySelectorAll('[data-posts-list], [data-series-list], [data-groupings-list]');
	lists.forEach(list => { list.replaceChildren(); });

	let errorCard = container.querySelector('[data-load-error]');
	if (!errorCard) {
		errorCard = document.createElement('div');
		errorCard.setAttribute('data-load-error', 'true');
		errorCard.className = 'heichel-load-error';
		errorCard.setAttribute('role', 'alert');
		container.prepend(errorCard);
	}
	const safeMsg = String(error?.message || 'Unknown error').replace(/[<>&"]/g, '');
	errorCard.innerHTML = '';
	const title = document.createElement('h2');
	title.textContent = 'This section could not load';
	const msg = document.createElement('p');
	msg.textContent = safeMsg;
	const retry = document.createElement('button');
	retry.type = 'button';
	retry.className = 'p-button p-button-primary';
	retry.textContent = 'Try again';
	retry.addEventListener('click', () => {
		errorCard.remove();
		navigator.loadContent(seriesId);
	});
	const back = document.createElement('a');
	back.className = 'p-button';
	back.href = '/heichelos/ikar/';
	back.textContent = 'Back to Torah Library';
	errorCard.append(title, msg, retry, back);
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
