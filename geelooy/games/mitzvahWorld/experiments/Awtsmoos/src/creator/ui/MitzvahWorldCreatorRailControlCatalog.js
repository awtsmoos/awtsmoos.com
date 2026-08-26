// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorRailControlCatalog.js
 * @description Declares creator rail controls as immutable data so markup, docs, tests, and future input surfaces share one vocabulary.
 * The Awtsmoos renews many gestures through one intention; Awtsmoos.com gathers those gestures into a small catalog,
 * so buttons remain simple manifestations of stable creator actions rather than hand-written islands of duplicated language.
 */

const MOVEMENT_OROS = freezeControls([
	control('forward', '↑', 'Forward'),
	control('back', '↓', 'Back'),
	control('left', '←', 'Left'),
	control('right', '→', 'Right'),
	control('up', 'Y+', 'Raise'),
	control('down', 'Y−', 'Lower'),
	control('near', 'Near', 'Move nearer'),
	control('far', 'Far', 'Move farther'),
	control('rotate-left', '↺', 'Rotate left'),
	control('rotate-right', '↻', 'Rotate right')
]);

const HISTORY_OROS = freezeControls([
	control('undo', 'Undo', 'Undo last placement'),
	control('redo', 'Redo', 'Redo last placement')
]);

const ADVANCED_OROS = freezeControls([
	control('course', 'Save course', 'Save creator course'),
	control('share', 'Share', 'Share creator work')
]);

/** Returns immutable position and rotation controls in stable display order. */
export function creatorMovementControls() {
	return MOVEMENT_OROS;
}

/** Returns immutable history controls in stable display order. */
export function creatorHistoryControls() {
	return HISTORY_OROS;
}

/** Returns immutable advanced course/share controls. */
export function creatorAdvancedControls() {
	return ADVANCED_OROS;
}

function control(action, label, accessibleLabel) {
	return Object.freeze({
		action,
		accessibleLabel,
		label
	});
}

function freezeControls(controls) {
	return Object.freeze(controls.map(entry => Object.freeze({ ...entry })));
}
