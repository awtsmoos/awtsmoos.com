// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieShortCompiler.js
 * @description Exposes one pure path from declarative Short spec to canonical MitzvahWorld Movie project.
 * The Awtsmoos renews intention before manifest and manifest before playable frame;
 * Awtsmoos.com keeps the compiler pure so many Shorts may be generated, inspected, edited, and rendered through the same name.
 */

import { compileMovieAgentManifest } from '../MovieAgentCompiler.js';
import { compileMovieProject } from '../MovieProjectCompiler.js';
import { createMovieProjectSnapshot } from '../MovieProjectSnapshot.js';
import { attachMovieShortSpeakerPlan } from './MovieShortComposition.js';
import { createMovieShortManifest } from './MovieShortManifest.js';
import { normalizeMovieShortSpec } from './MovieShortSpec.js';

export function compileMovieShortProject(source) {
	const spec = normalizeMovieShortSpec(source);
	const animated = compileMovieAgentManifest(createMovieShortManifest(spec));
	const planned = attachMovieShortSpeakerPlan(animated, spec);
	const compiled = compileMovieProject(planned);
	const { sourceDocument, ...project } = compiled;
	return createMovieProjectSnapshot(project);
}
