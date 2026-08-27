// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleMovieSimpleMutations.js
 * @description Adapts beginner Reel Studio action values into the native Mitzvah Movie Simple API without duplicating its project logic.
 * RESPONSIBILITY: create blank worlds, primitive shapes, text, particle presets, and friendly camera shots from visible form values.
 * NON-RESPONSIBILITY: this module does not own history, renderer state, village layout, or the underlying Movie Simple algorithms.
 * The Awtsmoos lets one intent cross editor and movie without division; Awtsmoos.com keeps Reel Studio thin so the same native creation law serves every vision.
 */

import { addMovieSimpleCameraShot } from '../../../games/mitzvahWorld/experiments/Awtsmoos/src/movie/MovieSimpleCamera.js';
import { addMovieSimpleParticles } from '../../../games/mitzvahWorld/experiments/Awtsmoos/src/movie/MovieSimpleParticles.js';
import {
	addMovieSimpleShape,
	createMovieSimpleProject
} from '../../../games/mitzvahWorld/experiments/Awtsmoos/src/movie/MovieSimpleProject.js';
import { addMovieSimpleText } from '../../../games/mitzvahWorld/experiments/Awtsmoos/src/movie/MovieSimpleText.js';

/** Creates one clean native Movie Project from the beginner New World form. */
export function createSimpleWorld(values = {}) {
	return createMovieSimpleProject({
		duration: finite(values.duration, 16),
		title: String(values.title || 'Untitled World'),
		world: {
			ground: String(values.ground || 'meadow'),
			sky: String(values.sky || 'golden-hour')
		}
	});
}

/** Adds one primitive using compact beginner position and uniform-size fields. */
export function addSimpleShape(project, shape, values = {}) {
	const size = Math.max(0.02, finite(values.size, shape === 'plane' ? 8 : 2));
	return addMovieSimpleShape(project, shape, {
		color: String(values.color || '#7cc8ff'),
		position: [
			finite(values.x, 0),
			finite(values.y, shape === 'plane' ? 0 : 1),
			finite(values.z, 0)
		],
		size: shape === 'plane'
			? [size, 0.1, size]
			: [size, size, size]
	});
}

/** Adds native and overlay text from the beginner text form. */
export function addSimpleText(project, values = {}) {
	return addMovieSimpleText(project, values.text, {
		color: values.color,
		duration: finite(values.duration, 3),
		start: finite(values.start, 0)
	});
}

/** Adds one existing bounded particle preset. */
export function addSimpleParticlePreset(project, values = {}) {
	return addMovieSimpleParticles(project, values.mode || 'fireflies', {
		count: finite(values.count, 180)
	});
}

/** Adds one friendly camera shot with default anchor handled by Movie Simple. */
export function addSimpleShot(project, values = {}) {
	return addMovieSimpleCameraShot(project, values.preset || 'wide', {
		duration: finite(values.duration, 4),
		start: finite(values.start, 0)
	});
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
