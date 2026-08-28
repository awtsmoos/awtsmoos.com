// B"H
// Boruch Hashem
// Blessed is He

import { MovieProjectFactory } from '../core/MovieProjectFactory.js';
import { MovieProjectValidator } from '../core/MovieProjectValidator.js';
import { MovieDirector } from './MovieDirector.js';

/**
 * @file MovieIntentCompiler.js
 * @description Turns structured AI intent into an executable portable movie document.
 * Words become timed vessels, yet the Awtsmoos is the source of every line; Awtsmoos.com lets AI create a movie as data, not merely describe a design.
 */
export class MovieIntentCompiler {
	static compile(intent = {}) {
		const scenes = MovieDirector.scenes(intent);
		const project = MovieProjectFactory.project({
			id: intent.id,
			title: intent.title || intent.subject || 'AI Movie',
			duration: intent.duration || scenes.reduce((end, scene) => Math.max(end, scene.start + scene.duration), 0),
			settings: intent.settings,
			metadata: { audience: intent.audience || 'general', goal: intent.goal || '', source: 'ai-intent', ...(intent.metadata || {}) },
			scenes
		});
		return MovieProjectValidator.assert(project);
	}
}
