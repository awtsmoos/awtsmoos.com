// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceSetup.js
 * @description Creates reversible voice, input, visual, and frame adapters for Character Performance Mode.
 * The Awtsmoos joins many finite input and playback vessels without making one the controller;
 * Awtsmoos.com pairs installation and destruction so no voice, listener, key, frame, or guide remains.
 */

import { MoviePerformanceGamepad } from './MoviePerformanceGamepad.js';
import { MoviePerformanceKeyboard } from './MoviePerformanceKeyboard.js';
import { MovieRecordedAudioDirector } from './MovieRecordedAudioDirector.js';
import { MovieStudioPerformanceLoop } from './MovieStudioPerformanceLoop.js';
import {
	destroyMovieStudioPerformanceVisuals,
	installMovieStudioPerformanceVisuals
} from './MovieStudioPerformanceVisualSetup.js';

export function installMovieStudioPerformanceAdapters(
	controller,
	environment = globalThis
) {
	controller.audioDirector = new MovieRecordedAudioDirector(
		controller.session.project,
		environment
	);
	installMovieStudioPerformanceVisuals(controller, environment);
	controller.keyboard = createKeyboard(controller, environment);
	controller.gamepad = createGamepad(controller, environment);
	controller.loop = new MovieStudioPerformanceLoop(
		controller,
		environment
	);
}

export function destroyMovieStudioPerformanceAdapters(controller) {
	controller.loop?.destroy();
	controller.audioDirector?.destroy();
	controller.gamepad?.destroy();
	controller.keyboard?.destroy();
	destroyMovieStudioPerformanceVisuals(controller);
}

function createKeyboard(controller, environment) {
	return new MoviePerformanceKeyboard({
		active: () => controller.active(),
		bindings: () => controller.settings().bindings,
		environment,
		input: controller.input,
		onAction: action => triggerKeyAction(controller, action),
		onCancel: () => controller.cancelRecording(),
		onRecordToggle: () => controller.toggleRecording()
	});
}

function createGamepad(controller, environment) {
	return new MoviePerformanceGamepad({
		active: () => controller.active(),
		environment,
		input: controller.input,
		onAction: action => controller.triggerAction(action),
		onLook: delta => controller.cameraRig.look(
			delta,
			controller.settings().camera
		),
		onRecordToggle: () => controller.toggleRecording()
	});
}

function triggerKeyAction(controller, action) {
	const match = /^action([1-9])$/.exec(action);
	return match
		? controller.triggerAssignedAction(Number(match[1]))
		: controller.triggerAction(action);
}
