// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioMarkup.js
 * @description Composes the semantic NLE shell with professional transport and utility surfaces.
 * The Awtsmoos renews every panel and beginning through one source; Awtsmoos.com gives
 * desktop and mobile the same program monitor, frame doors, shuttle rhythm, and project vessels.
 */

import { movieStudioInspectorMarkup } from './MovieStudioInspectorMarkup.js';
import {
	movieStudioStatusBarMarkup,
	movieStudioUtilitySurfacesMarkup,
	movieStudioUtilityToolbarMarkup
} from './MovieStudioUtilityMarkup.js';

export function movieStudioMarkup(project) {
	return `
		<header class="movie-studio-bar">
			<div class="movie-studio-brand"><strong>B"H MitzvahWorld Movie Maker</strong><span data-title>${escapeMovieMarkup(project.title)}</span></div>
			<button data-new-empty-project title="Create a blank project; the current project can be restored with Undo"><span aria-hidden="true">＋</span><span class="movie-secondary-label">Empty project</span></button>
			${movieStudioUtilityToolbarMarkup()}
			<button data-inspector-toggle aria-controls="movie-studio-inspector" aria-expanded="true"><span aria-hidden="true">☰</span><span class="movie-secondary-label">Inspector</span></button>
		</header>
		<main class="movie-studio-workspace" data-workspace>
			<section class="movie-studio-preview-column" aria-label="Program monitor">${moviePreviewMarkup()}</section>
			<div class="movie-studio-splitter movie-studio-splitter-inspector" data-inspector-splitter role="separator" aria-label="Resize inspector" aria-orientation="vertical" tabindex="0"></div>
			${movieStudioInspectorMarkup()}
		</main>
		<div class="movie-studio-splitter movie-studio-splitter-timeline" data-timeline-splitter role="separator" aria-label="Resize timeline" aria-orientation="horizontal" tabindex="0"></div>
		<section data-timeline aria-label="Movie timeline"></section>
		${movieStudioStatusBarMarkup()}
		${movieStudioUtilitySurfacesMarkup()}
	`;
}

function moviePreviewMarkup() {
	return `
		<div class="movie-studio-preview-stage" data-preview-stage><div class="movie-studio-preview-frame" data-preview-frame>
			<div class="movie-studio-preview" data-preview></div>
			<div class="movie-preview-overlay" data-preview-overlay aria-hidden="true"><i data-overlay="thirds"></i><i data-overlay="center"></i><i data-overlay="titleSafe"></i><i data-overlay="actionSafe"></i></div>
		</div></div>
		<div class="movie-studio-transport" aria-label="Program playback controls">
			<button data-transport-start aria-label="Go to start" title="Home">|◀</button>
			<button data-transport-step-back aria-label="Step back one frame" title="Left Arrow">◀|</button>
			<button data-transport-shuttle-back aria-label="Shuttle backward" title="J">◀◀</button>
			<button data-pause aria-label="Pause preview" title="K">Ⅱ</button>
			<button data-play aria-label="Play forward" title="L or Space">▶</button>
			<button data-transport-shuttle-forward aria-label="Shuttle forward" title="L">▶▶</button>
			<button data-transport-step-forward aria-label="Step forward one frame" title="Right Arrow">|▶</button>
			<button data-transport-end aria-label="Go to end" title="End">▶|</button>
			<output class="movie-transport-rate" data-transport-rate aria-live="polite">Paused</output>
		</div>
		<div class="movie-studio-status" data-status role="status" aria-live="polite">Ready.</div>
	`;
}

function escapeMovieMarkup(value) {
	return String(value || '').replace(/[&<>"']/g, character => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	})[character]);
}
