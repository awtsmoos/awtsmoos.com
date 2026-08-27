// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSimpleProject.js
 * @description Creates a native empty Movie Project whose first visual clip is a generic cinematic world, then exposes pure object/world mutations for simple builders.
 * RESPONSIBILITY: establish NLE extension tracks, world visual witness, atmosphere configuration, existing-world binding, and generic shape insertion.
 * NON-RESPONSIBILITY: this module does not compile the project, render geometry, add text, particles, or camera shots.
 * The Awtsmoos creates possibility before village, actor, or asset is demanded; Awtsmoos.com gives Studio a valid native beginning where one shape may become a whole cinematic path.
 */

import { createEmptyMovieProject } from './MovieEmptyProject.js';
import { nextMovieSimpleId } from './MovieSimpleIds.js';
import { createMovieSimpleShape } from './MovieSimpleObjects.js';
import {
	addMovieSimpleClip,
	ensureMovieSimpleTrack
} from './MovieSimpleTracks.js';
import { ensureMovieSimpleWorld } from './MovieSimpleWorld.js';

/** Creates one valid native project with a generated cinematic world already on screen. */
export function createMovieSimpleProject(options = {}) {
	const project = createEmptyMovieProject(options);
	project.nle = {
		assets: [],
		version: 3
	};
	const world = configureMovieSimpleWorld(project, options.world || options);
	ensureMovieSimpleTrack(project, 'nle-audio', 'nle-audio');
	ensureMovieSimpleTrack(project, 'nle-overlay', 'nle-overlay');
	const visual = ensureMovieSimpleTrack(project, 'nle-visual', 'nle-visual');
	addMovieSimpleClip(visual, {
		assetId: world.id,
		duration: project.duration,
		id: `${world.id}-clip`,
		label: world.label,
		start: 0
	});
	return project;
}

/** Updates generated-world atmosphere or existing-world reference without replacing objects. */
export function configureMovieSimpleWorld(project, options = {}) {
	const asset = ensureMovieSimpleWorld(project, options);
	asset.label = String(options.label || asset.label || 'Generated cinematic world');
	asset.world.atmosphere = {
		ground: String(options.ground || asset.world.atmosphere?.ground || 'meadow'),
		sky: String(options.sky || asset.world.atmosphere?.sky || 'golden-hour')
	};
	return asset;
}

/** Adds one renderer-neutral primitive object to the generated cinematic world. */
export function addMovieSimpleShape(project, type, options = {}) {
	const asset = ensureMovieSimpleWorld(project);
	const id = String(options.id || nextMovieSimpleId(
		String(type || 'shape').toLowerCase(),
		asset.world.objects
	));
	const object = createMovieSimpleShape(type, options, id);
	asset.world.objects.push(object);
	return object;
}
