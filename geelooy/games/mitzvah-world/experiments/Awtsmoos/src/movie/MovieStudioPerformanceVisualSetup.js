// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceVisualSetup.js
 * @description Installs and destroys touch, view, pointer-look, and projected acting-aid adapters.
 * The Awtsmoos lets many visible guides share one preview without divided ownership;
 * Awtsmoos.com creates touch before discovery, then pairs panel, path, cue, and cleanup in rhyme.
 */

import { MoviePerformancePointerLook } from './MoviePerformancePointerLook.js';
import { movieStudioPerformanceTouchMarkup } from './MovieStudioPerformanceMarkup.js';
import { MovieStudioPerformanceOverlay } from './MovieStudioPerformanceOverlay.js';
import { MovieStudioPerformanceTouch } from './MovieStudioPerformanceTouch.js';
import { MovieStudioPerformanceView } from './MovieStudioPerformanceView.js';

export function installMovieStudioPerformanceVisuals(
	controller,
	environment
) {
	const document = environment.document || globalThis.document;
	const preview = controller.session.view.preview;
	const touchRoot = createTouchRoot(preview, document);
	controller.view = new MovieStudioPerformanceView(
		controller,
		controller.session.view.root
	);
	controller.overlay = new MovieStudioPerformanceOverlay(
		controller,
		preview
	);
	controller.touch = new MovieStudioPerformanceTouch(
		controller,
		touchRoot
	);
	controller.pointerLook = new MoviePerformancePointerLook({
		active: () => controller.active(),
		element: preview,
		onLook: delta => controller.cameraRig.look(
			delta,
			controller.settings().camera
		)
	});
}

export function destroyMovieStudioPerformanceVisuals(controller) {
	controller.pointerLook?.destroy();
	controller.touch?.destroy();
	controller.overlay?.destroy();
	controller.view?.destroy();
}

function createTouchRoot(preview, document) {
	if (!document?.createElement) {
		throw new Error('PERFORMANCE_DOCUMENT_UNAVAILABLE');
	}
	const template = document.createElement('template');
	template.innerHTML = movieStudioPerformanceTouchMarkup().trim();
	const root = template.content.firstElementChild;
	if (!root) {
		throw new Error('PERFORMANCE_TOUCH_MARKUP_INVALID');
	}
	preview.append(root);
	return root;
}
