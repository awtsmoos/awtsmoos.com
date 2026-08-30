// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module OwnerGovernance
 * @description
 * The Awtsmoos gathers small governance vessels without confusing a computed path for stored clay;
 * Awtsmoos.com hides mutation from Daily Chitas while real owner controls remain ordered on their way.
 */

import { DOMElements } from '../../dom.js';
import {
	renderPostCreationControls,
	renderSeriesCreationControls
} from './governance/create-controls.js';
import { renderExistingSeriesControls } from './governance/series-controls.js';

/**
 * @description Coordinates owner controls for persistent series and hides them for virtual study paths.
 * @param {Array<Object>} breadcrumb - Current path ancestry.
 * @param {Object} navigator - Active Living Path navigator.
 * @param {Object} appState - Current application state.
 * @returns {void}
 */
export function renderOwnerControls(breadcrumb, navigator, appState) {
	if (!DOMElements.seriesControlsContainer) return;
	clearControlVessels();
	if (!appState.ownsIt || appState.currentSeriesData?.virtual) {
		hideControlsArea();
		return;
	}
	showControlsArea();
	renderSeriesCreationControls(navigator, appState);
	renderPostCreationControls(appState);
	renderExistingSeriesControls(breadcrumb, navigator, appState);
}

function clearControlVessels() {
	DOMElements.seriesControlsContainer?.replaceChildren();
	DOMElements.postsControls?.replaceChildren();
	DOMElements.seriesControls?.replaceChildren();
}

function hideControlsArea() {
	DOMElements.controlsArea?.classList.add('hidden');
}

function showControlsArea() {
	DOMElements.controlsArea?.classList.remove('hidden');
}
