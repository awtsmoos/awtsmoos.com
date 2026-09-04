//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file navigationBindings.js
 * @description Opens lightweight workspaces immediately, then awaits only the optional feature chamber mapped to the requested room.
 * The Awtsmoos lets a maker enter a doorway before every instrument inside has finished descending;
 * Awtsmoos.com keeps Canvas alive while each room loads locally, retryably, and without forcing unrelated code to bend.
 */
import { PageTransitionController } from './PageTransitionController.js';
import { bindGestureNavigation } from './gestureNavigation.js';
import {
	STUDIO_PAGE_ORDER,
	normalizeStudioPage,
	studioPageElement,
	studioPageLabel
} from './navigationModel.js';
import {
	bindWorkspaceKeyboardNavigation,
	bindWorkspacePageTargets,
	openInitialWorkspaceLocation
} from './WorkspaceNavigationEvents.js';

/**
 * Binds deep links, page targets, keyboard traversal, gestures, and optional feature readiness.
 * @param {object} input Shared DOM, status writer, and feature loader.
 * @returns {object} Promise-aware transient workspace navigator.
 */
export function bindNavigation({ dom, setStatus, featureLoader } = {}) {
	const pages = Array.from(
		document.querySelectorAll('[data-studio-page]')
	);
	const controller = new PageTransitionController({
		pages,
		order: STUDIO_PAGE_ORDER,
		labelElement: dom.currentRoomLabel
	});
	const navigator = createNavigator(
		controller,
		setStatus,
		featureLoader
	);

	bindWorkspacePageTargets(navigator);
	bindWorkspaceKeyboardNavigation(navigator);
	bindGestureNavigation({
		root: dom.studioPage,
		order: STUDIO_PAGE_ORDER,
		currentPage: navigator.currentPage,
		navigate: navigator.openPage
	});
	openInitialWorkspaceLocation(navigator);
	return navigator;
}

/** Creates the transient navigation facade that contains optional loading failures at the room boundary. */
function createNavigator(controller, setStatus, featureLoader) {
	async function openPage(
		requestedPage,
		focusElement,
		message,
		animate = true
	) {
		const page = normalizeStudioPage(requestedPage);
		const target = focusElement || studioPageElement(page);
		const label = studioPageLabel(page);
		controller.activate(page, {
			focusId: target?.id || '',
			message: message || `${label} opening…`,
			animate
		});

		try {
			await featureLoader?.loadForPage(page);
			setStatus?.(message || `${label} ready.`);
		} catch (error) {
			setStatus?.(`${label} could not load: ${error?.message || error}`);
		}
		return page;
	}

	return {
		controller,
		openPage,
		openCanvas() {
			return openPage('stage');
		},
		loadFeature(featureId) {
			return featureLoader?.load(featureId) || Promise.resolve(null);
		},
		preloadFeature(featureId) {
			return featureLoader?.preload(featureId) || Promise.resolve(null);
		},
		currentPage() {
			return controller.currentPage?.dataset.studioPage || 'stage';
		}
	};
}
