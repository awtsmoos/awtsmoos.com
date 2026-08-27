// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleMovieMutationHandlers.js
 * @description Maps additive simple, village, camera, and graph actions into the executor's single history-aware mutation gateway.
 * RESPONSIBILITY: bind stable action ids to pure project operations and provide concise reasons for undo/history receipts.
 * NON-RESPONSIBILITY: this module does not replace whole projects, call AI, render, control playback, or validate packages.
 * The Awtsmoos renews each edit without severing the prior frame; Awtsmoos.com sends every additive command through one history gate so easy creation never abandons its name.
 */

import {
	addCameraShot,
	addCharacterWalk,
	addHouse,
	addMaterial,
	addParticles,
	addShader,
	addSimpleParticlePreset,
	addSimpleShape,
	addSimpleShot,
	addSimpleText,
	addTreeGrove
} from './NleMovieActionMutations.js';

/** Creates additive action handlers bound to one executor. */
export function createNleMovieMutationHandlers(executor) {
	return Object.freeze({
		'camera.addShot': mutate(executor, 'action-camera-shot', addCameraShot),
		'camera.addSimpleShot': mutate(executor, 'action-simple-shot', addSimpleShot),
		'character.animateWalk': mutate(executor, 'action-character-walk', addCharacterWalk),
		'nodes.addMaterial': mutate(executor, 'action-material-graph', addMaterial),
		'nodes.addParticles': mutate(executor, 'action-particle-graph', addParticles),
		'nodes.addShader': mutate(executor, 'action-shader-graph', addShader),
		'particles.addPreset': mutate(executor, 'action-simple-particles', addSimpleParticlePreset),
		'text.addSimple': mutate(executor, 'action-simple-text', addSimpleText),
		'world.addBox': shape(executor, 'box'),
		'world.addCylinder': shape(executor, 'cylinder'),
		'world.addHouse': mutate(executor, 'action-add-house', addHouse),
		'world.addPlane': shape(executor, 'plane'),
		'world.addSphere': shape(executor, 'sphere'),
		'world.addTreeGrove': mutate(executor, 'action-add-tree-grove', addTreeGrove)
	});
}

function mutate(executor, reason, operation) {
	return values => {
		return executor.mutate(reason, project => {
			return operation(project, values);
		});
	};
}

function shape(executor, type) {
	return values => {
		return executor.mutate(`action-add-${type}`, project => {
			return addSimpleShape(project, type, values);
		});
	};
}
