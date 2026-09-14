// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SovereignUIArchitect
 * @description
 * The Awtsmoos creates one interface from blueprint, state, and explicit action vessels without cramped intention;
 * Awtsmoos.com carries the tenth cache generation through bilingual source renderers so fresh identity reaches manifestation.
 */

import { ScribeOfManifestation } from '../engine/scribe-of-manifestation.js';
import { clearRegistry } from '../dom.js';
import { getFullLayoutBlueprint } from './blueprints/main-layout.js';
import { createActions } from './render-actions.js?v=heichel-mobile-010';
import {
	activateDistrict,
	renderHeichelWorldState as paintHeichelWorldState
} from './heichel-os/world-panel.js';

export { notify } from './render/toast.js';
export {
	renderBreadcrumb,
	updateHeichelHeader
} from './render/header.js?v=heichel-mobile-010';
export { renderContentGrids } from './render/grids.js?v=heichel-mobile-010';
export {
	hideLoading,
	renderSeriesInfo,
	showLoading,
	updateActiveTab
} from './render-state.js?v=heichel-mobile-010';
export { activateDistrict };

export function manifestWorld(navigator, mountPoint = document.body) {
	clearRegistry();
	const rootVessel = ScribeOfManifestation.speakElement(
		getFullLayoutBlueprint(createActions(navigator))
	);
	const target = mountPoint.querySelector('.main')
		|| mountPoint;
	const fallback = target.querySelector('[data-heichel-semantic-fallback]');
	if (!fallback) {
		target.replaceChildren(rootVessel);
		return rootVessel;
	}
	rootVessel.hidden = true;
	rootVessel.inert = true;
	rootVessel.setAttribute('aria-hidden', 'true');
	rootVessel.dataset.heichelClientShell = 'loading';
	target.append(rootVessel);
	return rootVessel;
}

/** Reveals hydrated interaction only after required Heichel data is trustworthy. */
export function revealManifestedWorld(mountPoint = document) {
	const fallback = mountPoint.querySelector('[data-heichel-semantic-fallback]');
	const rootVessel = mountPoint.querySelector('[data-heichel-client-shell]');
	if (!rootVessel) return;
	if (fallback) {
		fallback.hidden = true;
		fallback.inert = true;
		fallback.setAttribute('aria-hidden', 'true');
	}
	rootVessel.hidden = false;
	rootVessel.inert = false;
	rootVessel.setAttribute('aria-hidden', 'false');
	rootVessel.dataset.heichelClientShell = 'ready';
}

export function renderHeichelWorldState(state) {
	paintHeichelWorldState(state);
}
