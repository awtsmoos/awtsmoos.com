// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NlePublicApi
 * @description
 * Legacy playback and output methods delegate to the catalog action API, proving
 * that old callers, new agents, and visible controls execute the same implementation.
 */

import { createNleAiPublicApi } from './NleAiPublicApi.js';

export function publishNleMovieApi(app) {
	const actions = app.actionApi;
	const api = {
		actions,
		ai: createNleAiPublicApi(app),
		get project() { return app.state.project; },
		get ready() { return true; },
		get runtime() {
			return {
				kind: 'social-nle',
				preview: app.compositor,
				worldRenderer: app.compositor.worldRenderer || null
			};
		},
		director: {
			get time() { return app.state.playhead; },
			pause: () => actions.pause(),
			play: () => actions.play(),
			seek: time => actions.seek({ time })
		},
		openWorld: () => actions.openWorld(),
		pause: () => actions.pause(),
		play: () => actions.play(),
		recorder: app.recorder,
		render: options => options ? app.recorder.render(options) : actions.render(),
		seek: time => actions.seek({ time }),
		studio: app
	};
	globalThis.AwtsmoosMovie = Object.freeze(api);
	return api;
}
