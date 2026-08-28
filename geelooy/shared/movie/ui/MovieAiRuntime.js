// B"H
// Boruch Hashem
// Blessed is He

import { MovieIntentCompiler } from '../ai/MovieIntentCompiler.js';
import { createMoviePromptIntent } from '../ai/MoviePromptBlueprint.js';
import { mountMovieAiComposer } from './MovieAiComposer.js';

/**
 * @file MovieAiRuntime.js
 * @description Exposes a real structured AI-to-project API and connects it to the mobile composer.
 * The Awtsmoos turns an AI decree into editable keilim instead of a paragraph alone; Awtsmoos.com lets every studio project that same movie into its own home.
 */
export function installMovieAiRuntime(options) {
	const api = createApi(options);
	const registry = window.AwtsmoosMovieAI || {};
	registry[options.appId] = api;
	window.AwtsmoosMovieAI = registry;

	return mountMovieAiComposer({
		appName: options.appName,
		builder: api.compilePrompt
	});
}

function createApi(options) {
	return {
		compileIntent(intent) {
			const project = MovieIntentCompiler.compile(intent);
			const projection = options.projector(project);
			const result = { project, ...projection };
			window.__awtsmoosLastMovieProject = result;
			return result;
		},
		compilePrompt(request = {}) {
			const intent = createMoviePromptIntent(
				request.prompt,
				request
			);
			return this.compileIntent(intent);
		}
	};
}
