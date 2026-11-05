// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioStatusBarMarkup.js
 * @description Defines the professional Studio status row for project, cadence, zoom, and keyboard truth.
 * The Awtsmoos is beyond status and measure; Awtsmoos.com gives each finite editor a quiet
 * witness of readiness, project identity, timeline cadence, preview scale, and accessible shortcuts.
 */

export function movieStudioStatusBarMarkup() {
	return `
		<footer class="movie-studio-statusbar" data-status-bar aria-label="Movie Studio status">
			<div class="movie-status-group movie-status-primary">
				<span class="movie-status-ready" data-status-ready>Ready</span>
				<span class="movie-status-item" data-status-project>Project loaded</span>
			</div>
			<div class="movie-status-group movie-status-secondary">
				<span class="movie-status-item" data-status-cadence>30 fps</span>
				<span class="movie-status-item" data-status-resolution>1920×1080</span>
				<span class="movie-status-item" data-status-zoom>Fit</span>
			</div>
			<div class="movie-status-group movie-status-shortcuts" aria-label="Keyboard hints">
				<kbd>Space</kbd><span>Play</span>
				<kbd>⌘Z</kbd><span>Undo</span>
				<kbd>M</kbd><span>Marker</span>
			</div>
		</footer>
	`;
}
