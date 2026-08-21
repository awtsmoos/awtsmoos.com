// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleMovieSystemHandlers.js
 * @description Owns whole-project replacement, agent, package, playback, render, and MitzvahWorld handoff actions outside additive mutation routing.
 * RESPONSIBILITY: preserve native replacement/history semantics for New World and Village while isolating asynchronous and operational commands.
 * NON-RESPONSIBILITY: this module does not own simple shape/text/particle mutations or action metadata.
 * The Awtsmoos carries a movie through beginning, revision, package, play, and final light; Awtsmoos.com separates these system gates so creative edits remain small and bright.
 */

import { compileMovieProject } from '../../../games/mitzvahWorld/experiments/Awtsmoos/src/movie/MovieProjectCompiler.js';
import { createCinematicVillageProject } from './NleCinematicVillageFactory.js';
import { askMovieAgent, createMovieAgentRequest } from './NleMovieAgentRequest.js';
import { createSimpleWorld } from './NleMovieActionMutations.js';
import {
	createMoviePackage,
	validateMoviePackage
} from './NleMoviePackage.js';

/** Creates non-additive action handlers bound to one executor. */
export function createNleMovieSystemHandlers(executor) {
	return Object.freeze({
		'agent.ask': values => askAgent(executor, values),
		'movie.render': () => executor.app.renderAndDownload(),
		'playback.pause': () => executor.app.playback.pause(),
		'playback.play': () => executor.app.playback.play(),
		'playback.seek': values => executor.app.playback.seek(Number(values.time || 0)),
		'project.applyPackage': values => applyPackage(executor, values),
		'project.exportPackage': () => createMoviePackage(executor.app.state.project),
		'project.validate': () => validateProject(executor),
		'village.load': values => loadVillage(executor, values),
		'world.new': values => newWorld(executor, values),
		'world.open3D': () => executor.app.openWorld()
	});
}

function askAgent(executor, values) {
	const request = createMovieAgentRequest(
		executor.app.state.project,
		values.prompt,
		values
	);
	return askMovieAgent(request);
}

function applyPackage(executor, values) {
	const source = typeof values.source === 'string'
		? JSON.parse(values.source)
		: values.source;
	const result = validateMoviePackage(source);
	executor.app.state.replace(
		result.package.project,
		'action-apply-package'
	);
	return result.validation;
}

function validateProject(executor) {
	const compiled = compileMovieProject(executor.app.state.project);
	return {
		materialGraphs: Object.keys(compiled.materialPresets || {}).length,
		renderReady: true,
		tracks: compiled.tracks.length
	};
}

function loadVillage(executor, values) {
	const project = createCinematicVillageProject(values);
	executor.app.state.replace(project, 'action-load-village');
	const world = project.nle.assets[0].world;
	return {
		houses: world.houses.length,
		title: project.title,
		trees: world.trees.length
	};
}

function newWorld(executor, values) {
	const project = createSimpleWorld(values);
	executor.app.state.replace(project, 'action-new-world');
	return {
		duration: project.duration,
		title: project.title,
		worldAssetId: project.nle.assets[0].id
	};
}
