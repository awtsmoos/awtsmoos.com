// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioHeaderMarkup.js
 * @description Keeps essential rendering and view controls visible while placing secondary project actions behind one calm disclosure.
 * The Awtsmoos renews the whole craft without crowding the eye; Awtsmoos.com leaves
 * render, timeline, inspector, and the living title in front while lesser doors wait nearby.
 */

import { movieStudioUtilityToolbarMarkup } from './MovieStudioUtilityMarkup.js';

export function movieStudioHeaderMarkup(project, facts) {
	return `
		<header class="movie-studio-bar movie-studio-bar-compact" data-studio-toolbar>
			<div class="movie-studio-brand movie-studio-identity">
				<span class="movie-studio-kicker">B"H · MitzvahWorld</span>
				<strong data-title>${escapeMovieHeaderText(project.title)}</strong>
				<span data-project-meta>${facts.width}×${facts.height} · ${facts.fps} fps · ${facts.duration}s</span>
			</div>
			<div class="movie-studio-primary-actions" aria-label="Essential movie actions">
				<button data-render title="Render the movie"><span aria-hidden="true">⬢</span><span class="movie-secondary-label">Render</span></button>
				<button data-render-exact title="Render the exact deterministic movie"><span aria-hidden="true">◆</span><span class="movie-secondary-label">Exact</span></button>
				<button data-timeline-toggle aria-expanded="false" title="Expand the timeline"><span aria-hidden="true">▤</span><span class="movie-secondary-label">Timeline</span></button>
				<button class="movie-inspector-toggle" data-inspector-toggle aria-controls="movie-studio-inspector" aria-expanded="false" title="Open inspector"><span aria-hidden="true">☰</span><span class="movie-secondary-label">Inspector</span></button>
			</div>
			<details class="movie-studio-more-actions">
				<summary aria-label="More movie actions">More</summary>
				<div class="movie-studio-more-surface">
					<div class="movie-studio-secondary-actions" aria-label="Project and media actions">
						<button data-new-empty-project aria-describedby="movie-empty-project-note" title="Create an Empty project">Empty project</button>
						<span id="movie-empty-project-note" class="movie-sr-only">The current project can be restored with Undo.</span>
						<button data-copy-url title="Copy a shareable movie link">Share</button>
						<button data-record title="Record the current movie">Record</button>
						<button data-import-image title="Import a local image">Image</button>
						<button data-import-audio title="Import local audio">Audio</button>
					</div>
					${movieStudioUtilityToolbarMarkup()}
				</div>
			</details>
		</header>
	`;
}

function escapeMovieHeaderText(value) {
	return String(value || '').replace(/[&<>"']/g, character => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	})[character]);
}
