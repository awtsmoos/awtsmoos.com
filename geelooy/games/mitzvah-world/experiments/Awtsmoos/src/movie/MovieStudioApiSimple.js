// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiSimple.js
 * @description Exposes world, shape, text, particle, and shot creation as undoable Studio-session verbs over the same pure native Simple Movie helpers.
 * RESPONSIBILITY: clone the live project, apply one focused mutation, validate/commit through Studio history, and return immutable created/project evidence.
 * NON-RESPONSIBILITY: this domain does not render, bypass command history, or invent a second beginner-only document format.
 * The Awtsmoos joins simple speech with deep action; Awtsmoos.com lets one Studio word become a normal revision so beginner ease and expert history share one fraction.
 */

import {
	addMovieSimpleCameraShot,
	listMovieSimpleCameraPresets
} from './MovieSimpleCamera.js';
import { createMovieSimpleBuilder } from './MovieSimpleBuilder.js';
import {
	addMovieSimpleParticles,
	listMovieSimpleParticlePresets
} from './MovieSimpleParticles.js';
import {
	addMovieSimpleShape,
	configureMovieSimpleWorld,
	createMovieSimpleProject
} from './MovieSimpleProject.js';
import { addMovieSimpleText } from './MovieSimpleText.js';
import {
	compileMovieProjectSnapshot,
	replaceMovieStudioProject
} from './MovieStudioApiProjectTools.js';
import {
	cloneMovieProjectSnapshot,
	createMovieProjectSnapshot
} from './MovieProjectSnapshot.js';

/** Creates the small, history-safe authoring domain published as `AwtsmoosMovie.simple`. */
export function createMovieStudioSimpleDomain(session) {
	return Object.freeze({
		builder: options => createMovieSimpleBuilder(options),
		cameraPresets: () => listMovieSimpleCameraPresets(),
		compile: () => compileMovieProjectSnapshot(session.project),
		create: (options = {}) => replaceMovieStudioProject(
			session,
			createMovieSimpleProject(options),
			'Create simple cinematic world'
		),
		particlePresets: () => listMovieSimpleParticlePresets(),
		particles: (preset, options = {}) => mutate(
			session,
			`Add ${preset} particles`,
			project => addMovieSimpleParticles(project, preset, options)
		),
		shape: (type, options = {}) => mutate(
			session,
			`Add ${type} shape`,
			project => addMovieSimpleShape(project, type, options)
		),
		shot: (preset, options = {}) => mutate(
			session,
			`Add ${preset} camera shot`,
			project => addMovieSimpleCameraShot(project, preset, options)
		),
		text: (value, options = {}) => mutate(
			session,
			'Add simple cinematic text',
			project => addMovieSimpleText(project, value, options)
		),
		world: (options = {}) => mutate(
			session,
			'Configure simple cinematic world',
			project => configureMovieSimpleWorld(project, options)
		)
	});
}

function mutate(session, label, action) {
	const project = cloneMovieProjectSnapshot(session.project);
	const created = action(project);
	const committed = replaceMovieStudioProject(session, project, label);
	return createMovieProjectSnapshot({
		created,
		project: committed
	});
}
