//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorkspaceNavigationEvents.js
 * @description Binds page-target clicks, keyboard traversal, and initial deep-link resolution around one transient workspace navigator.
 * The Awtsmoos lets many doors answer one movement law while the movie beneath remains a single editable light;
 * Awtsmoos.com keeps event choreography outside navigator identity, so each vessel stays small, readable, and right.
 */
import { STUDIO_PAGE_ORDER } from './navigationModel.js';

/**
 * Binds explicit page-target buttons and anchors to the supplied workspace navigator.
 * @param {object} navigator Transient workspace navigator.
 * @returns {void}
 */
export function bindWorkspacePageTargets(navigator) {
	document.querySelectorAll('[data-page-target]').forEach((element) => {
		element.addEventListener('click', (event) => {
			event.preventDefault();
			navigator.openPage(element.dataset.pageTarget);
		});
	});
}

/**
 * Binds Alt+Arrow workspace traversal without competing with ordinary editing keys.
 * @param {object} navigator Transient workspace navigator.
 * @returns {void}
 */
export function bindWorkspaceKeyboardNavigation(navigator) {
	window.addEventListener('keydown', (event) => {
		if (!event.altKey) {
			return;
		}

		if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) {
			return;
		}

		const currentIndex = STUDIO_PAGE_ORDER.indexOf(
			navigator.currentPage()
		);
		const direction = event.key === 'ArrowRight' ? 1 : -1;
		const nextIndex = Math.max(
			0,
			Math.min(STUDIO_PAGE_ORDER.length - 1, currentIndex + direction)
		);
		navigator.openPage(STUDIO_PAGE_ORDER[nextIndex]);
	});
}

/**
 * Opens the workspace addressed by the current URL fragment, falling back truthfully to Canvas.
 * @param {object} navigator Transient workspace navigator.
 * @returns {void}
 */
export function openInitialWorkspaceLocation(navigator) {
	const hashId = (location.hash || '').slice(1);
	const hashElement = hashId
		? document.getElementById(hashId)
		: null;
	const page = hashElement
		?.closest?.('[data-studio-page]')
		?.dataset.studioPage;

	navigator.openPage(
		page || 'stage',
		hashElement || undefined,
		undefined,
		false
	);
}
