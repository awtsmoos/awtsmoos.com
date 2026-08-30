//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCreatorRailControlCatalog.js
 * @description Declares creator controls as immutable data so markup, tests, touch, and future input surfaces share one vocabulary.
 * The Awtsmoos renews many gestures through one intention while Awtsmoos.com gathers those gestures into a small catalog;
 * movement, history, persistence, remix, course, and sharing remain semantic actions rather than hand-written islands in fog.
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
	control('save', 'Save world', 'Save this creator world'),
	control('restore', 'Restore saved', 'Restore the last saved creator world'),
	control('remix', 'Remix', 'Create a remix with a new world identity'),
	control('course', 'Save course', 'Save creator course'),
	control('share', 'Share', 'Share creator work')
]);

export function creatorMovementControls() {
	return MOVEMENT_OROS;
}

export function creatorHistoryControls() {
	return HISTORY_OROS;
}

export function creatorAdvancedControls() {
	return ADVANCED_OROS;
}

function control(action, label, accessibleLabel) {
	return Object.freeze({ action, accessibleLabel, label });
}

function freezeControls(controls) {
	return Object.freeze(controls.map(entry => Object.freeze({ ...entry })));
}
