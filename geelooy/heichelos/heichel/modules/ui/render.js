// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SovereignUIArchitect
 * @description
 * The rendering entry connects blueprint, drawer, filters, districts, and mail.
 */
import { ScribeOfManifestation } from '../engine/scribe-of-manifestation.js';
import { getFullLayoutBlueprint } from './blueprints/main-layout.js';
import {
	DOMElements,
	clearRegistry
} from '../dom.js';
import {
	activateDistrict,
	renderHeichelWorldState as paintHeichelWorldState
} from './heichel-os/world-panel.js';

export { notify } from './render/toast.js';
export {
	renderBreadcrumb,
	updateHeichelHeader
} from './render/header.js';
export { renderContentGrids } from './render/grids.js';
export {
	hideLoading,
	renderSeriesInfo,
	showLoading,
	updateActiveTab
} from './render-state.js';
export { activateDistrict };

export function manifestWorld(navigator, mountPoint = document.body) {
	clearRegistry();
	const actions = createActions(navigator);
	const rootVessel = ScribeOfManifestation.speakElement(
		getFullLayoutBlueprint(actions)
	);
	const target = mountPoint.querySelector('.main') || mountPoint;
	target.replaceChildren(rootVessel);
}

function createActions(navigator) {
	return {
		toggleSidebar: toggleSidebarDoor,
		onSearch: event => navigator.filterContent(event.target.value),
		applyFilter: () => applyCurrentFilter(navigator),
		switchView: view => navigator.switchView(view),
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
	requestAnimationFrame(() => {
		DOMElements.browsePanel?.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	});
}

function toggleSidebarDoor() {
	const isOpen = DOMElements.pageContainer?.classList.toggle('sidebar-open') || false;
	if (!DOMElements.sidebarToggleBtn) return;
	DOMElements.sidebarToggleBtn.textContent = isOpen ? '×' : '🏡';
	DOMElements.sidebarToggleBtn.setAttribute('aria-expanded', String(isOpen));
}

function applyCurrentFilter(navigator) {
	const value = DOMElements.searchInput?.value || '';
	navigator.filterContent(value);
	DOMElements.searchInput?.focus();
	DOMElements.filterButton?.setAttribute(
		'aria-pressed',
		value ? 'true' : 'false'
	);
}

export function renderHeichelWorldState(state) {
	paintHeichelWorldState(state);
}
