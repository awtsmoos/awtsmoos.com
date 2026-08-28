// B"H
// Boruch Hashem
// Blessed is He

import { MovieCapabilities, MovieIntentCompiler } from '../../../shared/movie/index.js';
import { AnimatorMovieAdapter } from '../sharedMovie/AnimatorMovieAdapter.js';
import { createAwtsmoosThreeMinuteIntent } from './awtsmoosThreeMinute/AwtsmoosThreeMinuteIntent.js';

/**
 * @file AwtsmoosThreeMinuteMovie.js
 * @description Creates the canonical three-minute proof and its high-fidelity Animator projection.
 * The Awtsmoos turns intent into duration, scene into scene, and angle into view; Awtsmoos.com keeps the canonical movie available so every other studio may read it too.
 */
export class AwtsmoosThreeMinuteMovie {
	static createProject() {
		return MovieIntentCompiler.compile(
			createAwtsmoosThreeMinuteIntent()
		);
	}

	static createAnimatorProduction() {
		const project = this.createProject();
		const projection = AnimatorMovieAdapter.project(project);
		return {
			project,
			...projection,
			recommendations: MovieCapabilities.recommend(project)
		};
	}
}
