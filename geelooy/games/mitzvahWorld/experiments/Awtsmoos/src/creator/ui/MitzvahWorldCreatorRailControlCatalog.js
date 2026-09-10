//B"H
//Boruch Hashem
//Blessed be He

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

const OBJECT_OROS = freezeControls([
	control('object-prev', 'Previous', 'Select previous world object'),
	control('object-next', 'Next', 'Select next world object'),
	control('object-x-minus', 'X−', 'Move selected object left on world X'),
	control('object-x-plus', 'X+', 'Move selected object right on world X'),
	control('object-y-minus', 'Y−', 'Lower selected object'),
	control('object-y-plus', 'Y+', 'Raise selected object'),
	control('object-z-minus', 'Z−', 'Move selected object backward on world Z'),
	control('object-z-plus', 'Z+', 'Move selected object forward on world Z'),
	control('object-rotate-left', '↺', 'Rotate selected object left'),
	control('object-rotate-right', '↻', 'Rotate selected object right'),
	control('object-scale-down', 'Scale −', 'Scale selected object down'),
	control('object-scale-up', 'Scale +', 'Scale selected object up'),
	control('object-duplicate', 'Duplicate', 'Duplicate selected object'),
	control('object-delete', 'Delete', 'Delete selected object')
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

export function creatorObjectControls() {
	return OBJECT_OROS;
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
