// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleMovieCreationActions.js
 * @description Defines the tiny beginner-facing creation vocabulary used by the new retractable Create and Shots surfaces.
 * RESPONSIBILITY: describe blank worlds, primitives, text, particle presets, and camera shots through the same catalog records that generate the public API.
 * NON-RESPONSIBILITY: this file does not execute commands or expose advanced package/node/village maintenance actions.
 * The Awtsmoos creates worlds through simple speech before complexity unfolds; Awtsmoos.com lets Create begin with a few luminous verbs while all deeper power remains behind the folds.
 */

import {
	movieAction,
	movieChoiceField,
	movieNumberField,
	movieTextField
} from './NleMovieActionFields.js';

const skies = ['golden-hour', 'day', 'dusk', 'night', 'void'];
const grounds = ['meadow', 'sand', 'stone', 'snow', 'water', 'void'];
const particles = [
	'fireflies',
	'mist',
	'dust',
	'sparks',
	'embers',
	'rain',
	'snow',
	'pollen',
	'leaves',
	'magic'
];
const cameras = [
	'wide',
	'closeUp',
	'lowAngle',
	'highAngle',
	'overhead',
	'dollyIn',
	'sideTrack',
	'orbitLeft',
	'orbitRight',
	'craneReveal',
	'aerialPullback'
];

export const NLE_MOVIE_CREATION_ACTIONS = Object.freeze([
	movieAction(
		'world.new',
		'newWorld',
		'Start',
		'New world',
		'Begin a clean cinematic world without loading a village or existing MitzvahWorld location.',
		[
			movieTextField('title', 'Movie title', 'Untitled World'),
			movieNumberField('duration', 'Duration', 16, 2, 300),
			movieChoiceField('sky', 'Sky', 'golden-hour', skies),
			movieChoiceField('ground', 'Ground', 'meadow', grounds)
		]
	),
	...['box', 'sphere', 'cylinder', 'plane'].map(shape => primitiveAction(shape)),
	movieAction(
		'text.addSimple',
		'addText',
		'Text & FX',
		'Add text',
		'Place clean cinematic text on the native title and Studio overlay tracks.',
		[
			movieTextField('text', 'Text', 'B"H'),
			movieNumberField('start', 'Start', 0, 0, 900),
			movieNumberField('duration', 'Duration', 3, 0.1, 120),
			movieTextField('color', 'Color', '#ffffff')
		]
	),
	movieAction(
		'particles.addPreset',
		'addParticlePreset',
		'Text & FX',
		'Add particles',
		'Add a deterministic cinematic particle preset to the current generated world.',
		[
			movieChoiceField('mode', 'Preset', 'fireflies', particles),
			movieNumberField('count', 'Count', 180, 12, 640)
		]
	),
	movieAction(
		'camera.addSimpleShot',
		'addShot',
		'Shots',
		'Add camera shot',
		'Add an editable native camera clip using a friendly cinematic preset.',
		[
			movieChoiceField('preset', 'Camera', 'wide', cameras),
			movieNumberField('start', 'Start', 0, 0, 900),
			movieNumberField('duration', 'Duration', 4, 0.1, 120)
		]
	)
]);

function primitiveAction(shape) {
	const label = shape.charAt(0).toUpperCase() + shape.slice(1);
	return movieAction(
		`world.add${label}`,
		`add${label}`,
		'Shapes',
		`Add ${shape}`,
		`Add one editable ${shape} to the generated cinematic world.`,
		[
			movieNumberField('x', 'X', 0),
			movieNumberField('y', 'Y', shape === 'plane' ? 0 : 1),
			movieNumberField('z', 'Z', 0),
			movieNumberField('size', 'Size', shape === 'plane' ? 8 : 2, 0.02, 100),
			movieTextField('color', 'Color', '#7cc8ff')
		]
	);
}
