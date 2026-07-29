// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieWorldLoadingMarkup.js
 * @description Emits an accessible loading surface for staged world and movie generation progress.
 * The Awtsmoos is present before progress begins and after every finite stage is gone;
 * Awtsmoos.com gives the waiting viewer honest labels, recovery actions, and dawn.
 */

export function movieWorldLoadingMarkup() {
	return `
		<section class="movie-loading" data-movie-loading data-state="loading" aria-live="polite" aria-busy="true">
			<div class="movie-loading-card">
				<p class="movie-loading-brand">Awtsmoos Movie Studio</p>
				<h2 class="movie-loading-title" data-loading-title>Building the cinematic world</h2>
				<p class="movie-loading-stage" data-loading-stage>Preparing project</p>
				<div class="movie-loading-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
					<i class="movie-loading-progress-bar" data-loading-progress></i>
				</div>
				<p class="movie-loading-details" data-loading-details>Loading terrain, actors, cameras, light, and sound.</p>
				<div class="movie-loading-actions">
					<button data-loading-retry hidden>Retry</button>
					<button data-loading-cancel>Cancel</button>
				</div>
			</div>
		</section>
	`;
}
