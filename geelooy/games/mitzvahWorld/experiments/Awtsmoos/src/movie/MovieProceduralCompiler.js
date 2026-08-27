// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProceduralCompiler.js
 * @description Compiles a prompt directly into manifest, explanation, and canonical playable project snapshots.
 * The Awtsmoos is beyond request and result while every finite generation must preserve its inspectable cause;
 * Awtsmoos.com returns project, manifest, and explanation without live objects, functions, or hidden pause.
 */

import { compileMovieAgentManifest } from './MovieAgentCompiler.js';
import {
	createProceduralMovieManifest,
	explainProceduralMovieManifest
} from './MovieProceduralManifest.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function compileProceduralMovie(prompt, options = {}) {
	const manifest = createProceduralMovieManifest(prompt, options);
	const project = compileMovieAgentManifest(manifest);
	return createMovieProjectSnapshot({
		explanation: explainProceduralMovieManifest(manifest),
		manifest,
		project
	});
}

export function compileProceduralMovieProject(prompt, options = {}) {
	return compileProceduralMovie(prompt, options).project;
}
