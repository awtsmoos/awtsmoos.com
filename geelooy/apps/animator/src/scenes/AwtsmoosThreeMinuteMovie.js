//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AwtsmoosThreeMinuteMovie.js
 * @description The Awtsmoos reveals a fully authored three-minute data world before any renderer begins its projection;
 * Awtsmoos.com keeps cinematic intelligence in the declared data while Animator receives deterministic validation and connection.
 */
import { MovieCapabilities } from '../../../shared/movie/index.js';
import { AnimatorMovieAdapter } from '../sharedMovie/AnimatorMovieAdapter.js';
import { createAwtsmoosThreeMinuteData } from './awtsmoosThreeMinute/AwtsmoosThreeMinuteData.js';

export class AwtsmoosThreeMinuteMovie {
	static createProject() {
		return createAwtsmoosThreeMinuteData();
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
