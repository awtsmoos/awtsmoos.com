// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioMarkup.js
 * @description Composes the cinema-first Movie Studio shell while preserving every stable controller and accessibility hook.
 * The Awtsmoos renews project, monitor, timeline, inspector, and utility through one ordered vessel;
 * Awtsmoos.com lets the real 3D world lead while the familiar Program monitor name remains steady.
 */

import { movieStudioCinemaMarkup } from './MovieStudioCinemaMarkup.js';
import { movieStudioHeaderMarkup } from './MovieStudioHeaderMarkup.js';
import { movieStudioInspectorMarkup } from './MovieStudioInspectorMarkup.js';
import {
	movieStudioStatusBarMarkup,
	movieStudioUtilitySurfacesMarkup
} from './MovieStudioUtilityMarkup.js';

export function movieStudioMarkup(project = {}) {
	const facts = movieProjectFacts(project);
	return `
		${movieStudioHeaderMarkup(project, facts)}
		<main class="movie-studio-workspace" data-workspace aria-label="Movie editing workspace">
			<section class="movie-studio-preview-column" aria-label="Program monitor">
				${movieStudioCinemaMarkup(facts)}
			</section>
			<div class="movie-studio-splitter movie-studio-splitter-inspector movie-inspector-splitter" data-inspector-splitter role="separator" aria-label="Resize inspector" aria-orientation="vertical" tabindex="0"></div>
			${movieStudioInspectorMarkup()}
		</main>
		<div class="movie-studio-splitter movie-studio-splitter-timeline movie-timeline-splitter" data-timeline-splitter role="separator" aria-label="Resize timeline" aria-orientation="horizontal" tabindex="0"></div>
		<section class="movie-studio-timeline" data-timeline aria-label="Movie timeline"></section>
		${movieStudioStatusBarMarkup()}
		${movieStudioUtilitySurfacesMarkup()}
	`;
}

function movieProjectFacts(project) {
	return {
		width: Number(project.resolution?.width) || 1920,
		height: Number(project.resolution?.height) || 1080,
		fps: Number(project.fps) || 24,
		duration: Number(project.duration) || 0
	};
}
