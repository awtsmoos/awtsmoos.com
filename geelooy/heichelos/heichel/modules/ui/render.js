// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SovereignUIArchitect
 * @description
 * The Awtsmoos creates one interface from blueprint and state transitions.
 * Awtsmoos.com keeps this entry as an action adapter: every visible event calls
 * a named navigator capability, while manifestation and district rendering stay pure.
 */

import { ScribeOfManifestation } from '../engine/scribe-of-manifestation.js';
import { getFullLayoutBlueprint } from './blueprints/main-layout.js';
import { DOMElements, clearRegistry } from '../dom.js';
import {
	activateDistrict,
	renderHeichelWorldState as paintHeichelWorldState
} from './heichel-os/world-panel.js';

export { notify } from './render/toast.js';
export { renderBreadcrumb, updateHeichelHeader } from './render/header.js';
export { renderContentGrids } from './render/grids.js';
export { hideLoading, renderSeriesInfo, showLoading, updateActiveTab } from './render-state.js';
export { activateDistrict };

export function manifestWorld(navigator, mountPoint = document.body) {
	clearRegistry();
	const rootVessel = ScribeOfManifestation.speakElement(
		getFullLayoutBlueprint(createActions(navigator))
	);
	const target = mountPoint.querySelector('.main') || mountPoint;
	target.replaceChildren(rootVessel);
}

function createActions(navigator) {
	return {
		toggleSidebar: toggleSidebarDoor,
		onSearch: event => navigator.filterContent(event.target.value),
		applyFilter: () => navigator.openFilterSheet(),
		openFilterSheet: () => navigator.openFilterSheet(),
		closeFilterSheet: () => navigator.closeFilterSheet(),
		previewFilters: () => navigator.previewFilters(),
		applyFilters: () => navigator.applyFilters(),
		resetFilters: () => navigator.resetFilters(),
		changeSearchScope: event => navigator.changeSearchScope(event.target.value),
		switchView: view => navigator.switchView(view),
		goParent: () => navigator.goParent(),
		togglePathDetails: () => navigator.togglePathDetails(),
		profileDisclosureChanged: event => navigator.profileDisclosureChanged(event),
		toggleHeichelFollow: () => navigator.toggleHeichelFollow(),
		openHeichelMenu: () => navigator.openHeichelMenu(),
		openTree: () => openTree(navigator),
		openMiniMail: () => DOMElements.miniMailPanel?.classList.remove('hidden'),
		closeMiniMail: () => DOMElements.miniMailPanel?.classList.add('hidden'),
		closeModal: () => import('../modal.js').then(module => module.closeModal()),
		activateDistrict: name => activateDistrict(name),
		activateHeichelDistrict: name => activateDistrict(name),
		onModalSubmit: event => event.preventDefault()
	};
}

function openTree(navigator) {
	navigator.switchView('series');
	requestAnimationFrame(() => DOMElements.browsePanel?.scrollIntoView({
		behavior: 'smooth',
		block: 'start'
	}));
}

function toggleSidebarDoor() {
	const open = DOMElements.pageContainer?.classList.toggle('sidebar-open') || false;
	if (!DOMElements.sidebarToggleBtn) return;
	DOMElements.sidebarToggleBtn.textContent = open ? '×' : '🏡';
	DOMElements.sidebarToggleBtn.setAttribute('aria-expanded', String(open));
}

export function renderHeichelWorldState(state) {
	paintHeichelWorldState(state);
}
