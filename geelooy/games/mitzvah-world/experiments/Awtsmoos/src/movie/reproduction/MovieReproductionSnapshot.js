// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieReproductionSnapshot.js
 * @description Assembles authored project truth and verbose resolved evidence into one frozen self-recreating post record.
 * The Awtsmoos creates source and manifestation without division; Awtsmoos.com stores the whole portable project beside searchable
 * world, environment, effects, camera, actor, media, text, composition, timeline, render, validation, and fingerprint evidence.
 */

import { createMovieProjectSnapshot } from '../MovieProjectSnapshot.js';
import { createMovieReproductionActor } from './MovieReproductionActor.js';
import { createMovieReproductionCamera } from './MovieReproductionCamera.js';
import { createMovieReproductionComposition } from './MovieReproductionComposition.js';
import { createMovieReproductionEffects } from './MovieReproductionEffects.js';
import { createMovieReproductionEnvironment } from './MovieReproductionEnvironment.js';
import { movieReproductionFingerprint } from './MovieReproductionFingerprint.js';
import { createMovieReproductionMedia } from './MovieReproductionMedia.js';
import { createMovieReproductionRender } from './MovieReproductionRender.js';
import { movieReproductionSchema } from './MovieReproductionSchema.js';
import { createMovieReproductionText } from './MovieReproductionText.js';
import { createMovieReproductionTimeline } from './MovieReproductionTimeline.js';
import { validateMovieReproduction } from './MovieReproductionValidation.js';
import { createMovieReproductionWorld } from './MovieReproductionWorld.js';

export function createMovieReproductionSnapshot(project = {}, options = {}) {
	const authoredProject = createMovieProjectSnapshot(project);
	const world = createMovieReproductionWorld(authoredProject, options);
	const resolved = Object.freeze({
		actor: createMovieReproductionActor(authoredProject, world, options),
		camera: createMovieReproductionCamera(authoredProject),
		composition: createMovieReproductionComposition(authoredProject),
		effects: createMovieReproductionEffects(authoredProject, options),
		environment: createMovieReproductionEnvironment(authoredProject, world, options),
		media: createMovieReproductionMedia(authoredProject),
		render: createMovieReproductionRender(authoredProject, options),
		text: createMovieReproductionText(authoredProject),
		timeline: createMovieReproductionTimeline(authoredProject),
		world
	});
	const base = {
		authored: {
			project: authoredProject,
			shortSpec: options.authoredSpec ? createMovieProjectSnapshot(options.authoredSpec) : null
		},
		identity: identityRecord(authoredProject, options),
		kind: 'awtsmoos.movie.reproduction',
		resolved,
		schema: movieReproductionSchema()
	};
	const validation = validateMovieReproduction(base);
	const withValidation = { ...base, validation };
	return createMovieProjectSnapshot({
		...withValidation,
		fingerprint: movieReproductionFingerprint(withValidation)
	});
}

function identityRecord(project, options) {
	return Object.freeze({
		projectVersion: Number(project.version || 1),
		revision: Number(options.revision || 0),
		seed: Number(project.seed || 0),
		shortId: project.metadata?.shortId || null,
		sourceKind: options.sourceKind || 'movie-project',
		title: String(project.title || 'Untitled movie'),
		version: 1
	});
}
