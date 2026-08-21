// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleMovieNodeAdvancedActions.js
 * @description Keeps material, shader, and raw particle-graph authoring discoverable for expert Studio workflows without crowding beginner creation.
 * RESPONSIBILITY: define graph-authoring action metadata and the broader particle preset vocabulary.
 * NON-RESPONSIBILITY: this module does not execute graph creation, render nodes, or define world/project commands.
 * The Awtsmoos is beyond every node and edge while finite graphs channel color, atmosphere, and motion; Awtsmoos.com keeps that depth available after simple creation has found its devotion.
 */

import {
	movieAction,
	movieChoiceField,
	movieNumberField,
	movieTextField
} from './NleMovieActionFields.js';

const particleModes = [
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

export const NLE_MOVIE_NODE_ADVANCED_ACTIONS = Object.freeze([
	movieAction(
		'nodes.addMaterial',
		'addMaterialGraph',
		'Nodes',
		'Add material graph',
		'Create a canonical editable material graph.',
		[
			movieTextField('label', 'Label', 'Cinematic material'),
			movieTextField('color', 'Color', '#7b6a58'),
			movieNumberField('roughness', 'Roughness', 0.65, 0, 1)
		]
	),
	movieAction(
		'nodes.addShader',
		'addShaderGraph',
		'Nodes',
		'Add shader graph',
		'Create an editable atmosphere shader graph.',
		[movieTextField('label', 'Label', 'Cinematic atmosphere')]
	),
	movieAction(
		'nodes.addParticles',
		'addParticleGraph',
		'Nodes',
		'Add particle graph',
		'Create a deterministic editable particle graph.',
		[
			movieTextField('label', 'Label', 'Cinematic particles'),
			movieChoiceField('mode', 'Mode', 'fireflies', particleModes),
			movieNumberField('count', 'Count', 260, 1, 1200)
		]
	)
]);
