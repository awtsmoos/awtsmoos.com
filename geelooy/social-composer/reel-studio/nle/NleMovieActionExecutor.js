// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class NleMovieActionExecutor
 * @description
 * Every UI card and public method enters this one executor, so state history,
 * provider truth, canonical compilation, packages, playback, and output stay unified.
 */

import { compileMovieProject } from '../../../games/mitzvahWorld/experiments/Awtsmoos/src/movie/MovieProjectCompiler.js';
import { createCinematicVillageProject } from './NleCinematicVillageFactory.js';
import { askMovieAgent, createMovieAgentRequest } from './NleMovieAgentRequest.js';
import { movieActionById } from './NleMovieActionCatalog.js';
import {
	addCameraShot, addCharacterWalk, addHouse, addMaterial, addParticles, addShader, addTreeGrove
} from './NleMovieActionMutations.js';
import { createMoviePackage, validateMoviePackage } from './NleMoviePackage.js';

export class NleMovieActionExecutor {
	constructor(app) {
		this.app = app;
	}

	async invoke(id, values = {}) {
		if (!movieActionById(id)) throw new Error(`Unknown movie action: ${id}`);
		const handler = HANDLERS[id];
		if (!handler) throw new Error(`Movie action has no executor: ${id}`);
		return handler(this, values);
	}

	mutate(reason, mutation) {
		let result;
		this.app.state.mutate(reason, project => { result = mutation(project); });
		return result;
	}
}

const mutate = (reason, operation) => (executor, values) => executor.mutate(reason, project => operation(project, values));
const HANDLERS = Object.freeze({
	'agent.ask': async (executor, values) => askMovieAgent(createMovieAgentRequest(executor.app.state.project, values.prompt, values)),
	'camera.addShot': mutate('action-camera-shot', addCameraShot),
	'character.animateWalk': mutate('action-character-walk', addCharacterWalk),
	'movie.render': executor => executor.app.renderAndDownload(),
	'nodes.addMaterial': mutate('action-material-graph', addMaterial),
	'nodes.addParticles': mutate('action-particle-graph', addParticles),
	'nodes.addShader': mutate('action-shader-graph', addShader),
	'playback.pause': executor => executor.app.playback.pause(),
	'playback.play': executor => executor.app.playback.play(),
	'playback.seek': (executor, values) => executor.app.playback.seek(Number(values.time || 0)),
	'project.applyPackage': (executor, values) => {
		const value = typeof values.source === 'string' ? JSON.parse(values.source) : values.source;
		const result = validateMoviePackage(value);
		executor.app.state.replace(result.package.project, 'action-apply-package');
		return result.validation;
	},
	'project.exportPackage': executor => createMoviePackage(executor.app.state.project),
	'project.validate': executor => {
		const compiled = compileMovieProject(executor.app.state.project);
		return { materialGraphs: Object.keys(compiled.materialPresets || {}).length, renderReady: true, tracks: compiled.tracks.length };
	},
	'village.load': (executor, values) => {
		const project = createCinematicVillageProject(values);
		executor.app.state.replace(project, 'action-load-village');
		return { houses: project.nle.assets[0].world.houses.length, title: project.title, trees: project.nle.assets[0].world.trees.length };
	},
	'world.addHouse': mutate('action-add-house', addHouse),
	'world.addTreeGrove': mutate('action-add-tree-grove', addTreeGrove),
	'world.open3D': executor => executor.app.openWorld()
});
