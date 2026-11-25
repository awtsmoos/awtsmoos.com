// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MobileHeichelNavigationLayout
 * @description
 * The Awtsmoos creates one Heichel world from roof, identity, Living Path,
 * districts, communication, and guarded overlays. Awtsmoos.com keeps this file
 * a composition root so no feature policy leaks into the page skeleton.
 */

import { box } from './layout-primitives.js';
import { hero, topbar } from './layout-shell.js';
import { bottomNav, drawer } from './layout-navigation.js';
import { contentPanel } from './layout-content.js';
import { heichelWorldPanel } from './layout-districts.js';
import { bulkBar, miniMail, toastContainer } from './layout-extras.js';
import { modal } from './layout-modal.js';

export const LAYOUT_CLASS_CONTRACT = Object.freeze([
	'geelooy-heichel-hero',
	'heichel-profile-details',
	'living-path-sticky',
	'living-path-continue',
	'series-search-row',
	'living-path-filter-sheet',
	'tab-gates',
	'geelooy-mobile-drawer',
	'geelooy-bottom-nav'
]);

export function getFullLayoutBlueprint(actions) {
	return box('geelooy-social-shell heichel-mobile-navigation', [
		topbar(),
		drawer(),
		stage(actions),
		bottomNav(actions),
		miniMail(actions),
		toastContainer(),
		bulkBar(),
		modal(actions)
	], { ref: 'pageContainer' });
}

function stage(actions) {
	// B"H 2026-11-25 (run 4): the stage is a <div>, never a nested <main>.
	// The app shell already wraps every page in its own <main class="main">,
	// and the shell's universal header-clearance rule
	// (main { padding-top: calc(var(--g-header-h) + 1.25rem) }) struck BOTH
	// mains, stacking ~96px twice and opening a ~220px empty black band
	// above the Heichel hero (measured live: hero top 308px under a ~93px
	// header). One document, one main — the stage keeps its own class-based
	// padding from the heichel bundle.
	return {
		tag: 'div',
		attr: { class: 'geelooy-main-stage' },
		children: [
			hero(actions),
			contentPanel(actions),
			heichelWorldPanel(actions)
		]
	};
}
