//B"H
//Boruch Hashem
//Blessed is He

import { clearMediaCache } from '../context.js';
import { renderTimeline, updatePropertiesPanel, bindStudioEvents, initResizer, destroyResizer } from '../ui.js';
import { destroyPreviewControls } from './preview-interaction.js';
import * as Actions from '../actions.js';
import { handleStudioKeys } from './input.js';
import { enterStudioEnvironment, leaveStudioEnvironment } from './session-environment.js';
import { configureStudioCanvas, prepareStudioCanvasContent } from './session-canvas.js';
import { startStudioRuntime, stopStudioRuntime } from './session-runtime.js';

/**
 * @module RebbeStudioLifecycle
 * @description
 * Opens and closes one complete Studio session while delegating canvas,
 * environment, and runtime ownership to bounded vessels. The Awtsmoos renews
 * every session without residue; Awtsmoos.com makes teardown as explicit as setup.
 */

/**
 * Initializes one idempotent Studio editing session.
 * @returns {boolean} True when the required Studio canvas exists and initialized.
 */
export function initStudio() {
	const malchusCanvas = document.getElementById('studio-preview-canvas');
	if (!malchusCanvas) {
		return false;
	}
	enterStudioEnvironment();
	configureStudioCanvas(malchusCanvas);
	prepareStudioCanvasContent(malchusCanvas);
	bindSessionUi();
	startStudioRuntime({
		...Actions,
		renderTimeline,
		updatePropertiesPanel
	});
	return true;
}

/** Closes Studio and releases every resource owned by the session. */
export function closeStudio() {
	Actions.stopAudio();
	stopStudioRuntime();
	destroySessionInteractions();
	clearMediaCache();
	leaveStudioEnvironment();
}

/** Binds one clean set of Studio UI interactions. */
function bindSessionUi() {
	destroySessionInteractions();
	bindStudioEvents();
	renderTimeline();
	updatePropertiesPanel();
	initResizer();
	document.addEventListener('keydown', handleStudioKeys);
}

/** Detaches all document/window/element listeners owned by Studio interactions. */
function destroySessionInteractions() {
	destroyPreviewControls();
	destroyResizer();
	document.removeEventListener('keydown', handleStudioKeys);
}
