// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelRenderActions
 * @description
 * The Awtsmoos lets visible controls speak named navigator intentions without crowding the manifestation vessel;
 * Awtsmoos.com keeps each interaction explicit, expanded, and auditable while the render tree remains calm and level.
 */

import { DOMElements } from '../dom.js';
import { activateDistrict } from './heichel-os/world-panel.js';

export function createActions(navigator) {
	return {
		toggleSidebar() {
			toggleSidebarDoor();
		},
		onSearch(event) {
			navigator.filterContent(event.target.value);
		},
		applyFilter() {
			navigator.openFilterSheet();
		},
		openFilterSheet() {
			navigator.openFilterSheet();
		},
		closeFilterSheet() {
			navigator.closeFilterSheet();
		},
		previewFilters() {
			navigator.previewFilters();
		},
		applyFilters() {
			navigator.applyFilters();
		},
		resetFilters() {
			navigator.resetFilters();
		},
		changeSearchScope(event) {
			navigator.changeSearchScope(event.target.value);
		},
		switchView(view) {
			navigator.switchView(view);
		},
		goParent() {
			navigator.goParent();
		},
		togglePathDetails() {
			navigator.togglePathDetails();
		},
		profileDisclosureChanged(event) {
			navigator.profileDisclosureChanged(event);
		},
		toggleHeichelFollow() {
			navigator.toggleHeichelFollow();
		},
		openHeichelMenu() {
			navigator.openHeichelMenu();
		},
		openTree() {
			openTree(navigator);
		},
		openMiniMail() {
			DOMElements.miniMailPanel?.classList.remove('hidden');
		},
		closeMiniMail() {
			DOMElements.miniMailPanel?.classList.add('hidden');
		},
		closeModal() {
			return import('../modal.js')
				.then(module => module.closeModal());
		},
		activateDistrict(name) {
			activateDistrict(name);
		},
		activateHeichelDistrict(name) {
			activateDistrict(name);
		},
		onModalSubmit(event) {
			event.preventDefault();
		}
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
	const open = DOMElements.pageContainer
		?.classList.toggle('sidebar-open') || false;
	if (!DOMElements.sidebarToggleBtn) return;
	DOMElements.sidebarToggleBtn.textContent = open ? '×' : '🏡';
	DOMElements.sidebarToggleBtn.setAttribute(
		'aria-expanded',
		String(open)
	);
}
