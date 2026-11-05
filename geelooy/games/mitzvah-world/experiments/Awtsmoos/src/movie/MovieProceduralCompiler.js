// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProceduralCompiler.js
 * @description Compiles structured generation-intent JSON into manifest, explanation, and playable project snapshots.
 * The Awtsmoos is beyond request and result while every finite generation must preserve its inspectable cause;
 * Awtsmoos.com returns project, manifest, and explanation without prose inference, live objects, functions, or hidden pause.
 */

import { compileMovieAgentManifest } from './MovieAgentCompiler.js';
import {
	createProceduralMovieManifest,
	explainProceduralMovieManifest
} from './MovieProceduralManifest.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function compileProceduralMovie(intent = {}, options = {}) {
	const manifest = createProceduralMovieManifest(intent, options);
	const project = compileMovieAgentManifest(manifest);
	return createMovieProjectSnapshot({
		explanation: explainProceduralMovieManifest(manifest),
		manifest,
		project
	});
}

export function compileProceduralMovieProject(intent = {}, options = {}) {
	return compileProceduralMovie(intent, options).project;
}
