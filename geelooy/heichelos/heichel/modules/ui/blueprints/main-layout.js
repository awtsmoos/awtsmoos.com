// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MobileHeichelNavigationLayout
 * @description
 * One readable entry composes shell, navigation, content, districts, and modal.
 */

import { box } from './layout-primitives.js';
import {
	hero,
	topbar
} from './layout-shell.js';
import {
	bottomNav,
	drawer
} from './layout-navigation.js';
import { contentPanel } from './layout-content.js';
import { heichelWorldPanel } from './layout-districts.js';
import {
	bulkBar,
	miniMail,
	toastContainer
} from './layout-extras.js';
import { modal } from './layout-modal.js';

export const LAYOUT_CLASS_CONTRACT = Object.freeze([
	'geelooy-heichel-hero',
	'hero-stats',
	'series-search-row',
	'tab-gates',
	'geelooy-mobile-drawer',
	'geelooy-bottom-nav'
]);

export function getFullLayoutBlueprint(actions) {
	const filterRegistry = filterButtonRegistry(actions);
	return box(
		'geelooy-social-shell heichel-mobile-navigation',
		[
			topbar(),
			drawer(),
			stage(actions, filterRegistry.ref),
			bottomNav(actions),
			miniMail(actions),
			toastContainer(),
			bulkBar(),
			modal(actions)
		],
		{ ref: 'pageContainer' }
	);
}

function stage(actions, filterButtonRef) {
	return {
		tag: 'main',
		attr: { class: 'geelooy-main-stage' },
		children: [
			hero(),
			contentPanel(actions, filterButtonRef),
			heichelWorldPanel(actions)
		]
	};
}

function filterButtonRegistry(actions) {
	return {
		ref: 'filterButton',
		events: { click: actions.applyFilter }
	};
}
