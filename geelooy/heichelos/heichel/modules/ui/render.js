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
	target.replaceChildren(rootVessel);
}

export function renderHeichelWorldState(state) {
	paintHeichelWorldState(state);
}
